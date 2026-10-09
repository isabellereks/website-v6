"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { projects } from "@/data/projects";
import LaptopEmbed from "./LaptopEmbed";

const LABEL_SPACE = 56; // room above the laptop for the project label
const CONTROLS_SPACE = 120; // room below for the slider and details

// liam.cv-style work view. At rest the MacBook peeks up from the bottom of the
// window; scrolling down (or clicking it) lifts it to the center while the intro
// fades away. Scrolling up, Escape, or clicking the background puts it back.
export default function WorkStage() {
  const anchorRef = useRef<HTMLDivElement>(null);
  const laptopRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  // Hidden until measured, then fades in while rising into its resting spot.
  const [entered, setEntered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [index, setIndex] = useState(0);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [layout, setLayout] = useState({ restTop: 0, focusTop: 0, laptopHeight: 0 });

  const focus = (next: boolean) => {
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
        restTop: anchor.getBoundingClientRect().top,
        focusTop: Math.max(LABEL_SPACE + 16, (vh - h - CONTROLS_SPACE + LABEL_SPACE) / 2),
        laptopHeight: h,
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
    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    return () => {
      cancelAnimationFrame(id);
      cancelAnimationFrame(enterId);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure);
      observer.disconnect();
    };
  }, [mounted]);

  // Fade the intro while focused.
  useEffect(() => {
    document.documentElement.dataset.workFocus = String(focused);
    return () => {
      delete document.documentElement.dataset.workFocus;
    };
  }, [focused]);

  // Scroll / swipe / keys to move between rest and focus.
  useEffect(() => {
    let touchY: number | null = null;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < 8) return;
      if (!focused && e.deltaY > 0) focus(true);
      if (focused && e.deltaY < 0) focus(false);
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

  const stage = (
    <div
      className="work-stage fixed inset-0 z-30 overflow-hidden"
      data-focused={focused}
      onClick={(e) => {
        if (focused && e.target === e.currentTarget) focus(false);
      }}
    >
      {/* Project label above the laptop */}
      <div
        className="work-chrome absolute left-1/2 -translate-x-1/2 text-[15px] whitespace-nowrap"
        style={{ top: layout.focusTop - LABEL_SPACE + 12 }}
      >
        <a className="link" href={project.url} target="_blank" rel="noopener noreferrer">
          {project.name}
        </a>
        <span className="text-muted"> · {project.year}</span>
      </div>

      <div
        ref={laptopRef}
        className="work-laptop absolute left-1/2 w-[min(880px,calc(100vw-32px))]"
        data-entered={entered}
        style={{
          top: 0,
          opacity: entered ? 1 : 0,
          transform: `translateX(-50%) translateY(${focused ? layout.focusTop : layout.restTop + (entered ? 0 : 48)}px) scale(${focused ? 1 : 0.9})`,
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
        style={{ top: layout.focusTop + layout.laptopHeight + 4 }}
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
          <div className="overflow-hidden">
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
