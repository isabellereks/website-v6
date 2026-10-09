"use client";

import { useEffect, useRef } from "react";

const NAME = "Isabelle Reksopuro";

interface Song {
  title: string;
  // Kalimba number tab: 1–7 = C D E F G A B, each * raises an octave,
  // (chords) play their highest note, and | marks a phrase break (a short pause).
  tab: string;
  stepMs: number;
}

// Tabs from KalimbaTabs.net and kalimba covers.
const SONGS: Song[] = [
  {
    // BTS "DNA", from the Simple Kalimba tab: A C A · F A · A C · D D · D D · D D · C A
    title: "DNA",
    tab: "6 1* 6 4* 6* | 6 1* | 2* 2* 2* 2* 2* 2* | 1* 6",
    stepMs: 200,
  },
  {
    // Red Velvet "Feel My Rhythm", from the chorus ("Feel my rhythm, come with me") on.
    title: "Feel My Rhythm",
    tab: `(3*1) 3* 3* 3* 4* 3* (3*3) | 3* 2* 3* 2* 3* 2* (4*4) 3* 3* |
      5* 1** (1*1**) 7* 7* 6* (6*6) 5* (1*3*5*) | 1* 1* 2* 3* 3* 3* 5* (1*1**) |
      (13*) 3 5* (55*) 4* 3* 2* (11*) 3 5 | 6* (7*5) 7 6* (5*5) |
      5* 3* (5*3) 5 7 6* 5* 4* (3*3) 5 7 | 5* 4* 3* (2*2) 4 6 | 3* (2*2) 2*`,
    stepMs: 210,
  },
  {
    // NewJeans "Hype Boy": synth hook, verse, then chorus.
    title: "Hype Boy",
    tab: `3 3* 1* 6 3 2* 7 5 | 5 2* 7 5 6 1* 6 3 | 3 3* 1* 6 3 2* 7 5 | 5 2* 7 5 6 1* 6 3 |
      3 2 5 5 6 | 3 2 5 5 6 | 3 2 5 5 5 2* | 5 5 5 2* 1* 6 |
      1* 1* 1* 7 7 7 7 7 6 | 6 6 6 6 5 6 | 1* 1* 1* 7 7 7 7 7 6 | 6 6 6 6 5 6 |
      1* 3* 3* 2* 1* | 1* 7 1* 2* 5 | 1* 3* 3* 2* 1* | 1* 7 1* 2* 5 |
      1* 2* 3* 2* 1* 1* | 7 1* 2* 2* 1* 5* 3*`,
    stepMs: 190,
  },
];

const SCALE = [0, 2, 4, 5, 7, 9, 11]; // semitones of 1–7 above C
const C4 = 261.63;

// Turn a tab into notes, each with its start time in steps (phrase breaks add a rest).
function parseTab(tab: string) {
  const notes: { freq: number; step: number }[] = [];
  let step = 0;
  for (const token of tab.match(/\([^)]*\)|\||\d\**/g) ?? []) {
    if (token === "|") {
      step += 2;
      continue;
    }
    // For chords, the highest note carries the melody.
    const freqs = (token.match(/\d\**/g) ?? []).map((n) => C4 * 2 ** ((SCALE[Number(n[0]) - 1] + 12 * (n.length - 1)) / 12));
    notes.push({ freq: Math.max(...freqs), step });
    step += 1;
  }
  return notes;
}

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
  const songRef = useRef(parseTab(SONGS[0].tab));
  const songMsRef = useRef(SONGS[0].stepMs);
  const nextNoteRef = useRef(0);
  const playbackRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const lettersRef = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const song = pickSong();
    songRef.current = parseTab(song.tab);
    songMsRef.current = song.stepMs;
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

  // Each hover plays the next note, so sweeping across the name plays the song.
  const play = (i: number) => {
    hop(i);
    const notes = songRef.current;
    note(notes[nextNoteRef.current % notes.length].freq);
    nextNoteRef.current += 1;
  };

  // Click plays the whole song (click again to stop), letters hopping along.
  const playSong = () => {
    if (playbackRef.current.length) {
      playbackRef.current.forEach(clearTimeout);
      playbackRef.current = [];
      return;
    }
    const letters = NAME.split("").map((ch, i) => (ch === " " ? -1 : i)).filter((i) => i >= 0);
    const notes = songRef.current;
    playbackRef.current = notes.map((n, k) =>
      setTimeout(() => {
        hop(letters[k % letters.length]);
        note(n.freq);
        if (k === notes.length - 1) playbackRef.current = [];
      }, n.step * songMsRef.current),
    );
  };

  return (
    <h1 className="font-display text-[20px] leading-[28px] font-normal" aria-label={NAME}>
      <span
        role="button"
        tabIndex={0}
        aria-label={`Play ${NAME}`}
        className="inline-flex cursor-pointer select-none"
        onClick={playSong}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            playSong();
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
