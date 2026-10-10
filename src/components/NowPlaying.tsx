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

// Filled transport icons drawn to match iOS's backward/play/pause/forward glyphs.
const Icon = {
  // Jump back / forward 10 seconds (circular arrow with "10"), like iOS.
  back: (
    <svg viewBox="0 0 28 28" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <path d="M14 5.5a9 9 0 1 1-8.5 6" />
      <path d="M14 2.5 L10.5 5.5 L14 8.5" fill="currentColor" strokeLinejoin="round" />
      <text x="14.2" y="18.2" textAnchor="middle" fontSize="8" fontWeight="700" fill="currentColor" stroke="none" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif">10</text>
    </svg>
  ),
  forward: (
    <svg viewBox="0 0 28 28" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <path d="M14 5.5a9 9 0 1 0 8.5 6" />
      <path d="M14 2.5 L17.5 5.5 L14 8.5" fill="currentColor" strokeLinejoin="round" />
      <text x="13.8" y="18.2" textAnchor="middle" fontSize="8" fontWeight="700" fill="currentColor" stroke="none" fontFamily="-apple-system, BlinkMacSystemFont, sans-serif">10</text>
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
  // On load the island starts as a small pill, then springs out once the track
  // arrives (like music starting on an iPhone).
  const [booted, setBooted] = useState(false);
  const [previewPlaying, setPreviewPlaying] = useState(false);
  const [preview, setPreview] = useState({ current: 0, duration: 30 });
  const islandRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const tint = useAlbumTint(track?.albumArt);

  useEffect(() => {
    let cancelled = false;
    let songEnd: ReturnType<typeof setTimeout> | undefined;
    const load = () =>
      fetch("/api/now-playing", { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : null))
        .then((t: Track | null) => {
          if (cancelled) return;
          setTrack((prev) => {
            // A new song means the old preview no longer applies.
            if (prev?.previewUrl !== t?.previewUrl && audioRef.current) {
              audioRef.current.pause();
              audioRef.current = null;
              setPreviewPlaying(false);
              setPreview({ current: 0, duration: 30 });
            }
            return t;
          });
          // Check again right when the current song should end.
          clearTimeout(songEnd);
          if (t?.isPlaying && t.progressMs !== null) {
            songEnd = setTimeout(load, Math.max(1000, t.durationMs - t.progressMs + 1500));
          }
        })
        .catch(() => {});
    // Expand once the first track arrives, but never wait longer than ~0.9s.
    const bootStart = performance.now();
    const boot = () => {
      const wait = Math.max(0, 450 - (performance.now() - bootStart));
      setTimeout(() => !cancelled && setBooted(true), wait);
    };
    const bootFallback = setTimeout(boot, 900);
    load().finally(() => {
      clearTimeout(bootFallback);
      boot();
    });
    // Poll every 10s while the tab is visible, and refresh as soon as it comes back.
    const id = setInterval(() => {
      if (document.visibilityState === "visible") load();
    }, 10_000);
    const onVisible = () => document.visibilityState === "visible" && load();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      clearInterval(id);
      clearTimeout(songEnd);
      document.removeEventListener("visibilitychange", onVisible);
      clearTimeout(bootFallback);
      audioRef.current?.pause();
    };
  }, []);

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

  const jumpBack = () => {
    const a = audio();
    if (!a) return;
    a.currentTime = Math.max(0, a.currentTime - 10);
    setPreview((p) => ({ ...p, current: a.currentTime }));
  };

  const skip = () => {
    const a = audio();
    if (!a) return;
    a.currentTime = Math.min((a.duration || 30) - 0.1, a.currentTime + 10);
  };

  // The card is a preview player (like liam.cv): it stays still at 0:00 / -0:30
  // until a visitor presses play, and the waveform only moves while it plays.
  // Playing (her Spotify, or a visitor's preview): full pill with a moving waveform.
  // Paused / last played: a smaller pill with just the album art.
  const animating = previewPlaying || !!track?.isPlaying;
  const elapsed = preview.current * 1000;
  const total = preview.duration * 1000;

  return (
    <div className="relative h-[34px] w-[180px]">
      <div ref={islandRef} className="island absolute top-0 left-1/2 z-50 -translate-x-1/2" data-open={open} data-booted={booted} data-playing={animating}>
        {/* One album art that grows from the pill into the card, like iOS. */}
        <span aria-hidden className="island-art pointer-events-none absolute z-10 overflow-hidden bg-[#2c2c2e]">
          {track?.albumArt ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={track.albumArt} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="grid h-full w-full place-items-center text-[#8e8e93]">♪</span>
          )}
        </span>

        {/* Compact: art leading, waveform trailing, camera space in the middle */}
        <button
          type="button"
          aria-expanded={open}
          aria-controls="island-card"
          aria-label={
            track
              ? `${track.isPlaying ? "Now playing" : track.progressMs != null ? "Paused" : "Last played"}: ${track.title} by ${track.artist}`
              : "Music"
          }
          onClick={() => setOpen(true)}
          className="island-compact absolute inset-0 flex items-center justify-between pr-[12px] pl-[7px]"
        >
          <span className="w-[21px]" />
          <span className="island-wave">
            <Waveform playing={animating} tint={tint} height={12} />
          </span>
        </button>

        {/* Expanded, matching liam.cv / iOS: art + title, scrubber, centered transport */}
        <div id="island-card" className="island-card absolute inset-0 flex flex-col px-[18px] pt-[18px] pb-[16px]" inert={!open}>
          <div className="flex items-center gap-[14px]">
            <span className="h-[52px] w-[52px] shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[16px] leading-[21px] font-semibold tracking-[-0.3px] text-white">
                {track?.title ?? "Not Playing"}
              </p>
              <p className="truncate text-[14px] leading-[19px] tracking-[-0.2px] text-[#8e8e93]">{track?.artist ?? "Spotify"}</p>
            </div>
          </div>

          <div className="mt-[14px] flex items-center gap-[8px] text-[11px] font-medium text-[#8e8e93] tabular-nums">
            <span className="w-[28px]">{formatTime(elapsed)}</span>
            <span className="relative h-[4px] flex-1 overflow-hidden rounded-full bg-[#ffffff2e]">
              <span className="absolute inset-y-0 left-0 rounded-full bg-[#ffffffb3]" style={{ width: `${Math.min(100, (elapsed / total) * 100)}%` }} />
            </span>
            <span className="w-[32px] text-right">-{formatTime(total - elapsed)}</span>
          </div>

          <div className="mt-auto flex items-center justify-center gap-[48px] text-white">
            <button
              type="button"
              onClick={jumpBack}
              disabled={!track?.previewUrl || elapsed < 1000}
              aria-label="Back 10 seconds"
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
              aria-label="Forward 10 seconds"
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
