"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import NowPlaying from "./NowPlaying";

function DateWeather() {
  const [date, setDate] = useState<string | null>(null);
  const [temp, setTemp] = useState<number | null>(null);

  useEffect(() => {
    // Rendered on the client so it shows Seattle's date, not the build date.
    const today = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "America/Los_Angeles" });
    const id = requestAnimationFrame(() => setDate(today.format(new Date())));
    fetch("/api/weather")
      .then((r) => r.json())
      .then((w: { temperature: number } | null) => w && setTemp(w.temperature))
      .catch(() => {});
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div className="flex items-center justify-end gap-3 text-[13px] text-muted tabular-nums" aria-label="Seattle date and weather">
      <span className="min-w-[3ch]">{date}</span>
      {temp !== null && <span title="Seattle">{temp}°</span>}
    </div>
  );
}

export default function TopBar() {
  return (
    <header className="grid h-11 grid-cols-[1fr_auto_1fr] items-center">
      <Link href="/" aria-label="Home" className="font-script text-[30px] leading-none text-ink">
        Isa
      </Link>
      <NowPlaying />
      <DateWeather />
    </header>
  );
}
