"use client";

import { useRef, useState } from "react";

const NAME = "Isabelle Reksopuro";

// A major pentatonic run, so any order of letters sounds pleasant.
const SCALE = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66, 1318.51, 1567.98, 1760.0];

// liam.cv-style name: letters hop and blush on hover, and each one is a note.
// Sound starts muted; the speaker toggle (a real click) is what unlocks audio.
export default function PlayableName() {
  const [soundOn, setSoundOn] = useState(false);
  const soundRef = useRef(false);
  const audioRef = useRef<AudioContext | null>(null);
  const lettersRef = useRef<(HTMLSpanElement | null)[]>([]);

  const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const note = (i: number) => {
    const ctx = audioRef.current;
    if (!soundRef.current || !ctx) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    osc.type = "triangle";
    osc.frequency.value = SCALE[i % SCALE.length];
    filter.type = "lowpass";
    filter.frequency.value = 2400;
    // A soft pluck: quick attack, gentle decay.
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.12, t + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);
    osc.connect(filter).connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.75);
  };

  const hop = (i: number) => {
    if (reduced()) return;
    const lift = [-7, -3, -1];
    for (let d = -2; d <= 2; d++) {
      const el = lettersRef.current[i + d];
      if (!el || NAME[i + d] === " ") continue;
      const y = lift[Math.abs(d)];
      el.animate(
        [
          { transform: "translateY(0)", color: "var(--color-ink)" },
          { transform: `translateY(${y}px)`, color: d === 0 ? "var(--color-rose)" : "var(--color-ink)", offset: 0.35 },
          { transform: "translateY(0)", color: "var(--color-ink)" },
        ],
        { duration: 520, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
      );
    }
  };

  const play = (i: number) => {
    hop(i);
    note(i);
  };

  const setSound = (on: boolean) => {
    if (on) {
      if (!audioRef.current) audioRef.current = new AudioContext();
      audioRef.current.resume();
    }
    soundRef.current = on;
    setSoundOn(on);
  };

  // Clicking the name unmutes and plays it, like liam.cv.
  const playMelody = () => {
    if (!soundRef.current) setSound(true);
    let k = 0;
    NAME.split("").forEach((ch, i) => {
      if (ch === " ") return;
      setTimeout(() => play(i), k++ * 85);
    });
  };


  return (
    <h1 className="flex items-center gap-1 font-display text-[20px] leading-[28px] font-normal" aria-label={NAME}>
      <span
        role="button"
        tabIndex={0}
        aria-label={`Unmute and play ${NAME} as a melody`}
        className="inline-flex cursor-pointer select-none"
        onClick={playMelody}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            playMelody();
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
      <button
        type="button"
        onClick={() => setSound(!soundOn)}
        aria-label={soundOn ? "Mute name sounds" : "Unmute name sounds"}
        aria-pressed={soundOn}
        className="grid h-8 w-8 place-items-center rounded-full text-muted transition-colors hover:bg-[#f2f2f4] hover:text-ink"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M2.5 6v4h2.5l3.5 3V3L5 6z" fill="currentColor" stroke="none" />
          {soundOn ? (
            <>
              <path d="M10.8 5.8a3 3 0 0 1 0 4.4" />
              <path d="M12.6 4a5.5 5.5 0 0 1 0 8" />
            </>
          ) : (
            <path d="M11 6l3.5 4M14.5 6L11 10" />
          )}
        </svg>
      </button>
    </h1>
  );
}
