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

const BOWL = 132; // drawing size in px
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

// A chawan: hand-thrown rim, glaze drip, foot ring and a whisked matcha surface.
function MatchaBowl() {
  const foam = [
    [48, 52], [53, 50], [56, 55], [61, 51.5], [66, 49.5], [69, 55.5], [73, 52], [78, 50], [81, 55], [86, 52], [91, 54],
    [44, 54.5], [63, 57], [75, 57.5], [58, 48.8],
  ];
  return (
    <svg
      viewBox="0 0 132 132"
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
      <path className="steam" pathLength={1} d="M52 36 C46 27 57 22 51 10" />
      <path className="steam" pathLength={1} d="M66 34 C60 24 71 18 65 4" />
      <path className="steam" pathLength={1} d="M80 36 C74 27 85 22 79 12" />
      {/* Body and foot ring */}
      <path
        pathLength={1}
        d="M16 52 C17 74 28 94 48 101 C58 104.5 74 104.5 84 101 C104 94 115 74 116 52"
        fill="var(--color-paper)"
      />
      <path pathLength={1} d="M50 102 L49 110 C49 112 53 113 66 113 C79 113 83 112 83 110 L82 102" fill="var(--color-paper)" />
      <path pathLength={1} d="M52 109.5 C58 108 74 108 80 109.5" />
      {/* Glaze line with a few drips running down toward the bare clay */}
      <path
        pathLength={1}
        d="M18.5 66 C24 67 27 66 29 67 C30.5 68 30.5 75 32.5 75 C34.5 75 34 68 36 67.5 C42 66.5 48 68 54 67.5 C57 67.3 57.5 71 59.5 79 C61 82 63 81 63.5 77 C64 72 64 68.5 67 68 C74 67 80 68.5 86 67.5 C88 67.2 88.5 72 90.5 72 C92.5 72 92 67.5 95 67 C101 66 107 66.5 113.5 64.5"
      />
      {/* Bare clay speckle below the glaze */}
      {[
        [40, 84], [46, 90], [54, 87], [72, 89], [80, 85], [88, 90], [96, 83], [62, 94], [35, 78], [102, 78],
      ].map(([cx, cy]) => (
        <circle key={`c${cx}-${cy}`} pathLength={1} cx={cx} cy={cy} r={0.35} fill="currentColor" />
      ))}
      {/* Rim: a slightly uneven ellipse, like it was thrown by hand */}
      <path
        pathLength={1}
        d="M16 52 C16 45 38 40 66 40.5 C95 40 116 45.5 116 52 C116 59 94 63.5 66 63.5 C38 63.5 16 59 16 52 Z"
        fill="var(--color-paper)"
      />
      <path pathLength={1} d="M20.5 52.5 C21.5 47 41.5 43.5 66 43.5 C92 43.5 110.5 47.5 111.5 52.5" />
      {/* Whisked matcha */}
      <ellipse cx="66" cy="53.5" rx="41" ry="7.5" fill="#b5ca7c" fillOpacity={0.6} stroke="none" />
      <path pathLength={1} d="M54 53 C58 49.5 70 49 76 52 C80 54 76 56.5 68 56" strokeOpacity={0.45} />
      <path pathLength={1} d="M62 52.5 C66 51 72 51.5 73 53" strokeOpacity={0.45} />
      {foam.map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} pathLength={1} cx={cx} cy={cy} r={0.45} strokeOpacity={0.7} />
      ))}
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
