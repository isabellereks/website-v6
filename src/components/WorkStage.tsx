"use client";

import { useEffect, useState } from "react";
import { projects } from "@/data/projects";
import LaptopEmbed from "./LaptopEmbed";
import Reveal from "./Reveal";

// When the page last received a wheel event, tracked page-wide from load.
const wheel = { last: 0 };
if (typeof window !== "undefined") {
  window.addEventListener("wheel", () => (wheel.last = performance.now()), { passive: true, capture: true });
}

// The embedded site only takes input once the page has stopped scrolling, so
// scrolling down to the laptop (and its momentum) never spills into it. After
// that, pointing at the laptop and scrolling scrolls the site inside.
function usePageSettled() {
  const [settled, setSettled] = useState(true);
  useEffect(() => {
    const id = setInterval(() => setSettled(performance.now() - wheel.last > 400), 120);
    return () => clearInterval(id);
  }, []);
  return settled;
}

// Phones and tablets: never let the embed capture touch scrolling.
function useCanHover() {
  const [canHover, setCanHover] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setCanHover(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return canHover;
}

// liam.cv-style work section: a MacBook with the live site, a slider to move
// between projects, and the description in a dropdown.
export default function WorkStage() {
  const [index, setIndex] = useState(0);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const settled = usePageSettled();
  const canHover = useCanHover();
  const project = projects[index];
  const go = (next: number) => setIndex((next + projects.length) % projects.length);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && e.target.closest("input, textarea")) return;
      if (e.key === "ArrowRight") setIndex((i) => (i + 1) % projects.length);
      if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + projects.length) % projects.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <Reveal className="relative left-1/2 mt-14 w-[min(880px,calc(100vw-32px))] -translate-x-1/2">
      <p className="mb-4 text-center text-[15px]">
        <a className="link" href={project.url} target="_blank" rel="noopener noreferrer">
          {project.name}
        </a>
        <span aria-hidden className="text-muted"> ↗</span>
        <span className="text-muted"> · {project.year}</span>
      </p>

      <div className="relative grid">
        {projects.map((p, i) => (
          <div
            key={p.name}
            className="col-start-1 row-start-1 transition-opacity duration-300 ease-[var(--ease)]"
            style={{ opacity: i === index ? 1 : 0 }}
            aria-hidden={i !== index}
            inert={i !== index}
          >
            <LaptopEmbed url={p.url} title={p.name} active={i === index} interactive={canHover && settled && i === index} />
          </div>
        ))}
        {!canHover && (
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open ${project.name}`}
            className="absolute inset-0 z-10"
          />
        )}
      </div>

      <div className="mx-auto mt-1 flex w-full max-w-[560px] flex-col items-center">
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
        {/* Opens downward, so the trigger stays under the cursor. */}
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
    </Reveal>
  );
}
