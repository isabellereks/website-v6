"use client";

import { useEffect, useRef, useState } from "react";

const SITE_WIDTH = 1440;
const SITE_HEIGHT = 900;

// A MacBook Pro with the real, clickable site running on its screen.
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
    // Sizes are in cqw (percent of the figure's width) so the MacBook scales as one piece.
    <figure className="mx-auto w-full max-w-[920px]" style={{ containerType: "inline-size" }}>
      {/* Lid: thin aluminum rim around a black glass bezel */}
      <div
        className="relative"
        style={{
          margin: "0 5.5cqw",
          padding: "0.32cqw",
          borderRadius: "2.6cqw 2.6cqw 0.5cqw 0.5cqw",
          background: "linear-gradient(180deg, #e3e4e6 0%, #b9babd 100%)",
          boxShadow: "0 0 0 1px rgb(0 0 0 / 0.06)",
        }}
      >
        <div
          className="relative bg-[#050505]"
          style={{ borderRadius: "2.3cqw 2.3cqw 0.3cqw 0.3cqw", padding: "1.7cqw 1.7cqw 2.4cqw" }}
        >
          {/* Notch with camera */}
          <div
            aria-hidden
            className="absolute top-0 left-1/2 z-10 grid -translate-x-1/2 place-items-center bg-[#050505]"
            style={{ width: "10cqw", height: "2.35cqw", borderRadius: "0 0 0.9cqw 0.9cqw" }}
          >
            <span
              className="block rounded-full"
              style={{
                width: "0.6cqw",
                height: "0.6cqw",
                marginTop: "-0.3cqw",
                background: "radial-gradient(circle at 35% 35%, #3b4a6b 0%, #10131c 60%)",
              }}
            />
          </div>
          <div
            ref={screenRef}
            className="relative overflow-hidden bg-white"
            style={{ aspectRatio: `${SITE_WIDTH} / ${SITE_HEIGHT}`, borderRadius: "0.35cqw" }}
          >
            {!loaded && (
              <div aria-hidden className="absolute inset-0 grid place-items-center bg-[#f5f5f7] text-[13px] text-muted">
                Loading {title}…
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
            {/* Faint glass reflection */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{ background: "linear-gradient(115deg, rgb(255 255 255 / 0.07) 0%, transparent 38%)" }}
            />
          </div>
        </div>
      </div>
      {/* Hinge */}
      <div
        aria-hidden
        style={{
          margin: "0 6.5cqw",
          height: "0.55cqw",
          background: "linear-gradient(180deg, #1c1c1e 0%, #4a4a4d 100%)",
        }}
      />
      {/* Base with thumb scoop */}
      <div
        aria-hidden
        className="relative"
        style={{
          height: "1.5cqw",
          borderRadius: "0.2cqw 0.2cqw 2.2cqw 2.2cqw / 0.2cqw 0.2cqw 1.3cqw 1.3cqw",
          background: "linear-gradient(180deg, #f2f2f4 0%, #d6d7da 30%, #b4b5b8 75%, #8f9093 100%)",
          boxShadow: "inset 0 1px 0 rgb(255 255 255 / 0.9)",
        }}
      >
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2"
          style={{
            width: "13cqw",
            height: "0.7cqw",
            borderRadius: "0 0 1cqw 1cqw",
            background: "linear-gradient(180deg, #a9aaad 0%, #cfd0d3 100%)",
          }}
        />
      </div>
      {/* Contact shadow */}
      <div
        aria-hidden
        style={{
          margin: "-0.4cqw 3cqw 0",
          height: "2.4cqw",
          background: "radial-gradient(50% 50% at 50% 30%, rgb(0 0 0 / 0.22) 0%, transparent 100%)",
          filter: "blur(0.4cqw)",
        }}
      />
    </figure>
  );
}
