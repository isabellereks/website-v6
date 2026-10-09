"use client";

import { useEffect, useRef } from "react";

const NAME = "Isabelle Reksopuro";

// "Feel my rhythm, come with me…" from Red Velvet's "Feel My Rhythm", from a
// piano letter-note tab (lowercase = natural, uppercase = sharp):
// f f f F f f C' C' f' f f f f f f F f — 17 notes, one per letter of the name.
const F4 = 349.23, Fs4 = 369.99, Cs5 = 554.37, F5 = 698.46;
const HOOK = [F4, F4, F4, Fs4, F4, F4, Cs5, Cs5, F5, F4, F4, F4, F4, F4, F4, Fs4, F4];
// Each note's position in the tab, in sixteenth-note steps, for the click playback rhythm.
const STEPS = [0, 2, 4, 6, 9, 10, 12, 13, 14, 16, 17, 18, 19, 20, 21, 22, 25];
const STEP_MS = 95;

// liam.cv-style name: letters hop and blush on hover, and each one plays the
// next note of the hook. Browsers only allow sound after a visitor's first
// click or keypress, so audio unlocks then.
export default function PlayableName() {
  const audioRef = useRef<AudioContext | null>(null);
  const lettersRef = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const unlock = () => {
      if (!audioRef.current) audioRef.current = new AudioContext();
      audioRef.current.resume();
    };
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      audioRef.current?.close();
    };
  }, []);

  // A soft kalimba-like pluck: sine plus a little octave shimmer, quick decay.
  const note = (freq: number) => {
    const ctx = audioRef.current;
    if (!ctx || ctx.state === "closed") return;
    if (ctx.state === "suspended") ctx.resume();
    const t = ctx.currentTime;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.14, t + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
    gain.connect(ctx.destination);
    for (const [mult, level] of [[1, 1], [2, 0.18]] as const) {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq * mult;
      g.gain.value = level;
      osc.connect(g).connect(gain);
      osc.start(t);
      osc.stop(t + 0.95);
    }
  };

  const hop = (i: number) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lift = [-7, -3, -1];
    for (let d = -2; d <= 2; d++) {
      const el = lettersRef.current[i + d];
      if (!el) continue;
      el.animate(
        [
          { transform: "translateY(0)", color: "var(--color-ink)" },
          { transform: `translateY(${lift[Math.abs(d)]}px)`, color: d === 0 ? "var(--color-rose)" : "var(--color-ink)", offset: 0.35 },
          { transform: "translateY(0)", color: "var(--color-ink)" },
        ],
        { duration: 520, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
      );
    }
  };

  // Letters are numbered skipping the space, so the hook runs straight across the name.
  const noteIndex = (i: number) => NAME.slice(0, i).replace(/ /g, "").length % HOOK.length;

  const play = (i: number) => {
    hop(i);
    note(HOOK[noteIndex(i)]);
  };

  const playHook = () => {
    // The click itself unlocks audio (the window listener runs first).
    const letters = NAME.split("").map((ch, i) => (ch === " " ? -1 : i)).filter((i) => i >= 0);
    HOOK.forEach((freq, k) => {
      setTimeout(() => {
        hop(letters[k % letters.length]);
        note(freq);
      }, STEPS[k] * STEP_MS);
    });
  };

  return (
    <h1 className="font-display text-[20px] leading-[28px] font-normal" aria-label={NAME}>
      <span
        role="button"
        tabIndex={0}
        aria-label={`Play ${NAME}`}
        className="inline-flex cursor-pointer select-none"
        onClick={playHook}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            playHook();
          }
        }}
      >
        {NAME.split("").map((ch, i) =>
          ch === " " ? (
            <span key={i} aria-hidden>
              &nbsp;
            </span>
          ) : (
            <span
              key={i}
              aria-hidden
              ref={(el) => {
                lettersRef.current[i] = el;
              }}
              className="inline-block will-change-transform"
              onPointerEnter={(e) => e.pointerType === "mouse" && play(i)}
            >
              {ch}
            </span>
          ),
        )}
      </span>
    </h1>
  );
}
