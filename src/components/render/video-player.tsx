// ============================================================================
// Professional Video Player — desktop-class scrub/seek/speed/PiP/fullscreen.
// Pure presentation; accepts a `src` URL or renders a styled placeholder.
// ============================================================================

import { useEffect, useRef, useState } from "react";
import {
  Play, Pause, Volume2, VolumeX, Maximize2, Repeat, Subtitles,
  PictureInPicture2, Gauge, Square,
} from "lucide-react";
import { formatDuration } from "@/lib/render-pipeline";

const SPEEDS = [0.25, 0.5, 1, 1.25, 1.5, 2];

export function VideoPlayer({
  src, poster, aspect = "16:9", title,
}: { src?: string; poster?: string; aspect?: "9:16" | "16:9" | "1:1" | "4:5"; title?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.85);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [loop, setLoop] = useState(false);
  const [subs, setSubs] = useState(true);
  const [safeArea, setSafeArea] = useState(false);

  useEffect(() => {
    const v = ref.current; if (!v) return;
    const onTime = () => setTime(v.currentTime);
    const onMeta = () => setDuration(v.duration || 0);
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("loadedmetadata", onMeta);
    return () => { v.removeEventListener("timeupdate", onTime); v.removeEventListener("loadedmetadata", onMeta); };
  }, []);

  const aspectRatio = aspect === "9:16" ? "9/16" : aspect === "1:1" ? "1/1" : aspect === "4:5" ? "4/5" : "16/9";

  return (
    <div className="rounded-3xl bg-card border border-border shadow-card overflow-hidden">
      <div className="relative bg-black" style={{ aspectRatio }}>
        {src ? (
          <video
            ref={ref}
            src={src}
            poster={poster}
            loop={loop}
            muted={muted}
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-emerald-900 via-emerald-950 to-black">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-white/10 backdrop-blur grid place-items-center mb-3">
                <Play className="w-6 h-6 text-white ml-0.5" fill="currentColor" />
              </div>
              <div className="text-white/80 text-[13px] font-semibold">{title ?? "Preview unavailable"}</div>
              <div className="text-white/40 text-[11px] mt-1">Awaiting render output</div>
            </div>
          </div>
        )}

        {subs && (
          <div className="absolute left-0 right-0 bottom-[15%] grid place-items-center pointer-events-none">
            <span className="font-extrabold text-white text-[18px] tracking-tight px-3 py-1 rounded bg-black/40 backdrop-blur">
              Live subtitle preview
            </span>
          </div>
        )}
        {safeArea && (
          <>
            <div className="absolute inset-[5%] border border-emerald-400/60 rounded pointer-events-none" />
            <div className="absolute inset-[10%] border border-amber-300/60 rounded pointer-events-none" />
          </>
        )}

        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-white bg-black/40 backdrop-blur px-2 py-0.5 rounded">
            {aspect}
          </span>
        </div>
      </div>

      {/* Scrub bar */}
      <div className="px-5 pt-4">
        <input
          type="range" min={0} max={duration || 100} step={0.01} value={time}
          onChange={(e) => { if (ref.current) ref.current.currentTime = +e.target.value; setTime(+e.target.value); }}
          className="w-full accent-[#227850]"
        />
        <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground mt-1">
          <span>{formatDuration(time)}</span>
          <span>{formatDuration(duration || 0)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="px-5 pb-4 pt-2 flex items-center gap-2">
        <button
          onClick={() => { const v = ref.current; if (!v) { setPlaying(p => !p); return; } if (v.paused) { v.play(); setPlaying(true); } else { v.pause(); setPlaying(false); } }}
          className="w-10 h-10 rounded-xl bg-brand-gradient text-white grid place-items-center shadow-brand"
        >
          {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" fill="currentColor" />}
        </button>

        <button onClick={() => { if (ref.current) ref.current.currentTime = 0; setTime(0); setPlaying(false); ref.current?.pause(); }} className="w-9 h-9 rounded-xl bg-secondary grid place-items-center text-muted-foreground hover:text-foreground transition">
          <Square className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-center gap-1.5 ml-1 px-2.5 h-9 rounded-xl bg-secondary">
          <button onClick={() => { setMuted(m => !m); if (ref.current) ref.current.muted = !muted; }} className="text-muted-foreground hover:text-foreground">
            {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
          <input type="range" min={0} max={1} step={0.01} value={volume}
            onChange={(e) => { const v = +e.target.value; setVolume(v); if (ref.current) ref.current.volume = v; }}
            className="w-20 accent-[#227850]"
          />
        </div>

        <div className="flex items-center gap-1 ml-1 px-2 h-9 rounded-xl bg-secondary text-[11px] font-mono">
          <Gauge className="w-3 h-3 text-muted-foreground" />
          {SPEEDS.map(s => (
            <button key={s} onClick={() => { setSpeed(s); if (ref.current) ref.current.playbackRate = s; }}
              className={`px-1.5 rounded ${speed === s ? "bg-card text-foreground font-bold" : "text-muted-foreground hover:text-foreground"}`}>
              {s}×
            </button>
          ))}
        </div>

        <div className="flex-1" />

        <ToolBtn active={loop}  onClick={() => setLoop(v => !v)}     icon={Repeat}              title="Loop" />
        <ToolBtn active={subs}  onClick={() => setSubs(v => !v)}     icon={Subtitles}           title="Subtitles" />
        <ToolBtn active={safeArea} onClick={() => setSafeArea(v => !v)} icon={Square}           title="Safe area" />
        <ToolBtn onClick={() => {/* PiP placeholder */}}              icon={PictureInPicture2}  title="Picture-in-picture" />
        <ToolBtn onClick={() => ref.current?.requestFullscreen?.()}   icon={Maximize2}          title="Fullscreen" />
      </div>
    </div>
  );
}

function ToolBtn({ icon: Icon, onClick, active, title }: any) {
  return (
    <button
      onClick={onClick} title={title}
      className={`w-9 h-9 rounded-xl grid place-items-center transition ${
        active ? "bg-accent text-primary" : "bg-secondary text-muted-foreground hover:text-foreground"
      }`}
    >
      <Icon className="w-3.5 h-3.5" />
    </button>
  );
}
