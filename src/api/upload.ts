/**
 * Reusable upload utilities with progress callback + abort support.
 * Single source of truth for client-side size/MIME validation.
 */

import { apiClient } from "./client";
import { endpoints } from "./endpoints";
import { env } from "./env";
import type { UploadResponse } from "../types/responses";

export type UploadKind = "video" | "audio" | "image" | "subtitle" | "project";

const ACCEPTED_MIME: Record<UploadKind, RegExp> = {
  video: /^video\//,
  audio: /^audio\//,
  image: /^image\//,
  subtitle: /^(application\/x-subrip|text\/vtt|text\/plain)$/,
  project: /^(application\/json|application\/zip)$/,
};

export interface UploadOptions {
  kind: UploadKind;
  file: File;
  onProgress?: (pct: number, loaded: number, total: number) => void;
  signal?: AbortSignal;
}

export interface UploadValidationError {
  field: "size" | "mime";
  message: string;
}

export function validateUpload(kind: UploadKind, file: File): UploadValidationError | null {
  if (file.size > env.uploadLimit) {
    return { field: "size", message: `File exceeds limit of ${Math.round(env.uploadLimit / (1024 * 1024))} MB` };
  }
  if (!ACCEPTED_MIME[kind].test(file.type)) {
    return { field: "mime", message: `Unsupported file type ${file.type || "unknown"} for ${kind}` };
  }
  return null;
}

export async function uploadFile({ kind, file, onProgress, signal }: UploadOptions): Promise<UploadResponse> {
  const v = validateUpload(kind, file);
  if (v) throw new Error(v.message);

  const form = new FormData();
  form.append("kind", kind);
  form.append("file", file, file.name);

  const res = await apiClient.post<UploadResponse>(endpoints.upload, form, {
    headers: { "Content-Type": "multipart/form-data" },
    signal,
    onUploadProgress: (e) => {
      if (!onProgress) return;
      const total = e.total ?? file.size;
      const pct = total > 0 ? Math.round((e.loaded / total) * 100) : 0;
      onProgress(pct, e.loaded, total);
    },
  });
  return res.data;
}
