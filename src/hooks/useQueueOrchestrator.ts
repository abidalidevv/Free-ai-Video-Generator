import { useEffect, useRef, useState, useCallback } from "react";
import { useAppState } from "@/store/app-state";
import { renderService } from "@/services/render.service";
import { projectStorageService } from "@/services/project-storage.service";
import { toast } from "sonner";
import type { RenderTask, Output } from "@/types";

const MAX_CONCURRENCY = 1; // Orderly serial dispatch to prevent Windows MoviePy tempfile collisions
const POLL_INTERVAL_MS = 1500;

export function useQueueOrchestrator() {
  const { state, dispatch } = useAppState();
  const [isQueueRunning, setIsQueueRunning] = useState(true);
  const inFlightSubmissions = useRef<Set<string>>(new Set());
  const isPollingRef = useRef(false);
  const hasReconciled = useRef(false);

  // 1. Startup reconciliation on mount: match local queue against real MPT backend tasks
  useEffect(() => {
    if (hasReconciled.current) return;
    hasReconciled.current = true;

    async function reconcileOnStartup() {
      try {
        const mptTasks = await renderService.list();
        const mptMap = new Map<string, any>();
        for (const t of mptTasks) {
          if (t.id) mptMap.set(t.id, t);
        }

        const currentQueue = projectStorageService.listQueue();
        if (currentQueue.length === 0) return;

        let changed = false;
        const reconciled = currentQueue.map((job) => {
          // If a job was marked dispatching when browser closed but has no mptTaskId, revert to queued
          if (job.status === "dispatching" && !job.mptTaskId) {
            changed = true;
            return { ...job, status: "queued" as const };
          }

          if (job.mptTaskId && mptMap.has(job.mptTaskId)) {
            const mpt = mptMap.get(job.mptTaskId);
            if (mpt.status === "succeeded" && job.status !== "completed") {
              changed = true;
              return {
                ...job,
                status: "completed" as const,
                progress: 100,
                outputUrl: mpt.output?.url,
                downloadUrl: mpt.output?.downloadUrl,
                completedAt: job.completedAt || new Date().toISOString(),
              };
            }
            if (mpt.status === "failed" && job.status !== "failed") {
              changed = true;
              return {
                ...job,
                status: "failed" as const,
                errorMessage: mpt.error || "MPT render failed",
              };
            }
            if (mpt.status === "running" && job.status !== "rendering") {
              changed = true;
              return {
                ...job,
                status: "rendering" as const,
                progress: Math.round((mpt.progress || 0) * 100),
              };
            }
          }
          return job;
        });

        if (changed) {
          dispatch({ type: "SET_RENDER_QUEUE", payload: reconciled });
        }
      } catch (err) {
        console.warn("Queue reconciliation skipped (backend offline):", err);
      }
    }

    reconcileOnStartup();
  }, [dispatch]);

  // 2. Main processing & polling loop
  useEffect(() => {
    const timer = setInterval(async () => {
      if (isPollingRef.current) return;
      isPollingRef.current = true;

      try {
        const queue = state.renderQueue;

        // Count actively running or dispatching jobs
        const activeJobs = queue.filter(
          (t) =>
            t.status === "dispatching" ||
            t.status === "rendering" ||
            t.status === "preparing" ||
            t.status === "encoding"
        );

        // A. Poll actively running MPT jobs
        for (const job of activeJobs) {
          if (!job.mptTaskId) continue;
          try {
            const mptTask = await renderService.get(job.mptTaskId);

            if (mptTask.status === "succeeded") {
              const outputUrl = mptTask.output?.url;
              const downloadUrl = mptTask.output?.downloadUrl;
              dispatch({
                type: "UPDATE_RENDER",
                payload: {
                  id: job.id,
                  patch: {
                    status: "completed",
                    progress: 100,
                    outputUrl,
                    downloadUrl,
                    completedAt: new Date().toISOString(),
                  },
                },
              });

              // Save to Output Library if not existing
              if (outputUrl) {
                const newOutput: Output = {
                  id: job.mptTaskId,
                  projectId: job.projectId || "project-default",
                  name: job.projectName,
                  durationSec: mptTask.output?.durationSec || 15,
                  fileSizeBytes: mptTask.output?.sizeBytes || 0,
                  resolution: "1080p",
                  format: "mp4",
                  createdAt: new Date().toISOString(),
                  filePath: outputUrl,
                  downloadUrl,
                };
                projectStorageService.saveOutput(newOutput);
                dispatch({ type: "SAVE_OUTPUT", payload: newOutput });
              }

              toast.success(`Batch Render Complete: ${job.projectName}`);
            } else if (mptTask.status === "failed") {
              dispatch({
                type: "UPDATE_RENDER",
                payload: {
                  id: job.id,
                  patch: {
                    status: "failed",
                    errorMessage: mptTask.error || "Render task failed on MPT engine",
                  },
                },
              });
              toast.error(`Render Failed: ${job.projectName}`);
            } else if (mptTask.status === "running") {
              const prog = Math.round((mptTask.progress || 0) * 100);
              if (prog !== job.progress) {
                dispatch({
                  type: "UPDATE_RENDER",
                  payload: {
                    id: job.id,
                    patch: {
                      status: "rendering",
                      progress: prog,
                    },
                  },
                });
              }
            }
          } catch (pollErr: any) {
            // Transient network warning
            console.warn(`Polling MPT task ${job.mptTaskId}:`, pollErr.message);
          }
        }

        // B. Dispatch next queued jobs if capacity available and queue is active
        if (isQueueRunning && activeJobs.length < MAX_CONCURRENCY) {
          const nextQueued = queue.find(
            (t) => t.status === "queued" && !inFlightSubmissions.current.has(t.id)
          );

          if (nextQueued && nextQueued.taskRequest) {
            const jobId = nextQueued.id;
            inFlightSubmissions.current.add(jobId);

            dispatch({
              type: "UPDATE_RENDER",
              payload: {
                id: jobId,
                patch: {
                  status: "dispatching",
                  startedAt: new Date().toISOString(),
                  progress: 0,
                },
              },
            });

            try {
              const res = await renderService.submit(nextQueued.taskRequest);
              if (res?.id) {
                dispatch({
                  type: "UPDATE_RENDER",
                  payload: {
                    id: jobId,
                    patch: {
                      status: "rendering",
                      mptTaskId: res.id,
                      progress: 5,
                    },
                  },
                });
              } else {
                throw new Error("No task ID returned by MoneyPrinterTurbo");
              }
            } catch (submitErr: any) {
              const errMsg =
                submitErr?.response?.data?.message ||
                submitErr?.message ||
                "Failed to dispatch to MPT backend";
              dispatch({
                type: "UPDATE_RENDER",
                payload: {
                  id: jobId,
                  patch: {
                    status: "failed",
                    errorMessage: errMsg,
                  },
                },
              });
              toast.error(`Submission failed for ${nextQueued.projectName}: ${errMsg}`);
            } finally {
              inFlightSubmissions.current.delete(jobId);
            }
          }
        }
      } finally {
        isPollingRef.current = false;
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [isQueueRunning, state.renderQueue, dispatch]);

  const toggleQueueRunning = useCallback(() => {
    setIsQueueRunning((prev) => {
      const next = !prev;
      toast.info(next ? "Render queue resumed" : "Render queue paused");
      return next;
    });
  }, []);

  return {
    isQueueRunning,
    toggleQueueRunning,
    maxConcurrency: MAX_CONCURRENCY,
  };
}
