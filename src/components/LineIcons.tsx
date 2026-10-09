// Small isometric line drawings that sit inline with text, Gordon Tu style.
const iconProps = {
  width: 30,
  height: 30,
  viewBox: "0 0 30 30",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1,
  strokeLinejoin: "round" as const,
  strokeLinecap: "round" as const,
  "aria-hidden": true,
  className: "inline-block align-[-0.35em] mx-1.5 text-ink",
};

// Stacked sheets: a tracker.
export function TrackerIcon() {
  return (
    <svg {...iconProps}>
      <path d="M4 18 L15 12 L26 18 L15 24 Z" />
      <path d="M4 14 L15 8 L26 14 L15 20 Z" fill="var(--color-paper)" />
      <path d="M4 10 L15 4 L26 10 L15 16 Z" fill="var(--color-paper)" />
      <path d="M10 10 L15 7.5 M12 11.5 L19 8" />
    </svg>
  );
}

// Folded map with a pin.
export function MapIcon() {
  return (
    <svg {...iconProps}>
      <path d="M3 10 L10 7 L17 10 L25 7 L27 21 L19 24 L12 21 L5 24 Z" />
      <path d="M10 7 L12 21 M17 10 L19 24" />
      <path d="M18 15.5 C16 13 16.5 10.5 18.5 10.5 C20.5 10.5 21 13 18.5 15.5" fill="var(--color-paper)" />
      <circle cx="18.6" cy="12.3" r="0.8" />
    </svg>
  );
}

// Isometric cube: a simulation.
export function SimIcon() {
  return (
    <svg {...iconProps}>
      <path d="M15 4 L25 9.5 L25 20.5 L15 26 L5 20.5 L5 9.5 Z" />
      <path d="M5 9.5 L15 15 L25 9.5 M15 15 V26" />
      <path d="M10 12.25 V23.25 M20 12.25 V23.25" strokeDasharray="1.5 2" />
    </svg>
  );
}
