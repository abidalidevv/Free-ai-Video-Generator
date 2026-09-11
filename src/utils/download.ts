import { apiClient } from "../api/client";
import { toast } from "sonner";

/**
 * Downloads a video file from MoneyPrinterTurbo backend.
 * Uses apiClient with authentication headers (x-api-key if set)
 * and initiates native browser file download.
 */
export async function downloadVideoFile(url: string, filename = "render-output.mp4"): Promise<void> {
  if (!url) {
    toast.error("Download URL is not available");
    return;
  }

  const toastId = toast.loading(`Starting download for ${filename}...`);
  try {
    const response = await apiClient.get(url, {
      responseType: "blob",
    });

    const blob = new Blob([response.data], { type: "video/mp4" });
    const objectUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(objectUrl);

    toast.success(`Downloaded ${filename}`, { id: toastId });
  } catch (err: any) {
    console.warn("Direct blob download failed, falling back to browser direct link:", err);
    try {
      // Fallback: direct browser navigation to download route
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`Opening download in browser`, { id: toastId });
    } catch (fallbackErr: any) {
      toast.error(`Download failed: ${err?.message || "Network error"}`, { id: toastId });
    }
  }
}
