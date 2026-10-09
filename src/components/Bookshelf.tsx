"use client";

import { useState } from "react";
import { books } from "@/data/books";
import { useInView } from "./useInView";

const BASE = 250;
const SHELF_LEFT = 20;
const SHELF_RIGHT = 740;
const BOOKS_LEFT = 168;
const GAP = 4;

// Each stroke gets pathLength=1 so the CSS draw-in works on any shape, and a
// delay from its starting x so the drawing sweeps across the shelf.
const stroke = (d: string, className?: string) => (
  <path
    key={d}
    d={d}
    pathLength={1}
    className={className}
    style={{ "--i": Math.round(parseFloat(d.slice(1)) / 20) } as React.CSSProperties}
  />
);

const placed = books.reduce<{ book: (typeof books)[number]; left: number }[]>((acc, book) => {
  const prev = acc.at(-1);
  const left = prev ? prev.left + prev.book.width + GAP : BOOKS_LEFT;
  return [...acc, { book, left }];
}, []);
const lastBook = placed.at(-1)!;
const BOOKS_RIGHT = lastBook.left + lastBook.book.width;

function plant() {
  return (
    <g>
      {stroke("M76 212 H136 L130 250 H82 Z")}
      {stroke("M74 206 H138 V212 H74 Z")}
      {stroke("M106 206 C104 180 96 160 84 138")}
      {stroke("M106 206 C108 176 118 156 132 140")}
      {stroke("M106 206 C106 170 106 140 108 110")}
      {stroke("M84 138 C70 134 64 120 70 108 C82 112 90 124 84 138 Z")}
      {stroke("M132 140 C146 136 152 122 146 110 C134 114 126 126 132 140 Z")}
      {stroke("M108 110 C98 102 98 86 108 76 C118 86 118 102 108 110 Z")}
      {stroke("M96 168 C86 160 76 162 70 170 C80 176 90 176 96 168 Z")}
    </g>
  );
}

function stackAndCup(x: number) {
  return (
    <g>
      {stroke(`M${x} ${BASE} V${BASE - 14} H${x + 96} V${BASE} Z`)}
      {stroke(`M${x + 6} ${BASE - 14} V${BASE - 26} H${x + 88} V${BASE - 14}`)}
      {stroke(`M${x + 6} ${BASE - 8} H${x + 96}`)}
      {stroke(`M${x + 28} ${BASE - 26} H${x + 70} L${x + 65} ${BASE - 58} H${x + 33} Z`)}
      {stroke(`M${x + 68} ${BASE - 50} C${x + 82} ${BASE - 50} ${x + 82} ${BASE - 34} ${x + 66} ${BASE - 34}`)}
      {stroke(`M${x + 34} ${BASE - 52} H${x + 64}`)}
      {stroke(`M${x + 42} ${BASE - 66} C${x + 36} ${BASE - 76} ${x + 48} ${BASE - 84} ${x + 42} ${BASE - 96}`, "steam")}
      {stroke(`M${x + 54} ${BASE - 66} C${x + 48} ${BASE - 78} ${x + 60} ${BASE - 86} ${x + 54} ${BASE - 102}`, "steam")}
    </g>
  );
}

function shelf() {
  return (
    <g>
      {stroke(`M${SHELF_LEFT} ${BASE} H${SHELF_RIGHT}`)}
      {stroke(`M${SHELF_LEFT} ${BASE + 9} H${SHELF_RIGHT}`)}
      {stroke(`M${SHELF_LEFT} ${BASE} V${BASE + 9}`)}
      {stroke(`M${SHELF_RIGHT} ${BASE} V${BASE + 9}`)}
      {stroke(`M70 ${BASE + 9} V${BASE + 36} L100 ${BASE + 9}`)}
      {stroke(`M690 ${BASE + 9} V${BASE + 36} L660 ${BASE + 9}`)}
    </g>
  );
}

export default function Bookshelf() {
  const ref = useInView<SVGSVGElement>(0.3);
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = books.find((b) => b.id === activeId);

  return (
    <figure>
      <svg
        ref={ref}
        viewBox="0 0 760 300"
        className="draw w-full overflow-visible"
        fill="none"
        stroke="currentColor"
        strokeWidth={1}
        strokeLinecap="round"
        strokeLinejoin="round"
        role="group"
        aria-label="Bookshelf"
      >
        {plant()}
        {placed.map(({ book, left }) => {
          const top = BASE - book.height;
          const right = left + book.width;
          const mid = left + book.width / 2;
          return (
            <a
              key={book.id}
              href={book.href}
              target="_blank"
              rel="noopener noreferrer"
              className="book-link"
              aria-label={`${book.title} by ${book.author}`}
              onPointerEnter={() => setActiveId(book.id)}
              onPointerLeave={() => setActiveId(null)}
              onFocus={() => setActiveId(book.id)}
              onBlur={() => setActiveId(null)}
            >
              <g className="book">
                <rect x={left} y={top} width={book.width} height={book.height} fill="var(--color-paper)" stroke="none" />
                {stroke(`M${left} ${BASE} V${top} H${right} V${BASE}`)}
                {stroke(`M${left} ${top + 12} H${right}`)}
                {stroke(`M${left} ${top + 16} H${right}`)}
                {stroke(`M${left} ${BASE - 14} H${right}`)}
                <text
                  className="fade"
                  x={mid}
                  y={top + (book.height - 2) / 2 + 8}
                  transform={`rotate(-90 ${mid} ${top + (book.height - 2) / 2 + 8})`}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="currentColor"
                  stroke="none"
                  fontSize={7}
                  letterSpacing="0.12em"
                  style={{ textTransform: "uppercase" }}
                >
                  {book.spine}
                </text>
              </g>
            </a>
          );
        })}
        {stackAndCup(BOOKS_RIGHT + 22)}
        {shelf()}
      </svg>
      <figcaption className="mt-6 flex min-h-6 items-baseline justify-between gap-4 text-[15px]">
        {active ? (
          <>
            <span>
              <span className="font-serif text-lg italic">{active.title}</span>
              <span className="text-muted"> by {active.author}</span>
            </span>
            <span className="text-[11px] uppercase tracking-[0.18em] text-muted">{active.category}</span>
          </>
        ) : (
          <span className="text-muted">Books I keep coming back to. Pull one off the shelf.</span>
        )}
      </figcaption>
    </figure>
  );
}
