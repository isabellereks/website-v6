"use client";

import { useEffect, useRef, useState } from "react";
import type { NowPlaying as Track } from "@/app/api/now-playing/route";

const formatTime = (ms: number) => {
  const s = Math.max(0, Math.round(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

// The waveform takes the album art's most vivid color, like iOS.
function useAlbumTint(src: string | null | undefined) {
  const [tint, setTint] = useState<string | null>(null);
  useEffect(() => {
    if (!src) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = 10;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, 10, 10);
        const data = ctx.getImageData(0, 0, 10, 10).data;
        let best = [255, 255, 255];
        let bestScore = -1;
        for (let i = 0; i < data.length; i += 4) {
          const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
          const max = Math.max(r, g, b);
          const score = (max - Math.min(r, g, b)) * (max > 60 ? 1 : 0.2);
          if (score > bestScore) {
            bestScore = score;
            best = [r, g, b];
          }
        }
        const [r, g, b] = best.map((c) => Math.round(c + (255 - c) * 0.25));
        setTint(`rgb(${r} ${g} ${b})`);
      } catch {
        setTint(null);
      }
    };
    img.src = src;
  }, [src]);
  return src ? tint : null;
}

function Waveform({ playing, tint, height }: { playing: boolean; tint: string | null; height: number }) {
  return (
    <span aria-hidden className="flex items-center gap-[2px]" style={{ height }}>
      {[0.55, 0.9, 0.7, 1, 0.6, 0.8].map((scale, i) => (
        <span
          key={i}
          className="island-bar w-[3px] rounded-full"
          style={{
            background: tint ?? "#fff",
            animationDuration: `${620 + ((i * 137) % 380)}ms`,
            animationDelay: `${-i * 211}ms`,
            animationPlayState: playing ? "running" : "paused",
            ["--bar-max" as string]: `${Math.round(height * scale)}px`,
          }}
        />
      ))}
    </span>
  );
}

function Art({ src, size, radius }: { src: string | null | undefined; size: number; radius: number }) {
  if (!src) {
    return (
      <span
        aria-hidden
        className="grid shrink-0 place-items-center bg-[#2c2c2e] text-[#8e8e93]"
        style={{ width: size, height: size, borderRadius: radius, fontSize: size * 0.42 }}
      >
        ♪
      </span>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" className="shrink-0 object-cover" style={{ width: size, height: size, borderRadius: radius }} />;
}

// Filled transport icons drawn to match iOS's backward/play/pause/forward glyphs.
const Icon = {
  back: (
    <svg viewBox="0 0 34 20" width="27" height="16" fill="currentColor" aria-hidden>
      <path d="M15.2 2.6c0-1.3-1.4-2-2.4-1.3L1.6 8.7c-.9.6-.9 2 0 2.6l11.2 7.4c1 .7 2.4 0 2.4-1.3z" />
      <path d="M32.2 2.6c0-1.3-1.4-2-2.4-1.3L18.6 8.7c-.9.6-.9 2 0 2.6l11.2 7.4c1 .7 2.4 0 2.4-1.3z" />
    </svg>
  ),
  forward: (
    <svg viewBox="0 0 34 20" width="27" height="16" fill="currentColor" aria-hidden>
      <path d="M1.8 2.6c0-1.3 1.4-2 2.4-1.3l11.2 7.4c.9.6.9 2 0 2.6L4.2 18.7c-1 .7-2.4 0-2.4-1.3z" />
      <path d="M18.8 2.6c0-1.3 1.4-2 2.4-1.3l11.2 7.4c.9.6.9 2 0 2.6l-11.2 7.4c-1 .7-2.4 0-2.4-1.3z" />
    </svg>
  ),
  play: (
    <svg viewBox="0 0 20 22" width="24" height="27" fill="currentColor" aria-hidden>
      <path d="M2 2.2c0-1.4 1.5-2.2 2.7-1.5l14.2 8.8c1.1.7 1.1 2.3 0 3L4.7 21.3C3.5 22 2 21.2 2 19.8z" />
    </svg>
  ),
  pause: (
    <svg viewBox="0 0 20 22" width="24" height="27" fill="currentColor" aria-hidden>
      <rect x="2" y="1" width="5.6" height="20" rx="1.6" />
      <rect x="12.4" y="1" width="5.6" height="20" rx="1.6" />
    </svg>
  ),
};

// iOS Dynamic Island, Now Playing. Click to expand, click outside or Escape to close.
// Play runs a 30s preview of the current song in the visitor's browser.
export default function NowPlaying() {
  const [track, setTrack] = useState<Track | null>(null);
  const [open, setOpen] = useState(false);
  const [previewPlaying, setPreviewPlaying] = useState(false);
  const [previewStarted, setPreviewStarted] = useState(false);
  const [preview, setPreview] = useState({ current: 0, duration: 30 });
  const [liveClock, setLiveClock] = useState({ fetchedAt: 0, now: 0 });
  const islandRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const tint = useAlbumTint(track?.albumArt);

  useEffect(() => {
    let cancelled = false;
    const load = () =>
      fetch("/api/now-playing")
        .then((r) => (r.ok ? r.json() : null))
        .then((t: Track | null) => {
          if (cancelled) return;
          setTrack((prev) => {
            // A new song means the old preview no longer applies.
            if (prev?.previewUrl !== t?.previewUrl && audioRef.current) {
              audioRef.current.pause();
              audioRef.current = null;
              setPreviewPlaying(false);
              setPreviewStarted(false);
              setPreview({ current: 0, duration: 30 });
            }
            return t;
          });
          setLiveClock({ fetchedAt: Date.now(), now: Date.now() });
        })
        .catch(() => {});
    load();
    const id = setInterval(load, 30_000);
    return () => {
      cancelled = true;
      clearInterval(id);
      audioRef.current?.pause();
    };
  }, []);

  // Advance her live listening position between fetches.
  useEffect(() => {
    if (!open || !track?.isPlaying) return;
    const id = setInterval(() => setLiveClock((c) => ({ ...c, now: Date.now() })), 1000);
    return () => clearInterval(id);
  }, [open, track?.isPlaying]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!islandRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const audio = () => {
    if (!track?.previewUrl) return null;
    if (!audioRef.current) {
      const a = new Audio(track.previewUrl);
      a.addEventListener("timeupdate", () => setPreview({ current: a.currentTime, duration: a.duration || 30 }));
      a.addEventListener("loadedmetadata", () => setPreview({ current: a.currentTime, duration: a.duration || 30 }));
      a.addEventListener("ended", () => setPreviewPlaying(false));
      audioRef.current = a;
      setPreviewStarted(true);
    }
    return audioRef.current;
  };

  const togglePlay = () => {
    const a = audio();
    if (!a) return;
    if (a.paused) {
      a.play().then(() => setPreviewPlaying(true)).catch(() => {});
    } else {
      a.pause();
      setPreviewPlaying(false);
    }
  };

  const restart = () => {
    const a = audio();
    if (!a) return;
    a.currentTime = 0;
    setPreview((p) => ({ ...p, current: 0 }));
  };

  const skip = () => {
    const a = audio();
    if (!a) return;
    a.currentTime = Math.min((a.duration || 30) - 0.1, a.currentTime + 10);
  };

  const animating = previewPlaying || (!previewStarted && !!track?.isPlaying);

  // The scrubber follows the preview once a visitor plays it; otherwise her live position.
  const usingPreview = previewStarted;
  const elapsed = usingPreview
    ? preview.current * 1000
    : track?.isPlaying && track.progressMs !== null
      ? Math.min(track.durationMs, track.progressMs + (liveClock.now - liveClock.fetchedAt))
      : 0;
  const total = usingPreview ? preview.duration * 1000 : (track?.durationMs ?? 30_000);

  return (
    <div className="relative h-[37px] w-[196px]">
      <div ref={islandRef} className="island absolute top-0 left-1/2 z-50 -translate-x-1/2" data-open={open}>
        {/* Compact: art leading, waveform trailing, camera space in the middle */}
        <button
          type="button"
          aria-expanded={open}
          aria-controls="island-card"
          aria-label={track ? `${track.isPlaying ? "Now playing" : "Last played"}: ${track.title} by ${track.artist}` : "Music"}
          onClick={() => setOpen(true)}
          className="island-compact absolute inset-0 flex items-center justify-between pr-[12px] pl-[7px]"
        >
          <Art src={track?.albumArt} size={23} radius={6} />
          <Waveform playing={animating} tint={tint} height={14} />
        </button>

        {/* Expanded, matching liam.cv / iOS: art + title, scrubber, centered transport */}
        <div id="island-card" className="island-card absolute inset-0 flex flex-col px-[20px] pt-[20px] pb-[18px]" inert={!open}>
          <div className="flex items-center gap-[14px]">
            <a href={track?.url ?? "https://open.spotify.com"} target="_blank" rel="noopener noreferrer" aria-label="Open in Spotify">
              <Art src={track?.albumArt} size={56} radius={12} />
            </a>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[17px] leading-[22px] font-semibold tracking-[-0.3px] text-white">
                {track?.title ?? "Not Playing"}
              </p>
              <p className="truncate text-[15px] leading-[20px] tracking-[-0.2px] text-[#8e8e93]">{track?.artist ?? "Spotify"}</p>
            </div>
          </div>

          <div className="mt-[16px] flex items-center gap-[8px] text-[11px] font-medium text-[#8e8e93] tabular-nums">
            <span className="w-[28px]">{formatTime(elapsed)}</span>
            <span className="relative h-[4px] flex-1 overflow-hidden rounded-full bg-[#ffffff2e]">
              <span className="absolute inset-y-0 left-0 rounded-full bg-[#ffffffb3]" style={{ width: `${Math.min(100, (elapsed / total) * 100)}%` }} />
            </span>
            <span className="w-[32px] text-right">-{formatTime(total - elapsed)}</span>
          </div>

          <div className="mt-auto flex items-center justify-center gap-[52px] text-white">
            <button
              type="button"
              onClick={restart}
              disabled={!track?.previewUrl || elapsed < 1000}
              aria-label="Restart"
              className="transition-opacity active:opacity-50 disabled:opacity-35"
            >
              {Icon.back}
            </button>
            <button
              type="button"
              onClick={togglePlay}
              disabled={!track?.previewUrl}
              aria-label={previewPlaying ? "Pause" : "Play"}
              className="grid h-[28px] w-[28px] place-items-center transition-opacity active:opacity-50 disabled:opacity-35"
            >
              {previewPlaying ? Icon.pause : Icon.play}
            </button>
            <button
              type="button"
              onClick={skip}
              disabled={!track?.previewUrl}
              aria-label="Skip ahead 10 seconds"
              className="transition-opacity active:opacity-50 disabled:opacity-35"
            >
              {Icon.forward}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
