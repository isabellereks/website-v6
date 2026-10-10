"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { projects } from "@/data/projects";
import LaptopEmbed from "./LaptopEmbed";

// Page-wide record of when the current wheel gesture began (a 160ms pause starts
// a new one). Tracked from load, so the stage can tell momentum that started
// before it appeared from a fresh scroll.
const wheelGesture = { start: 0, last: 0 };
if (typeof window !== "undefined") {
  window.addEventListener(
    "wheel",
    () => {
      const now = performance.now();
      if (now - wheelGesture.last > 160) wheelGesture.start = now;
      wheelGesture.last = now;
    },
    { passive: true, capture: true },
  );
}

const LABEL_SPACE = 56; // room above the laptop for the project label
const CONTROLS_SPACE = 120; // room below for the slider and details

// liam.cv-style work view. At rest the MacBook sits on the page just below the
// tabs, peeking up from the bottom; scrolling down (or clicking it) lifts it to
// the center of the window while the intro fades away. Scrolling up, Escape, or
// clicking the background puts it back.
//
// The stage is positioned in page coordinates (not fixed to the window), so the
// resting laptop scrolls with the content and can never drift over the tabs.
const PEEK = 340; // how much of the resting laptop the page leaves room for
export default function WorkStage() {
  const anchorRef = useRef<HTMLDivElement>(null);
  const laptopRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  // Hidden until measured, then fades in while rising into its resting spot.
  const [entered, setEntered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [index, setIndex] = useState(0);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [layout, setLayout] = useState({ restTop: 0, laptopHeight: 0, scrollY: 0, vh: 0 });
  // Height of the open "About this project" text, so the focused view can make room for it.
  const detailsRef = useRef<HTMLDivElement>(null);
  const [detailsHeight, setDetailsHeight] = useState(0);
  useEffect(() => {
    const el = detailsRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => setDetailsHeight(el.scrollHeight));
    observer.observe(el);
    return () => observer.disconnect();
  }, [mounted]);

  // Scroll gestures that began before the stage appeared (or before the last
  // open/close) are trackpad momentum, not intent, so they're ignored.
  const lastToggleRef = useRef(0);
  const focus = (next: boolean) => {
    lastToggleRef.current = performance.now();
    setFocused(next);
    if (!next) setDetailsOpen(false);
  };

  // Measure where the laptop rests (where the tab panel starts) and where it centers.
  useLayoutEffect(() => {
    const measure = () => {
      const anchor = anchorRef.current;
      const laptop = laptopRef.current;
      if (!anchor || !laptop) return;
      const vh = window.innerHeight;
      const h = laptop.offsetHeight;
      setLayout({
        restTop: anchor.getBoundingClientRect().top + window.scrollY,
        laptopHeight: h,
        scrollY: window.scrollY,
        vh,
      });
    };
    let enterId = 0;
    const id = requestAnimationFrame(() => {
      setMounted(true);
      measure();
      // Two frames later the measured position has painted, so the entrance can animate from it.
      enterId = requestAnimationFrame(() => requestAnimationFrame(() => setEntered(true)));
    });
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, { passive: true });
    // Watch the content itself (body is pinned to the window height, so it never
    // resizes) and re-measure once web fonts land, since they change text height.
    const observer = new ResizeObserver(measure);
    const content = anchorRef.current?.closest("main") ?? document.body;
    observer.observe(content);
    document.fonts.ready.then(measure);
    document.fonts.addEventListener("loadingdone", measure);
    return () => {
      cancelAnimationFrame(id);
      cancelAnimationFrame(enterId);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure);
      document.fonts.removeEventListener("loadingdone", measure);
      observer.disconnect();
    };
  }, [mounted]);

  // Fade the intro and hold the page still while focused.
  useEffect(() => {
    const html = document.documentElement;
    html.dataset.workFocus = String(focused);
    if (focused) html.style.overflow = "hidden";
    return () => {
      delete html.dataset.workFocus;
      html.style.overflow = "";
    };
  }, [focused]);

  useEffect(() => {
    lastToggleRef.current = performance.now();
  }, []);

  // Scroll / swipe / keys to move between rest and focus.
  const gestureRef = useRef({ start: 0, sum: 0 });
  useEffect(() => {
    let touchY: number | null = null;
    const onWheel = (e: WheelEvent) => {
      if (wheelGesture.start < lastToggleRef.current) return;
      const g = gestureRef.current;
      if (g.start !== wheelGesture.start) {
        g.start = wheelGesture.start;
        g.sum = 0;
      }
      g.sum += e.deltaY;
      if (!focused && g.sum > 60) focus(true);
      if (focused && g.sum < -60) focus(false);
    };
    const onTouchStart = (e: TouchEvent) => (touchY = e.touches[0].clientY);
    const onTouchEnd = (e: TouchEvent) => {
      if (touchY === null) return;
      const dy = touchY - e.changedTouches[0].clientY;
      if (dy > 40) focus(true);
      if (dy < -40) focus(false);
      touchY = null;
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") focus(false);
      if (!focused) return;
      if (e.key === "ArrowRight") setIndex((i) => (i + 1) % projects.length);
      if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + projects.length) % projects.length);
    };
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("keydown", onKey);
    };
  }, [focused]);

  const project = projects[index];
  const go = (next: number) => setIndex((next + projects.length) % projects.length);

  // Focused position is the window's center, in page coordinates.
  // Fit label + laptop + controls + details in the window: center
  // the group, and shrink the laptop if the window is too short for all of it.
  // Always leave room for the details, so opening them reveals text downward
  // without moving anything (the trigger stays under the cursor).
  const extra = detailsHeight + 12;
  const room = layout.vh - LABEL_SPACE - CONTROLS_SPACE - extra - 24;
  const focusScale = layout.laptopHeight ? Math.min(1, Math.max(0.5, room / layout.laptopHeight)) : 1;
  const visibleHeight = layout.laptopHeight * focusScale;
  const focusTop = Math.max(LABEL_SPACE + 12, (layout.vh - visibleHeight - CONTROLS_SPACE - extra + LABEL_SPACE) / 2);
  const focusY = layout.scrollY + focusTop;
  // Room for the resting laptop to peek below the tabs, clipped like liam.cv;
  // when focused, cover the whole window.
  const restHeight = Math.max(layout.vh, layout.restTop + PEEK);
  const stageHeight = focused ? Math.max(restHeight, layout.scrollY + layout.vh) : restHeight;

  const stage = (
    <div
      className="work-stage absolute top-0 left-0 z-30 w-full overflow-hidden"
      data-focused={focused}
      style={{ height: stageHeight }}
      onClick={(e) => {
        if (focused && e.target === e.currentTarget) focus(false);
      }}
    >
      {/* Project label above the laptop */}
      <div
        className="work-chrome absolute left-1/2 -translate-x-1/2 text-[15px] whitespace-nowrap"
        style={{ top: focusY - LABEL_SPACE + 12 }}
      >
        <a className="link" href={project.url} target="_blank" rel="noopener noreferrer">
          {project.name}
        </a>
        <span aria-hidden className="text-muted"> ↗</span>
        <span className="text-muted"> · {project.year}</span>
      </div>

      <div
        ref={laptopRef}
        className="work-laptop absolute left-1/2 w-[min(880px,calc(100vw-32px))]"
        data-entered={entered}
        style={{
          top: 0,
          opacity: entered ? 1 : 0,
          transform: `translateX(-50%) translateY(${focused ? focusY : layout.restTop + (entered ? 0 : 48)}px) scale(${focused ? focusScale : 0.9})`,
        }}
      >
        {/* Click the resting laptop to lift it; the site becomes usable once focused. */}
        {!focused && (
          <button
            type="button"
            aria-label={`View projects, currently ${project.name}`}
            onClick={() => focus(true)}
            className="absolute inset-0 z-10 cursor-pointer"
          />
        )}
        <div className="grid">
          {projects.map((p, i) => (
            <div
              key={p.name}
              className="col-start-1 row-start-1 transition-opacity duration-300 ease-[var(--ease)]"
              style={{ opacity: i === index ? 1 : 0 }}
              aria-hidden={i !== index}
              inert={i !== index}
            >
              <LaptopEmbed url={p.url} title={p.name} active={i === index} interactive={focused && i === index} />
            </div>
          ))}
        </div>
      </div>

      {/* Slider and details below the laptop */}
      <div
        className="work-chrome absolute left-1/2 flex w-[min(560px,calc(100vw-32px))] -translate-x-1/2 flex-col items-center"
        style={{ top: focusY + visibleHeight + 4 }}
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label="Previous project"
            className="grid h-8 w-8 place-items-center rounded-full text-muted transition-colors hover:bg-[#f2f2f4] hover:text-ink"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
              <path d="M8.5 3 L4.5 7 L8.5 11" />
            </svg>
          </button>
          <div className="flex h-8 items-center gap-[6px] rounded-full bg-[#f2f2f4] px-3">
            {projects.map((p, i) => (
              <button
                key={p.name}
                type="button"
                aria-label={p.name}
                aria-current={i === index}
                onClick={() => setIndex(i)}
                className="h-[6px] rounded-full transition-all duration-300 ease-[var(--ease)]"
                style={{ width: i === index ? 24 : 6, background: i === index ? "var(--color-ink)" : "#c7c7cc" }}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label="Next project"
            className="grid h-8 w-8 place-items-center rounded-full text-muted transition-colors hover:bg-[#f2f2f4] hover:text-ink"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
              <path d="M5.5 3 L9.5 7 L5.5 11" />
            </svg>
          </button>
        </div>

        <button
          type="button"
          aria-expanded={detailsOpen}
          aria-controls="project-details"
          onClick={() => setDetailsOpen((o) => !o)}
          className="mt-3 inline-flex items-center gap-1 text-[14px] text-muted transition-colors hover:text-ink"
        >
          About this project
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            aria-hidden
            className={`transition-transform duration-300 ease-[var(--ease)] ${detailsOpen ? "rotate-180" : ""}`}
          >
            <path d="M3 4.5 L6 7.5 L9 4.5" />
          </svg>
        </button>
        <div
          id="project-details"
          className="grid w-full transition-[grid-template-rows,opacity] duration-300 ease-[var(--ease)]"
          style={{ gridTemplateRows: detailsOpen ? "1fr" : "0fr", opacity: detailsOpen ? 1 : 0 }}
          inert={!detailsOpen}
        >
          <div ref={detailsRef} className="overflow-hidden">
            <div className="pt-3 text-center text-[15px] leading-[24px] text-muted">
              <p className="text-ink">{project.tagline}</p>
              <p className="mt-1">{project.details.join(" ")}</p>
              <p className="mt-2 text-[13px]">{project.stack}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div ref={anchorRef} aria-hidden className="mt-16 h-px" />
      {mounted && createPortal(stage, document.body)}
    </>
  );
}
