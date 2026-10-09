"use client";

import { useEffect, useRef } from "react";

const NAME = "Isabelle Reksopuro";

interface Song {
  title: string;
  notes: number[];
  // Each note's position in sixteenth-note steps, for the click playback rhythm.
  steps: number[];
  stepMs: number;
}

const E4 = 329.63, F4 = 349.23, Fs4 = 369.99, G4 = 392.0, A4 = 440.0, B4 = 493.88;
const C5 = 523.25, Cs5 = 554.37, D5 = 587.33, E5 = 659.25, F5 = 698.46, A5 = 880.0;

// Melodies transcribed from fan kalimba/piano letter-note tabs.
const SONGS: Song[] = [
  {
    // BTS "DNA" (kalimba tab): A C A · F A · A C · D D · D D · D D · C A
    title: "DNA",
    notes: [A4, C5, A4, F5, A5, A4, C5, D5, D5, D5, D5, D5, D5, C5, A4],
    steps: [0, 1, 2, 4, 5, 7, 8, 10, 11, 13, 14, 16, 17, 19, 20],
    stepMs: 130,
  },
  {
    // Red Velvet "Feel My Rhythm": "feel my rhythm, come with me…" (lowercase = natural, uppercase = sharp)
    title: "Feel My Rhythm",
    notes: [F4, F4, F4, Fs4, F4, F4, Cs5, Cs5, F5, F4, F4, F4, F4, F4, F4, Fs4, F4],
    steps: [0, 2, 4, 6, 9, 10, 12, 13, 14, 16, 17, 18, 19, 20, 21, 22, 25],
    stepMs: 95,
  },
  {
    // NewJeans "Hype Boy" synth hook: E E' C' A E D' B G | G D' B G A C' A E
    title: "Hype Boy",
    notes: [E4, E5, C5, A4, E4, D5, B4, G4, G4, D5, B4, G4, A4, C5, A4, E4],
    steps: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    stepMs: 150,
  },
];

// Rotate to the next song on every visit (falls back to random without storage).
// Cached so it advances once per page load, even if effects run twice in dev.
let picked: Song | null = null;
function pickSong() {
  if (picked) return picked;
  picked = rotate();
  return picked;
}
function rotate() {
  try {
    const next = (Number(localStorage.getItem("name-song") ?? -1) + 1) % SONGS.length;
    localStorage.setItem("name-song", String(next));
    return SONGS[next];
  } catch {
    return SONGS[Math.floor(Math.random() * SONGS.length)];
  }
}

// liam.cv-style name: letters hop and blush on hover, and each one plays the
// next note of a K-pop hook (a different song each visit). Browsers only allow sound after a visitor's first
// click or keypress, so audio unlocks then.
export default function PlayableName() {
  const audioRef = useRef<AudioContext | null>(null);
  const songRef = useRef<Song>(SONGS[0]);
  const lettersRef = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    songRef.current = pickSong();
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
  const noteIndex = (i: number) => NAME.slice(0, i).replace(/ /g, "").length % songRef.current.notes.length;

  const play = (i: number) => {
    hop(i);
    note(songRef.current.notes[noteIndex(i)]);
  };

  const playHook = () => {
    // The click itself unlocks audio (the window listener runs first).
    const letters = NAME.split("").map((ch, i) => (ch === " " ? -1 : i)).filter((i) => i >= 0);
    const song = songRef.current;
    song.notes.forEach((freq, k) => {
      setTimeout(() => {
        hop(letters[k % letters.length]);
        note(freq);
      }, song.steps[k] * song.stepMs);
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
