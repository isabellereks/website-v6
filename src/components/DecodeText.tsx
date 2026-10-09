"use client";

import { Fragment, useEffect, useState } from "react";

export type DecodePart =
  | string
  | { text: string; href: string }
  | { icon: React.ReactNode; href: string; label: string };

const GLYPHS = "abcdefghijklmnopqrstuvwxyz";
const DURATION_MS = 1400;
const TICK_MS = 55;

// Deterministic scramble so the server and first client render match.
function scramble(text: string, seed: number) {
  let out = "";
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (!/[a-z]/i.test(ch)) {
      out += ch;
      continue;
    }
    const n = Math.abs(Math.sin((i + 1) * 12.9898 + seed * 78.233) * 43758.5453);
    const g = GLYPHS[Math.floor((n % 1) * GLYPHS.length)];
    out += ch === ch.toUpperCase() ? g.toUpperCase() : g;
  }
  return out;
}

const textOf = (part: DecodePart) =>
  typeof part === "string" ? part : "text" in part ? part.text : "";

function renderPart(part: DecodePart, shown: React.ReactNode, interactive: boolean) {
  if (typeof part === "string") return shown;
  if ("text" in part) {
    return (
      <a className="link" href={part.href} tabIndex={interactive ? undefined : -1}>
        {shown}
      </a>
    );
  }
  return (
    <a href={part.href} aria-label={part.label} tabIndex={interactive ? undefined : -1}>
      {part.icon}
    </a>
  );
}

// Text that decodes from scrambled letters into words, left to right.
export default function DecodeText({ parts }: { parts: DecodePart[] }) {
  const total = parts.reduce((n, p) => n + textOf(p).length, 0);
  const [state, setState] = useState({ revealed: 0, tick: 0 });
  const done = state.revealed >= total;

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const start = performance.now();
    const id = setInterval(() => {
      const t = reduced ? 1 : Math.min(1, (performance.now() - start) / DURATION_MS);
      const eased = 1 - Math.pow(1 - t, 2);
      setState((s) => ({ revealed: Math.round(eased * total), tick: s.tick + 1 }));
      if (t === 1) clearInterval(id);
    }, TICK_MS);
    return () => clearInterval(id);
  }, [total]);

  if (done) {
    return (
      <>
        {parts.map((part, i) => (
          <Fragment key={i}>{renderPart(part, textOf(part), true)}</Fragment>
        ))}
      </>
    );
  }

  const starts = parts.map((_, i) => parts.slice(0, i).reduce((n, p) => n + textOf(p).length, 0));
  return (
    <>
      <span className="sr-only">{parts.map(textOf).join("")}</span>
      <span aria-hidden>
        {parts.map((part, i) => {
          const text = textOf(part);
          const start = starts[i];
          const clear = Math.max(0, Math.min(text.length, state.revealed - start));
          const shown = (
            <>
              {text.slice(0, clear)}
              <span className="text-muted/60">{scramble(text.slice(clear), state.tick + start + clear)}</span>
            </>
          );
          return <Fragment key={i}>{renderPart(part, shown, false)}</Fragment>;
        })}
      </span>
    </>
  );
}
