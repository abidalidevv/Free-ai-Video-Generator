import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader, PrimaryButton, GhostButton, Input, Pill } from "@/components/app-shell";
import { EmptyState } from "@/components/shared";
import { videoService } from "@/services/video.service";
import { queryKeys } from "@/api/query-keys";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { formatBytes } from "@/lib/render-pipeline";
import { toast } from "sonner";
import {
  Search, Upload, Filter, Music2, Image as ImageIcon, FileVideo, Layers,
  Download, RefreshCcw, Loader2, Info, Film,
} from "lucide-react";
import { useState, useMemo, useRef } from "react";
import type { VideoMaterial } from "@/types";

export const Route = createFileRoute("/assets")({
  head: () => ({ meta: [{ title: "Assets Library — VideoForge AI" }] }),
  component: AssetsPage,
});

const tabs = [
  { k: "videos", l: "Videos", icon: FileVideo },
  { k: "images", l: "Images", icon: ImageIcon },
  { k: "audio", l: "Audio", icon: Music2 },
  { k: "music", l: "Music", icon: Music2 },
  { k: "overlays", l: "Overlays", icon: Layers },
  { k: "stock", l: "Stock Videos", icon: Download },
] as const;

function AssetsPage() {
  const [tab, setTab] = useState("videos");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"newest" | "name" | "size">("newest");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  // Query live MPT video materials
  const { data: materials = [], isLoading, isError, refetch } = useQuery({
    queryKey: queryKeys.videoMaterials,
    queryFn: ({ signal }) => videoService.listMaterials(signal),
  });

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (200MB for video, 20MB for image)
    const isImage = /\.(jpg|jpeg|png)$/i.test(file.name);
    const maxBytes = isImage ? 20 * 1024 * 1024 : 200 * 1024 * 1024;
    if (file.size > maxBytes) {
      toast.error(`File exceeds limit of ${isImage ? "20 MB" : "200 MB"}`);
      e.target.value = "";
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading(`Uploading ${file.name} to MoneyPrinterTurbo...`);
    try {
      const res = await videoService.uploadMaterial(file, (pct) => {
        toast.loading(`Uploading ${file.name} (${pct}%)...`, { id: toastId });
      });
      toast.success(`Uploaded ${file.name} successfully!`, { id: toastId });
      queryClient.invalidateQueries({ queryKey: queryKeys.videoMaterials });
    } catch (err: any) {
      const msg = err?.response?.data?.message || err.message || "Upload rejected by server";
      toast.error(`Upload failed: ${msg}`, { id: toastId });
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const filteredMaterials = useMemo(() => {
    let list = [...materials];

    // Filter by tab
    if (tab === "videos") {
      list = list.filter((m) => /\.(mp4|mov|avi|flv|mkv)$/i.test(m.name));
    } else if (tab === "images") {
      list = list.filter((m) => /\.(jpg|jpeg|png)$/i.test(m.name));
    } else {
      // non-video/image tabs currently have no server items
      list = [];
    }

    // Search query
    if (query.trim()) {
      list = list.filter((m) => m.name.toLowerCase().includes(query.toLowerCase()));
    }

    // Sort
    if (sort === "name") {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === "size") {
      list.sort((a, b) => b.size - a.size);
    }
    return list;
  }, [materials, tab, query, sort]);

  return (
    <AppShell>
      <PageHeader
        crumb={["Studio", "Assets Library"]}
        title="Assets Library"
        subtitle="Locally available media materials managed directly by MoneyPrinterTurbo."
        actions={
          <>
            <GhostButton onClick={() => refetch()}>
              <RefreshCcw className="w-4 h-4 mr-1" /> Refresh
            </GhostButton>
            <PrimaryButton onClick={handleUploadClick} disabled={isUploading}>
              {isUploading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Upload className="w-4 h-4 mr-1" />}
              {isUploading ? "Uploading..." : "Upload Media"}
            </PrimaryButton>
            <input
              ref={fileInputRef}
              type="file"
              accept=".mp4,.mov,.avi,.flv,.mkv,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              className="hidden"
            />
          </>
        }
      />

      <div className="grid grid-cols-6 gap-2 mb-5">
        {tabs.map((t) => {
          const count =
            t.k === "videos"
              ? materials.filter((m) => /\.(mp4|mov|avi|flv|mkv)$/i.test(m.name)).length
              : t.k === "images"
              ? materials.filter((m) => /\.(jpg|jpeg|png)$/i.test(m.name)).length
              : 0;

          return (
            <button
              key={t.k}
              onClick={() => setTab(t.k)}
              className={`p-4 rounded-2xl border ${
                tab === t.k
                  ? "border-primary bg-accent/40"
                  : "border-border bg-card hover:border-primary/20"
              } transition text-left shadow-card`}
            >
              <t.icon className={`w-5 h-5 mb-2 ${tab === t.k ? "text-primary" : "text-muted-foreground"}`} />
              <div className="text-[12.5px] font-bold">{t.l}</div>
              <div className="text-[10.5px] text-muted-foreground mt-0.5">{count} items</div>
            </button>
          );
        })}
      </div>

      <div className="flex gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search assets by filename…"
            className="!pl-10"
          />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as any)}
          className="h-10 px-3 rounded-xl bg-card border border-border text-[13px]"
        >
          <option value="newest">Sort: Newest</option>
          <option value="name">Sort: A–Z</option>
          <option value="size">Sort: Size</option>
        </select>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
          <p className="text-sm">Loading materials from MoneyPrinterTurbo...</p>
        </div>
      ) : isError ? (
        <div className="p-12 text-center text-destructive">
          <p className="text-sm">Failed to retrieve video materials from backend.</p>
        </div>
      ) : filteredMaterials.length === 0 ? (
        <EmptyState
          icon={Film}
          title={tab === "videos" ? "No video materials found" : tab === "images" ? "No image materials found" : `No ${tab} items`}
          description={
            tab === "videos" || tab === "images"
              ? "Upload video (.mp4, .mov, .avi) or image (.jpg, .png) clips to store them in MoneyPrinterTurbo's local material storage."
              : "This category does not have local media files configured in MPT."
          }
          action={
            (tab === "videos" || tab === "images") ? (
              <PrimaryButton onClick={handleUploadClick}>
                <Upload className="w-4 h-4 mr-1" /> Upload Media
              </PrimaryButton>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-4 gap-4">
          {filteredMaterials.map((m) => (
            <div
              key={m.file}
              className="group rounded-2xl bg-card border border-border p-2.5 shadow-card hover:shadow-card-lg transition"
            >
              <div className="relative aspect-video rounded-xl bg-gradient-to-br from-emerald-800 via-teal-950 to-slate-950 overflow-hidden flex items-center justify-center text-white/60">
                <Film className="w-8 h-8" />
                <div className="absolute top-2 left-2">
                  <Pill tone="primary">LOCAL MPT</Pill>
                </div>
              </div>
              <div className="px-1 pt-2.5 pb-1">
                <div className="text-[12.5px] font-semibold truncate" title={m.name}>
                  {m.name}
                </div>
                <div className="flex items-center justify-between mt-1 text-[10.5px] text-muted-foreground">
                  <span>{formatBytes(m.size)}</span>
                  <span
                    className="cursor-help flex items-center gap-0.5 text-muted-foreground/80"
                    title="Material deletion is not supported by MoneyPrinterTurbo server storage"
                  >
                    <Info className="w-3 h-3" /> Server-managed
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
