"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  layoutNextLineRange,
  materializeLineRange,
  prepareWithSegments,
  type LayoutCursor,
  type PreparedTextWithSegments,
} from "@chenglou/pretext";

interface Paragraph {
  text: string;
  muted?: boolean;
}

interface Line {
  x: number;
  y: number;
  text: string;
  muted?: boolean;
}

const BOWL = 128; // drawing size in px
const RADIUS = BOWL / 2 + 14; // text keeps this far from the bowl's center
const MIN_SLOT = 56; // don't squeeze words into slivers
const PARAGRAPH_GAP = 14;

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
  prepared: { p: PreparedTextWithSegments; muted?: boolean }[],
  width: number,
  lineHeight: number,
  bowl: { x: number; y: number },
) {
  const lines: Line[] = [];
  const cx = bowl.x + BOWL / 2;
  const cy = bowl.y + BOWL / 2;
  let y = 0;
  for (const { p, muted } of prepared) {
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
        lines.push({ x: left, y, text: materializeLineRange(p, range).text.trimStart(), muted });
        cursor = range.end;
        placed = true;
      }
      if (placed || !finished) y += lineHeight;
    }
    y += PARAGRAPH_GAP;
  }
  return { lines, height: Math.max(y - PARAGRAPH_GAP, bowl.y + BOWL) };
}

function MatchaBowl() {
  return (
    <svg
      viewBox="0 0 128 128"
      width={BOWL}
      height={BOWL}
      fill="none"
      stroke="currentColor"
      strokeWidth={1}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="draw"
      data-inview="true"
    >
      <path className="steam" pathLength={1} d="M52 44 C46 34 58 28 52 16" />
      <path className="steam" pathLength={1} d="M66 44 C60 32 72 26 66 12" />
      <path className="steam" pathLength={1} d="M80 44 C74 34 86 28 80 18" />
      <ellipse cx="64" cy="58" rx="44" ry="9" fill="var(--color-paper)" />
      <path d="M38 58 C46 54 54 61 64 57 C74 53 82 61 90 57" />
      <path d="M20 58 C22 86 40 102 64 102 C88 102 106 86 108 58" />
      <path d="M48 102 L50 110 L78 110 L80 102" />
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
    () => (font ? paragraphs.map((para) => ({ p: prepareWithSegments(para.text, font.font), muted: para.muted })) : null),
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
    <div ref={boxRef} className="relative text-[17px] leading-[1.65]" style={{ height: layout?.height }}>
      {layout ? (
        <>
          {layout.lines.map((line, i) => (
            <span
              key={i}
              className={`absolute whitespace-pre ${line.muted ? "text-muted" : ""}`}
              style={{ left: line.x, top: line.y }}
            >
              {line.text}
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
            <span className="pointer-events-none absolute -bottom-3 left-1/2 -translate-x-1/2 font-script text-[15px] whitespace-nowrap text-muted">
              drag me
            </span>
          </div>
        </>
      ) : (
        // Before pretext runs (and without JS), show plain paragraphs.
        <div className="space-y-3.5">
          {paragraphs.map((para) => (
            <p key={para.text} className={para.muted ? "text-muted" : undefined}>
              {para.text}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
