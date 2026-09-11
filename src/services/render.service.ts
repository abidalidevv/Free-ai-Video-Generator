import { env } from "../api/env";
import { endpoints } from "../api/endpoints";
import { del, get, post } from "../utils/request";
import type { TaskRequest } from "../types/requests";
import type { TaskResponse, OutputResponse } from "../types/responses";
import type { TaskStatus, RenderStage } from "../types/api";

/**
 * MoneyPrinterTurbo Render Service:
 * - submit -> POST /api/v1/videos (maps TaskRequest to TaskVideoRequest)
 * - get -> GET /api/v1/tasks/{id} (maps state: 1 -> 'succeeded', 4 -> 'running', -1 -> 'failed')
 * - list -> GET /api/v1/tasks
 * - remove -> DELETE /api/v1/tasks/{id}
 */
export const renderService = {
  list: async (signal?: AbortSignal): Promise<TaskResponse[]> => {
    const res = await get<any>(endpoints.tasks, { signal });
    const taskList = res?.tasks ?? (Array.isArray(res) ? res : []);
    return taskList.map((t: any) => mapMptTaskToTaskResponse(t));
  },

  get: async (id: string, signal?: AbortSignal): Promise<TaskResponse> => {
    const res = await get<any>(endpoints.taskById(id), { signal });
    return mapMptTaskToTaskResponse(res);
  },

  submit: async (body: TaskRequest, idempotencyKey?: string): Promise<TaskResponse> => {
    // Map TaskRequest to exact MPT TaskVideoRequest (VideoParams):
    const mptPayload = {
      video_subject: body.videoSubject ?? "",
      video_script: body.videoScript ?? "",
      video_terms: body.videoTerms ?? [],
      video_aspect: body.videoAspect ?? "9:16",
      video_concat_mode: "random",
      video_clip_duration: body.videoClipDurationSec ?? 5,
      video_source: body.videoSource ?? "pexels",
      video_materials: body.videoMaterials && body.videoMaterials.length > 0
        ? body.videoMaterials.map(m => ({ provider: m.provider || "local", url: m.url, duration: m.duration || 0 }))
        : undefined,
      voice_name: body.voiceName ?? "",
      voice_volume: body.voiceVolume ?? 1.0,
      voice_rate: body.voiceRate ?? 1.0,
      bgm_type: body.bgmType ?? "random",
      bgm_file: body.bgmFile ?? "",
      bgm_volume: body.bgmVolume ?? 0.2,
      subtitle_enabled: body.subtitleEnabled ?? true,
      font_name: body.fontName ?? "STHeitiMedium.ttc",
      text_fore_color: body.textForeColor ?? "#FFFFFF",
      font_size: body.fontSize ?? 60,
      stroke_color: body.strokeColor ?? "#000000",
      stroke_width: body.strokeWidth ?? 1.5,
      n_threads: 2,
      paragraph_number: 1,
    };

    // MPT endpoint for video creation is POST /api/v1/videos
    const createUrl = (endpoints as any).createVideo || "/videos";
    const res = await post<any>(createUrl, mptPayload, {
      headers: idempotencyKey ? { "Idempotency-Key": idempotencyKey } : undefined,
    });
    return mapMptTaskToTaskResponse(res);
  },

  cancel: async (id: string): Promise<TaskResponse> => {
    return {
      id,
      status: "cancelled",
      stage: "done",
      progress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },

  retry: async (id: string, idempotencyKey?: string): Promise<TaskResponse> => {
    const previous = await renderService.get(id);
    const prevParams = (previous as any).request ?? {};
    return renderService.submit(prevParams, idempotencyKey);
  },

  remove: (id: string) => del<void>(endpoints.taskById(id)),

  outputs: async (signal?: AbortSignal): Promise<OutputResponse[]> => {
    const tasks = await renderService.list(signal);
    return tasks
      .filter((t) => t.status === "succeeded" && t.output)
      .map((t) => t.output!);
  },

  output: async (id: string, signal?: AbortSignal): Promise<OutputResponse> => {
    const task = await renderService.get(id, signal);
    if (!task.output) {
      throw new Error(`Task ${id} has no completed video output`);
    }
    return task.output;
  },

  removeOutput: (id: string) => del<void>(endpoints.taskById(id)),
};

/**
 * Maps MPT Task response dictionary to VideoForge TaskResponse:
 * MPT: { task_id, state, progress, videos, combined_videos, params }
 * state: 1 = complete, 4 = processing, -1 = failed
 * progress: 0..100
 */
function mapMptTaskToTaskResponse(raw: any): TaskResponse {
  if (!raw) {
    return {
      id: "",
      status: "queued",
      stage: "init",
      progress: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  const taskId = raw.task_id ?? raw.id ?? "";
  const stateInt = raw.state;
  let status: TaskStatus = "running";
  let stage: RenderStage = "encode";

  if (stateInt === 1) {
    status = "succeeded";
    stage = "done";
  } else if (stateInt === -1) {
    status = "failed";
    stage = "encode";
  } else if (stateInt === 4) {
    status = "running";
    stage = "encode";
  } else if (raw.status) {
    status = raw.status;
  }

  const rawProgress = raw.progress ?? 0;
  const progressFloat = rawProgress > 1 ? rawProgress / 100 : rawProgress;

  const videos: string[] = raw.videos ?? raw.combined_videos ?? [];
  let outputResponse: OutputResponse | undefined = undefined;

  if (videos.length > 0 || status === "succeeded") {
    let taskRelativePath = `${taskId}/final-1.mp4`;
    if (videos.length > 0 && typeof videos[0] === "string") {
      const normalized = videos[0].replace(/\\/g, "/");
      const idx = normalized.indexOf(taskId);
      if (idx !== -1) {
        taskRelativePath = normalized.substring(idx);
      } else {
        const parts = normalized.split("/");
        const filename = parts[parts.length - 1] || "final-1.mp4";
        taskRelativePath = `${taskId}/${filename}`;
      }
    }

    const streamUrl = `${env.apiBaseUrl}/stream/${taskRelativePath}`;
    const downloadUrl = `${env.apiBaseUrl}/download/${taskRelativePath}`;

    outputResponse = {
      id: taskId,
      taskId,
      name: `${raw.params?.video_subject || raw.script?.slice(0, 30) || "VideoForge Render"} (${taskId.slice(0, 8)})`,
      url: streamUrl,
      downloadUrl,
      durationSec: raw.audio_duration || 15,
      sizeBytes: 0,
      width: 1080,
      height: 1920,
      createdAt: new Date().toISOString(),
    };
  }

  return {
    id: taskId,
    status,
    stage,
    progress: status === "succeeded" ? 1.0 : progressFloat,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    error: raw.error,
    request: raw.params,
    output: outputResponse,
  };
}
