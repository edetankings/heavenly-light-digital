import { useEffect, useRef, useState } from "react";
import { Play, Pause, Volume2, VolumeX, Download } from "lucide-react";
import { downloadFile } from "@/lib/download-file";

export function AudioPlayer({
  src,
  title,
  downloadName,
  allowDownload,
}: {
  src: string;
  title?: string;
  downloadName?: string;
  allowDownload?: boolean;
}) {
  const ref = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const a = ref.current;
    if (!a) return;
    const onTime = () => setProgress(a.currentTime);
    const onMeta = () => setDuration(a.duration || 0);
    const onEnd = () => setPlaying(false);
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("loadedmetadata", onMeta);
    a.addEventListener("ended", onEnd);
    return () => {
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("loadedmetadata", onMeta);
      a.removeEventListener("ended", onEnd);
    };
  }, [src]);

  const toggle = async () => {
    const a = ref.current;
    if (!a) return;
    if (playing) {
      a.pause();
      setPlaying(false);
    } else {
      try {
        await a.play();
        setPlaying(true);
      } catch (e) {
        console.error("Audio play failed", e);
      }
    }
  };
  const seek = (v: number) => {
    const a = ref.current;
    if (!a) return;
    a.currentTime = v;
    setProgress(v);
  };
  const fmt = (s: number) => {
    if (!isFinite(s)) return "0:00";
    const m = Math.floor(s / 60);
    const r = Math.floor(s % 60);
    return `${m}:${r.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full max-w-full overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-white to-[var(--surface)] backdrop-blur p-3 flex items-center gap-2 sm:gap-3 shadow-[0_8px_24px_-12px_rgba(10,15,46,0.18)] ring-1 ring-[var(--gold)]/10">
      <audio ref={ref} src={src} preload="metadata" muted={muted} />
      <button
        type="button"
        onClick={toggle}
        className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-navy to-[oklch(0.28_0.10_270)] text-white hover:scale-105 active:scale-95 transition shadow-[0_6px_18px_-6px_rgba(10,15,46,0.5),inset_0_1px_0_rgba(255,255,255,0.15)] ring-1 ring-[var(--gold)]/30"
        aria-label={playing ? "Pause" : "Play"}
      >
        {playing ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
      </button>
      <div className="flex-1 min-w-0">
        {title && (
          <p className="text-xs font-medium text-navy break-words leading-snug line-clamp-2">
            {title}
          </p>
        )}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[10px] tabular-nums text-navy-muted">{fmt(progress)}</span>
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={progress}
            onChange={(e) => seek(Number(e.target.value))}
            className="flex-1 min-w-0 h-1 accent-navy cursor-pointer"
            aria-label="Seek"
          />
          <span className="text-[10px] tabular-nums text-navy-muted">{fmt(duration)}</span>
        </div>
      </div>
      <button
        type="button"
        onClick={() => setMuted((m) => !m)}
        className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-navy hover:bg-surface"
        aria-label={muted ? "Unmute" : "Mute"}
      >
        {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
      </button>
      {allowDownload !== false && (
        <button
          type="button"
          onClick={() => downloadFile(src, downloadName || title)}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-navy hover:bg-surface"
          aria-label="Download audio"
        >
          <Download size={15} />
        </button>
      )}
    </div>
  );
}
