"use client";

import { useRef, useState } from "react";
import { projects } from "@/data/projects";

const PREVIEW_W = 360;
const PREVIEW_H = 225;
const SCALE = 0.25;

export default function WorkIndex() {
  const [active, setActive] = useState<number | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const movePreview = (event: React.PointerEvent) => {
    const el = previewRef.current;
    if (!el) return;
    const x = Math.min(event.clientX + 24, window.innerWidth - PREVIEW_W - 16);
    const y = Math.min(event.clientY + 24, window.innerHeight - PREVIEW_H - 16);
    el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  };

  const project = active === null ? null : projects[active];

  return (
    <>
      <ol className="border-t border-ink">
        {projects.map((p, i) => (
          <li key={p.name} className="border-b border-rule">
            <a
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group grid grid-cols-[2.25rem_1fr_auto] items-baseline gap-x-4 py-5 md:grid-cols-[3rem_14rem_1fr_7rem_1.5rem]"
              onPointerEnter={(e) => {
                if (e.pointerType !== "mouse") return;
                movePreview(e);
                setActive(i);
              }}
              onPointerMove={movePreview}
              onPointerLeave={() => setActive(null)}
            >
              <span className="text-[12px] tabular-nums text-muted">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-xl font-light tracking-tight transition-colors group-hover:text-rose md:text-2xl">
                {p.name}
              </span>
              <span className="col-start-2 mt-1 text-[15px] text-muted md:col-start-auto md:mt-0">
                {p.description}
              </span>
              <span className="hidden text-[11px] uppercase tracking-[0.18em] text-muted md:block">
                {p.kind}
              </span>
              <span
                aria-hidden
                className="row-start-1 col-start-3 text-muted transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-rose md:col-start-5"
              >
                ↗
              </span>
            </a>
          </li>
        ))}
      </ol>

      <div
        ref={previewRef}
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 z-50 hidden overflow-hidden border border-ink bg-paper transition-opacity duration-200 md:block"
        style={{ width: PREVIEW_W, height: PREVIEW_H, opacity: project ? 1 : 0 }}
      >
        {project && (
          <iframe
            key={project.url}
            src={project.previewUrl ?? project.url}
            title=""
            tabIndex={-1}
            loading="lazy"
            sandbox="allow-scripts allow-same-origin"
            className="origin-top-left border-0"
            style={{
              width: PREVIEW_W / SCALE,
              height: PREVIEW_H / SCALE,
              transform: `scale(${SCALE})`,
            }}
          />
        )}
      </div>
    </>
  );
}
