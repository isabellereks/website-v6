"use client";

import { useEffect, useState } from "react";
import type { NowPlaying as Track } from "@/app/api/now-playing/route";

function timeAgo(iso: string) {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

function Bars({ playing }: { playing: boolean }) {
  return (
    <span aria-hidden className="flex h-3 items-end gap-[2px]">
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className="island-bar w-[2px] rounded-full bg-paper"
          style={{
            animationDelay: `${i * 140}ms`,
            animationPlayState: playing ? "running" : "paused",
            height: playing ? undefined : "3px",
          }}
        />
      ))}
    </span>
  );
}

function Art({ track, size }: { track: Track | null; size: number }) {
  if (!track?.albumArt) {
    return (
      <span
        aria-hidden
        className="grid shrink-0 place-items-center rounded-full border border-white/25 text-[10px] text-white/60"
        style={{ width: size, height: size }}
      >
        ♪
      </span>
    );
  }
  return (
    // Album art comes from Spotify's CDN at whatever size they serve.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={track.albumArt}
      alt=""
      width={size}
      height={size}
      className="shrink-0 rounded-[6px] object-cover transition-all duration-500"
      style={{ width: size, height: size }}
    />
  );
}

// A small black pill that expands on hover, like the iPhone's Dynamic Island.
export default function NowPlaying() {
  const [track, setTrack] = useState<Track | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = () =>
      fetch("/api/now-playing")
        .then((r) => (r.ok ? r.json() : null))
        .then((t: Track | null) => !cancelled && setTrack(t))
        .catch(() => {});
    load();
    const id = setInterval(load, 60_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const status = track
    ? track.isPlaying
      ? "Now playing"
      : `Last played${track.playedAt ? ` · ${timeAgo(track.playedAt)}` : ""}`
    : "Nothing playing";

  return (
    <div className="relative h-9 w-[132px]">
      <a
        href={track?.url ?? "https://open.spotify.com"}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={track ? `${status}: ${track.title} by ${track.artist}` : status}
        onPointerEnter={() => setOpen(true)}
        onPointerLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="island absolute top-0 left-1/2 z-50 flex -translate-x-1/2 overflow-hidden bg-[#111] text-white shadow-[0_10px_30px_-12px_rgb(0_0_0/0.45)]"
        data-open={open}
      >
        {open ? (
          <span className="flex w-full items-center gap-3 p-3">
            <Art track={track} size={52} />
            <span className="min-w-0 flex-1">
              <span className="block text-[11px] text-white/50">{status}</span>
              <span className="block truncate text-[15px] font-normal">{track?.title ?? "Spotify is quiet"}</span>
              <span className="block truncate text-[13px] text-white/60">{track?.artist ?? "Check back later"}</span>
            </span>
            <Bars playing={!!track?.isPlaying} />
          </span>
        ) : (
          <span className="flex w-full items-center justify-between px-[7px]">
            <Art track={track} size={22} />
            <Bars playing={!!track?.isPlaying} />
          </span>
        )}
      </a>
    </div>
  );
}
