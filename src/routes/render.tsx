import { toast } from "sonner";
import { useState, useEffect } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { renderService } from "../services/render.service";
import { downloadVideoFile } from "@/utils/download";
import type { Output } from "@/types";
import { useTask } from "../hooks/useTask";
import { useAppState } from "../store/app-state";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Play, Loader2, ListVideo, CheckCircle2, AlertCircle, RefreshCw, Download, Film } from "lucide-react";

export const Route = createFileRoute("/render")({
  component: RenderPage,
});

function RenderPage() {
  const navigate = useNavigate();
  const { state, dispatch } = useAppState();


  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Poll MPT task status every 1.5s
  const { data: taskData, isLoading: isTaskLoading, error: taskError, refetch } = useTask(activeTaskId);

  // Automatically save completed output into client storage & app state
  useEffect(() => {
    if (taskData?.status === "succeeded" && taskData.output && activeTaskId) {
      const existing = state.recentOutputs.find((o) => o.id === activeTaskId);
      if (!existing) {
        const newOutput: Output = {
          id: activeTaskId,
          projectId: state.currentProject?.id || "project-default",
          name: taskData.output.name || `${state.currentProject?.name || "Render"} (${activeTaskId.slice(0, 8)})`,
          durationSec: taskData.output.durationSec || 15,
          fileSizeBytes: taskData.output.sizeBytes || 0,
          resolution: "1080p",
          format: "mp4",
          createdAt: new Date().toISOString(),
          filePath: taskData.output.url,
          downloadUrl: taskData.output.downloadUrl,
        };
        dispatch({ type: "SAVE_OUTPUT", payload: newOutput });
      }
    }
  }, [taskData?.status, activeTaskId]);

  // Handle active task status updates
  useEffect(() => {
    if (taskData?.status === "succeeded") {
      console.log("Video generation completed:", taskData.output?.url);
    }
  }, [taskData?.status, taskData?.output?.url]);


  const handleAddToQueue = () => {
    const scriptText = state.currentScript?.text || "Welcome to VideoForge AI batch render.";
    const rawKeywords = state.currentKeywords || [];
    const keywords = rawKeywords.map((k: any) => (typeof k === "string" ? k : k.text));

    const voiceName =
      state.selectedVoice?.name ||
      state.audioSettings?.voiceId ||
      "en-US-GuyNeural-Male";

    let bgmType: "none" | "custom" | "random" = "random";
    let bgmFile = "";
    if (state.audioSettings?.bgmMode === "none") {
      bgmType = "none";
    } else if (state.audioSettings?.bgmTrackId) {
      bgmType = "custom";
      bgmFile = String(state.audioSettings.bgmTrackId);
    }

    const videoSource = state.videoSettings?.source || "pexels";
    let videoMaterials: { provider?: string; url: string; duration?: number }[] | undefined = undefined;
    if (videoSource === "local" && state.videoSettings?.selectedMaterials?.length) {
      videoMaterials = state.videoSettings.selectedMaterials.map((file) => ({
        provider: "local",
        url: file,
        duration: 0,
      }));
    }

    const taskRequest = {
      videoSubject: state.currentProject?.name || `Render Job ${Date.now().toString().slice(-4)}`,
      videoScript: scriptText,
      videoTerms: keywords,
      videoAspect: (state.videoSettings?.aspectRatio as any) || "9:16",
      videoClipDurationSec: 5,
      videoSource,
      videoMaterials,
      voiceName,
      voiceVolume: state.audioSettings?.volume ?? 1.0,
      voiceRate: state.audioSettings?.speed ?? 1.0,
      bgmType,
      bgmFile,
      bgmVolume: state.audioSettings?.bgmVolume ?? 0.2,
      fontName: state.subtitleSettings?.fontFamily || "STHeitiMedium.ttc",
      fontSize: state.subtitleSettings?.fontSize || 60,
      textForeColor: state.subtitleSettings?.color || "#FFFFFF",
      strokeColor: state.subtitleSettings?.strokeColor || "#000000",
      strokeWidth: state.subtitleSettings?.strokeWidth ?? 1.5,
      subtitleEnabled: state.subtitleSettings?.enabled ?? true,
    };

    const newJob = {
      id: `qjob_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      projectId: state.currentProject?.id || "proj-default",
      projectName: state.currentProject?.name || "VideoForge Render Job",
      status: "queued" as const,
      progress: 0,
      taskRequest,
      aspectRatio: state.videoSettings?.aspectRatio || "9:16",
    };

    dispatch({ type: "ENQUEUE_RENDER", payload: newJob });
    toast.success(`Enqueued "${newJob.projectName}" to batch render queue`);
  };

  const handleStartRender = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // Gather script text and keywords from app-state
      const scriptText = state.currentScript?.text || "";
      const rawKeywords = state.currentKeywords || [];
      const keywords = rawKeywords.map((k: any) => (typeof k === "string" ? k : k.text));

      // Resolve voice name: priority selectedVoice > audioSettings > default
      const voiceName =
        state.selectedVoice?.name ||
        state.audioSettings?.voiceId ||
        "en-US-GuyNeural-Male";

      // Resolve BGM mode & file:
      let bgmType: "none" | "custom" | "random" = "random";
      let bgmFile = "";
      if (state.audioSettings?.bgmMode === "none") {
        bgmType = "none";
      } else if (state.audioSettings?.bgmTrackId) {
        bgmType = "custom";
        bgmFile = String(state.audioSettings.bgmTrackId);
      }

      // Check if local video source is selected
      const videoSource = state.videoSettings?.source || "pexels";
      let videoMaterials: { provider?: string; url: string; duration?: number }[] | undefined = undefined;
      if (videoSource === "local" && state.videoSettings?.selectedMaterials?.length) {
        videoMaterials = state.videoSettings.selectedMaterials.map((file) => ({
          provider: "local",
          url: file,
          duration: 0,
        }));
      }

      // Dispatch to real MPT /api/v1/videos
      const taskResponse = await renderService.submit({
        videoSubject: state.currentProject?.name || "VideoForge AI Video",
        videoScript: scriptText,
        videoTerms: keywords,
        videoAspect: (state.videoSettings?.aspectRatio as any) || "9:16",
        videoClipDurationSec: 5,
        videoSource,
        videoMaterials,
        voiceName,
        voiceVolume: state.audioSettings?.volume ?? 1.0,
        voiceRate: state.audioSettings?.speed ?? 1.0,
        bgmType,
        bgmFile,
        bgmVolume: state.audioSettings?.bgmVolume ?? 0.2,
        fontName: state.subtitleSettings?.fontFamily || "STHeitiMedium.ttc",
        fontSize: state.subtitleSettings?.fontSize || 60,
        textForeColor: state.subtitleSettings?.color || "#FFFFFF",
        strokeColor: state.subtitleSettings?.strokeColor || "#000000",
        strokeWidth: state.subtitleSettings?.strokeWidth ?? 1.5,
        subtitleEnabled: state.subtitleSettings?.enabled ?? true,
      });

      if (taskResponse?.id) {
        setActiveTaskId(taskResponse.id);
      } else {
        throw new Error("No task ID returned from MoneyPrinterTurbo");
      }
    } catch (err: any) {
      console.error("Render dispatch failed:", err);
      setErrorMessage(err?.response?.data?.message || err.message || "Failed to start render task");
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentStatus = taskData?.status || (activeTaskId ? "running" : "idle");
  const progressPercent = Math.round((taskData?.progress ?? 0) * 100);

  return (
    <div className="container mx-auto p-6 max-w-5xl space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Render & Output</h1>
        <p className="text-muted-foreground">
          Render your video using MoneyPrinterTurbo backend pipeline.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column: Controls & Progress */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Render Pipeline</CardTitle>
              <CardDescription>
                Send project parameters to MPT task scheduler
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!activeTaskId ? (
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleStartRender}
                    disabled={isSubmitting}
                    className="flex-1"
                    size="lg"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Starting Render...
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-5 w-5" />
                        Start Real Render
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleAddToQueue}
                    variant="secondary"
                    className="flex-1"
                    size="lg"
                  >
                    <ListVideo className="mr-2 h-5 w-5 text-primary" />
                    Add to Queue
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Task ID:</span>
                    <Badge variant="outline" className="font-mono text-xs">
                      {activeTaskId}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Status:</span>
                    <Badge
                      variant={
                        currentStatus === "succeeded"
                          ? "default"
                          : currentStatus === "failed"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {currentStatus}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Progress</span>
                      <span>{progressPercent}%</span>
                    </div>
                    <Progress value={progressPercent} />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => refetch()}
                      disabled={isTaskLoading}
                    >
                      <RefreshCw className="mr-1 h-3 w-3" /> Refresh
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveTaskId(null)}
                    >
                      Reset
                    </Button>
                  </div>
                </div>
              )}

              {errorMessage && (
                <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                  <AlertCircle className="h-4 w-4" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Video Preview */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Video Preview</CardTitle>
              <CardDescription>
                {taskData?.status === "succeeded"
                  ? "Real video streamed from MPT /api/v1/stream"
                  : "Final video player"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {taskData?.output?.url ? (
                <>
                  <div className="aspect-[9/16] max-w-[360px] mx-auto rounded-lg overflow-hidden border bg-black shadow-md">
                    <video
                      src={taskData.output.url}
                      controls
                      autoPlay
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex gap-2 justify-center mt-4">
                    <Button
                      onClick={() =>
                        downloadVideoFile(
                          taskData.output?.downloadUrl || taskData.output?.url || "",
                          `${taskData.output?.name || "video"}.mp4`
                        )
                      }
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" /> Download Video
                    </Button>
                    <Link to="/outputs">
                      <Button variant="outline" className="flex items-center gap-2">
                        <Film className="h-4 w-4" /> View in Outputs
                      </Button>
                    </Link>
                  </div>
                </>
              ) : (
                <div className="aspect-[9/16] max-w-[360px] mx-auto rounded-lg border border-dashed flex flex-col items-center justify-center p-6 text-center text-muted-foreground bg-muted/20">
                  {currentStatus === "running" ? (
                    <>
                      <Loader2 className="h-8 w-8 animate-spin mb-2 text-primary" />
                      <p className="text-sm font-medium">Rendering in progress...</p>
                      <p className="text-xs">{progressPercent}% complete</p>
                    </>
                  ) : currentStatus === "succeeded" ? (
                    <>
                      <CheckCircle2 className="h-8 w-8 mb-2 text-primary" />
                      <p className="text-sm font-medium">Video ready!</p>
                    </>
                  ) : (
                    <p className="text-sm">Video preview will appear once render completes.</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
