"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  layoutNextLineRange,
  materializeLineRange,
  prepareWithSegments,
  type LayoutCursor,
  type PreparedTextWithSegments,
} from "@chenglou/pretext";

// A paragraph is a list of runs so links survive pretext's plain-text layout.
export interface Run {
  text: string;
  href?: string;
}

export interface Paragraph {
  runs: Run[];
  muted?: boolean;
}

interface Line {
  x: number;
  y: number;
  runs: Run[];
  muted?: boolean;
}

const fullText = (para: Paragraph) => para.runs.map((r) => r.text).join("");

// The runs covering characters [start, end) of a paragraph.
function sliceRuns(runs: Run[], start: number, end: number) {
  const out: Run[] = [];
  let pos = 0;
  for (const run of runs) {
    const a = Math.max(start, pos);
    const b = Math.min(end, pos + run.text.length);
    if (a < b) out.push({ text: run.text.slice(a - pos, b - pos), href: run.href });
    pos += run.text.length;
  }
  return out;
}

const BOWL = 104; // drawing size in px
const RADIUS = BOWL / 2 + 10; // text keeps this far from the bowl's center
const MIN_SLOT = 56; // don't squeeze words into slivers
const PARAGRAPH_GAP = 8;

// Free horizontal slots for one line, after cutting out the circle around the bowl.
function slotsFor(top: number, bottom: number, width: number, cx: number, cy: number) {
  const nearest = Math.max(top, Math.min(cy, bottom));
  const dy = Math.abs(cy - nearest);
  if (dy >= RADIUS) return [[0, width]];
  const half = Math.sqrt(RADIUS * RADIUS - dy * dy);
  return [
    [0, cx - half],
    [cx + half, width],
  ].filter(([a, b]) => b - a >= MIN_SLOT);
}

function layoutAround(
  prepared: { p: PreparedTextWithSegments; para: Paragraph }[],
  width: number,
  lineHeight: number,
  bowl: { x: number; y: number },
) {
  const lines: Line[] = [];
  const cx = bowl.x + BOWL / 2;
  const cy = bowl.y + BOWL / 2;
  let y = 0;
  for (const { p, para } of prepared) {
    const text = fullText(para);
    let offset = 0; // where the next line starts in `text`
    let cursor: LayoutCursor = { segmentIndex: 0, graphemeIndex: 0 };
    let finished = false;
    while (!finished) {
      let placed = false;
      for (const [left, right] of slotsFor(y, y + lineHeight, width, cx, cy)) {
        const range = layoutNextLineRange(p, cursor, right - left);
        if (!range) {
          finished = true;
          break;
        }
        // Find the line in the source text so we can carry links over to it.
        const lineText = materializeLineRange(p, range).text.trim();
        const start = text.indexOf(lineText, offset);
        const from = start === -1 ? offset : start;
        offset = from + lineText.length;
        lines.push({ x: left, y, runs: sliceRuns(para.runs, from, offset), muted: para.muted });
        cursor = range.end;
        placed = true;
      }
      if (placed || !finished) y += lineHeight;
    }
    y += PARAGRAPH_GAP;
  }
  return { lines, height: Math.max(y - PARAGRAPH_GAP, bowl.y + BOWL) };
}

// A simple matcha bowl: rim, body, foot and a green surface.
function MatchaBowl() {
  return (
    <svg
      viewBox="0 0 132 132"
      width={BOWL}
      height={BOWL}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="draw text-ink"
      data-inview="true"
    >
      <path className="steam" pathLength={1} d="M58 38 C53 30 63 25 58 15" />
      <path className="steam" pathLength={1} d="M74 38 C69 30 79 25 74 15" />
      <path pathLength={1} d="M18 54 C18 80 38 100 66 100 C94 100 114 80 114 54" fill="var(--color-paper)" />
      <path pathLength={1} d="M52 100 L54 108 H78 L80 100" />
      <ellipse cx="66" cy="54" rx="48" ry="10" fill="var(--color-paper)" />
      <ellipse cx="66" cy="55" rx="41" ry="6.5" fill="#b5ca7c" fillOpacity={0.7} stroke="none" />
    </svg>
  );
}

// Paragraphs laid out with pretext so they flow around a matcha bowl you can drag.
export default function FlowText({ paragraphs }: { paragraphs: Paragraph[] }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [font, setFont] = useState<{ font: string; lineHeight: number } | null>(null);
  const [width, setWidth] = useState(0);
  const [bowl, setBowl] = useState<{ x: number; y: number } | null>(null);
  const drag = useRef<{ dx: number; dy: number } | null>(null);

  useLayoutEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const measure = () => {
      const style = getComputedStyle(box);
      setFont({
        font: `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`,
        lineHeight: parseFloat(style.lineHeight),
      });
      setWidth(box.clientWidth);
    };
    const observer = new ResizeObserver(measure);
    observer.observe(box);
    // Re-measure once the web fonts land, since glyph widths change.
    document.fonts.ready.then(measure);
    return () => observer.disconnect();
  }, []);

  // Pretext's line breaking can't run until we know the real font and width.
  const prepared = useMemo(
    () => (font ? paragraphs.map((para) => ({ p: prepareWithSegments(fullText(para), font.font), para })) : null),
    [font, paragraphs],
  );

  const position = bowl ?? (width ? { x: width - BOWL + 8, y: 8 } : null);
  const layout =
    prepared && font && width && position ? layoutAround(prepared, width, font.lineHeight, position) : null;

  useEffect(() => {
    const move = (e: PointerEvent) => {
      const box = boxRef.current;
      if (!drag.current || !box) return;
      const rect = box.getBoundingClientRect();
      setBowl({
        x: Math.max(-16, Math.min(rect.width - BOWL + 16, e.clientX - rect.left - drag.current.dx)),
        y: Math.max(-16, Math.min(rect.height - BOWL / 2, e.clientY - rect.top - drag.current.dy)),
      });
    };
    const up = () => (drag.current = null);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, []);

  return (
    <div ref={boxRef} className="relative text-[16px] leading-[26px]" style={{ height: layout?.height }}>
      {layout ? (
        <>
          {layout.lines.map((line, i) => (
            <span
              key={i}
              className={`absolute whitespace-pre ${line.muted ? "text-muted" : ""}`}
              style={{ left: line.x, top: line.y }}
            >
              {line.runs.map((run, j) =>
                run.href ? (
                  <a key={j} className="link" href={run.href}>
                    {run.text}
                  </a>
                ) : (
                  run.text
                ),
              )}
            </span>
          ))}
          <div
            className="absolute cursor-grab touch-none select-none active:cursor-grabbing"
            style={{ left: position!.x, top: position!.y, width: BOWL, height: BOWL }}
            onPointerDown={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              drag.current = { dx: e.clientX - rect.left, dy: e.clientY - rect.top };
            }}
            title="Drag the matcha"
          >
            <MatchaBowl />
            <span className="pointer-events-none absolute -bottom-2 left-1/2 -translate-x-1/2 text-[11px] whitespace-nowrap text-muted/70">
              drag me
            </span>
          </div>
        </>
      ) : (
        // Before pretext runs (and without JS), show plain paragraphs.
        <div className="space-y-2">
          {paragraphs.map((para, i) => (
            <p key={i} className={para.muted ? "text-muted" : undefined}>
              {para.runs.map((run, j) =>
                run.href ? (
                  <a key={j} className="link" href={run.href}>
                    {run.text}
                  </a>
                ) : (
                  run.text
                ),
              )}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
