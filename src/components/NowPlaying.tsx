"use client";

import { useEffect, useRef, useState } from "react";
import type { NowPlaying as Track } from "@/app/api/now-playing/route";

const formatTime = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

function timeAgo(iso: string) {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

// The waveform takes the album art's color, like iOS does. Falls back to white
// if the image can't be read (e.g. CORS).
function useAlbumTint(src: string | null | undefined) {
  const [tint, setTint] = useState<string | null>(null);
  useEffect(() => {
    if (!src) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = 8;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, 8, 8);
        const data = ctx.getImageData(0, 0, 8, 8).data;
        // Pick the most saturated pixel so the tint isn't a muddy average.
        let best = [255, 255, 255];
        let bestSat = -1;
        for (let i = 0; i < data.length; i += 4) {
          const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
          const sat = Math.max(r, g, b) - Math.min(r, g, b);
          if (sat > bestSat) {
            bestSat = sat;
            best = [r, g, b];
          }
        }
        // Lighten so it reads on black.
        const [r, g, b] = best.map((c) => Math.round(c + (255 - c) * 0.35));
        setTint(`rgb(${r} ${g} ${b})`);
      } catch {
        setTint(null);
      }
    };
    img.src = src;
  }, [src]);
  return src ? tint : null;
}

function Waveform({ playing, tint, size }: { playing: boolean; tint: string | null; size: "sm" | "lg" }) {
  const h = size === "sm" ? 12 : 18;
  return (
    <span aria-hidden className="flex items-center gap-[2px]" style={{ height: h }}>
      {[0, 1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className="island-bar w-[2.5px] rounded-full"
          style={{
            background: tint ?? "white",
            opacity: playing ? 1 : 0.35,
            animationDelay: `${i * -173}ms`,
            animationDuration: `${780 + i * 90}ms`,
            animationPlayState: playing ? "running" : "paused",
            ["--bar-max" as string]: `${h}px`,
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
        className="grid shrink-0 place-items-center bg-white/10 text-white/50"
        style={{ width: size, height: size, borderRadius: radius, fontSize: size * 0.45 }}
      >
        ♪
      </span>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" className="shrink-0 object-cover" style={{ width: size, height: size, borderRadius: radius }} />;
}

// Apple-style Dynamic Island: a compact pill that springs open into a card on tap.
export default function NowPlaying() {
  const [track, setTrack] = useState<Track | null>(null);
  const [fetchedAt, setFetchedAt] = useState(0);
  const [now, setNow] = useState(0);
  const [open, setOpen] = useState(false);
  const islandRef = useRef<HTMLDivElement>(null);
  const tint = useAlbumTint(track?.albumArt);

  useEffect(() => {
    let cancelled = false;
    const load = () =>
      fetch("/api/now-playing")
        .then((r) => (r.ok ? r.json() : null))
        .then((t: Track | null) => {
          if (cancelled) return;
          setTrack(t);
          setFetchedAt(Date.now());
        })
        .catch(() => {});
    load();
    const id = setInterval(load, 30_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  // Tick the progress bar locally between fetches.
  useEffect(() => {
    if (!open || !track?.isPlaying) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [open, track?.isPlaying]);

  // Close on outside tap or Escape, like iOS.
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

  const playing = !!track?.isPlaying;
  const progress =
    track?.isPlaying && track.progressMs !== null
      ? Math.min(track.durationMs, track.progressMs + Math.max(0, (now || fetchedAt) - fetchedAt))
      : null;
  const status = track ? (playing ? "Now playing" : `Last played${track.playedAt ? ` ${timeAgo(track.playedAt)}` : ""}`) : null;

  return (
    <div className="relative h-[37px] w-[190px]">
      <div ref={islandRef} className="island absolute top-0 left-1/2 z-50 -translate-x-1/2 bg-black text-white" data-open={open}>
        {/* Compact */}
        <button
          type="button"
          aria-expanded={open}
          aria-controls="island-card"
          aria-label={track ? `${status}: ${track.title} by ${track.artist}` : "Music"}
          onClick={() => setOpen(true)}
          className="island-compact absolute inset-0 flex items-center justify-between rounded-[inherit] px-[8px]"
        >
          <Art src={track?.albumArt} size={22} radius={6} />
          <Waveform playing={playing} tint={tint} size="sm" />
        </button>

        {/* Expanded */}
        <div id="island-card" className="island-card absolute inset-0 flex flex-col justify-between p-[18px]" inert={!open}>
          <div className="flex items-center gap-3">
            <Art src={track?.albumArt} size={56} radius={12} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] leading-5 font-semibold">{track?.title ?? "Not playing"}</p>
              <p className="truncate text-[14px] leading-5 text-white/55">{track?.artist ?? "Spotify is quiet right now"}</p>
            </div>
            <Waveform playing={playing} tint={tint} size="lg" />
          </div>

          {progress !== null && track ? (
            <div className="flex items-center gap-2.5 text-[11px] text-white/55 tabular-nums">
              <span className="w-8">{formatTime(progress)}</span>
              <span className="h-[5px] flex-1 overflow-hidden rounded-full bg-white/20">
                <span
                  className="block h-full rounded-full bg-white transition-[width] duration-1000 ease-linear"
                  style={{ width: `${(progress / track.durationMs) * 100}%` }}
                />
              </span>
              <span className="w-8 text-right">-{formatTime(track.durationMs - progress)}</span>
            </div>
          ) : (
            <p className="text-[12px] text-white/45">{status ?? "Nothing played recently"}</p>
          )}

          <a
            href={track?.url ?? "https://open.spotify.com"}
            target="_blank"
            rel="noopener noreferrer"
            className="self-center rounded-full bg-white/12 px-4 py-1.5 text-[12px] font-medium text-white transition-colors hover:bg-white/20"
          >
            Open in Spotify
          </a>
        </div>
      </div>
    </div>
  );
}
