"use client";

import { useInView } from "./useInView";

interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export default function Reveal({ children, delay = 0, className }: RevealProps) {
  const ref = useInView<HTMLDivElement>(0.15);
  return (
    <div
      ref={ref}
      data-reveal
      className={className}
      style={{ "--delay": `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
