"use client";

import { useInView } from "./useInView";

// "Isabelle" in a script face, wiped in left to right like it's being written.
export default function Signature() {
  const ref = useInView<HTMLDivElement>(0.6);
  return (
    <div ref={ref} aria-label="Isabelle" role="img" className="inline-block">
      <span aria-hidden className="signature block font-script text-[56px] leading-none text-ink">
        Isabelle
      </span>
    </div>
  );
}
