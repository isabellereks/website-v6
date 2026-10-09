"use client";

import { useEffect, useRef, useState } from "react";

const SITE_WIDTH = 1440;
const SITE_HEIGHT = 900;

// A line-drawn laptop with the real, clickable site running on its screen.
export default function LaptopEmbed({ url, title }: { url: string; title: string }) {
  const screenRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  const [near, setNear] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const screen = screenRef.current;
    if (!screen) return;
    const resize = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / SITE_WIDTH));
    resize.observe(screen);
    // Only load the site once it's close to the viewport.
    const visible = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setNear(true);
        visible.disconnect();
      },
      { rootMargin: "600px" },
    );
    visible.observe(screen);
    return () => {
      resize.disconnect();
      visible.disconnect();
    };
  }, []);

  return (
    <figure className="mx-auto w-full max-w-[880px]">
      <div className="mx-[6%] rounded-t-[16px] rounded-b-[4px] border border-ink bg-paper p-[10px] pb-[22px] md:p-[14px] md:pb-[28px]">
        <div
          ref={screenRef}
          className="relative overflow-hidden rounded-[4px] border border-rule bg-white"
          style={{ aspectRatio: `${SITE_WIDTH} / ${SITE_HEIGHT}` }}
        >
          {!loaded && (
            <div
              aria-hidden
              className="absolute inset-0 grid place-items-center text-[13px] text-muted"
              style={{
                backgroundImage:
                  "linear-gradient(var(--color-rule) 1px, transparent 1px), linear-gradient(90deg, var(--color-rule) 1px, transparent 1px)",
                backgroundSize: "16px 16px",
              }}
            >
              <span className="bg-paper px-2">Loading {title}…</span>
            </div>
          )}
          {near && scale > 0 && (
            <iframe
              src={url}
              title={`${title}, live`}
              loading="lazy"
              onLoad={() => setLoaded(true)}
              className="absolute top-0 left-0 origin-top-left border-0"
              style={{
                width: SITE_WIDTH,
                height: SITE_HEIGHT,
                transform: `scale(${scale})`,
                opacity: loaded ? 1 : 0,
                transition: "opacity 400ms",
              }}
            />
          )}
        </div>
      </div>
      <svg viewBox="0 0 1000 28" className="-mt-px block w-full" fill="none" stroke="currentColor" strokeWidth={1} aria-hidden>
        <path d="M60 1 H940 L996 18 Q998 26 990 26 H10 Q2 26 4 18 Z" fill="var(--color-paper)" vectorEffect="non-scaling-stroke" />
        <path d="M430 1 Q430 8 440 8 H560 Q570 8 570 1" vectorEffect="non-scaling-stroke" />
      </svg>
    </figure>
  );
}
