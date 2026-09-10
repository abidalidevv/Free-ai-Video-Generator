import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageHeader, PrimaryButton, GhostButton, Input, Pill } from "@/components/app-shell";
import { Search, Upload, Filter, Music2, Image as ImageIcon, FileVideo, Layers, Folder, Download } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/assets")({
  head: () => ({ meta: [{ title: "Assets Library — VideoForge AI" }] }),
  component: AssetsPage,
});

const tabs = [
  { k: "videos", l: "Videos", icon: FileVideo, count: 248 },
  { k: "images", l: "Images", icon: ImageIcon, count: 412 },
  { k: "audio", l: "Audio", icon: Music2, count: 86 },
  { k: "music", l: "Music", icon: Music2, count: 64 },
  { k: "overlays", l: "Overlays", icon: Layers, count: 32 },
  { k: "stock", l: "Stock Videos", icon: Download, count: 154 },
  { k: "recent", l: "Recent Downloads", icon: Folder, count: 18 },
];

const items = Array.from({ length: 16 }).map((_, i) => ({
  name: ["sunrise-office.mp4", "tokyo-night.mp4", "ceo-meeting.mp4", "coffee-pour.mp4", "skyline-dawn.mp4", "running-shoes.mp4", "journal-flip.mp4", "boardroom.mp4"][i % 8],
  size: ["12.4 MB", "28.1 MB", "8.7 MB", "42.0 MB"][i % 4],
  duration: ["0:08", "0:14", "0:22", "0:05"][i % 4],
  src: ["Pexels", "Local", "Pixabay", "Coverr"][i % 4],
  hue: ["from-emerald-700 to-emerald-950", "from-violet-700 to-indigo-900", "from-amber-600 to-orange-800", "from-cyan-700 to-blue-900"][i % 4],
}));

function AssetsPage() {
  const [tab, setTab] = useState("videos");
  return (
    <AppShell>
      <PageHeader
        crumb={["Studio", "Assets Library"]}
        title="Assets Library"
        subtitle="Every video, image, sound and overlay you've collected — searchable in one place."
        actions={<><GhostButton><Filter className="w-4 h-4" /> Filter</GhostButton><PrimaryButton><Upload className="w-4 h-4" /> Upload Media</PrimaryButton></>}
      />

      <div className="grid grid-cols-7 gap-2 mb-5">
        {tabs.map(t => (
          <button key={t.k} onClick={() => setTab(t.k)} className={`p-4 rounded-2xl border ${tab === t.k ? "border-primary bg-accent/40" : "border-border bg-card hover:border-primary/20"} transition text-left shadow-card`}>
            <t.icon className={`w-5 h-5 mb-2 ${tab === t.k ? "text-primary" : "text-muted-foreground"}`} />
            <div className="text-[12.5px] font-bold">{t.l}</div>
            <div className="text-[10.5px] text-muted-foreground mt-0.5">{t.count} items</div>
          </button>
        ))}
      </div>

      <div className="flex gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search assets by name, tag, source…" className="!pl-10" />
        </div>
        <select className="h-10 px-3 rounded-xl bg-card border border-border text-[13px]"><option>Sort: Newest</option><option>Sort: Oldest</option><option>Sort: A–Z</option><option>Sort: Size</option></select>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {items.map((a, i) => (
          <div key={i} className="group rounded-2xl bg-card border border-border p-2.5 shadow-card hover:shadow-card-lg cursor-pointer transition">
            <div className={`relative aspect-video rounded-xl bg-gradient-to-br ${a.hue} overflow-hidden`}>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,.2),transparent_60%)]" />
              <div className="absolute bottom-2 right-2 text-[10px] font-semibold text-white bg-black/40 backdrop-blur px-1.5 py-0.5 rounded">{a.duration}</div>
              <div className="absolute top-2 left-2"><Pill tone="primary">{a.src}</Pill></div>
            </div>
            <div className="px-1 pt-2.5 pb-1 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="text-[12.5px] font-semibold truncate">{a.name}</div>
                <div className="text-[10.5px] text-muted-foreground">{a.size}</div>
              </div>
              <input type="checkbox" className="accent-[#227850] w-4 h-4" />
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
