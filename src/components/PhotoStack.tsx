"use client";

import { useState } from "react";
import { photos } from "@/data/photos";

// A tight fan of polaroids that spreads out on hover, aidenybai.com style.
export default function PhotoStack() {
  const [open, setOpen] = useState(false);
  const mid = (photos.length - 1) / 2;

  return (
    <div
      className="relative mx-auto h-[150px] w-full max-w-[560px]"
      onPointerEnter={() => setOpen(true)}
      onPointerLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      tabIndex={0}
      aria-label="Photos"
      role="group"
    >
      {photos.map((photo, i) => {
        const offset = i - mid;
        const spread = open ? 74 : 26;
        return (
          <figure
            key={photo.caption}
            className="absolute top-2 left-1/2 w-[104px] rounded-[3px] bg-white p-[6px] pb-[24px] shadow-[0_1px_2px_rgb(0_0_0/0.06),0_10px_24px_-12px_rgb(0_0_0/0.28)] ring-1 ring-black/[0.06] transition-transform duration-500 ease-[var(--ease)] hover:z-10"
            style={{
              transform: `translateX(calc(-50% + ${offset * spread}px)) translateY(${Math.abs(offset) * (open ? 5 : 3)}px) rotate(${offset * (open ? 5 : 3.5)}deg)`,
              zIndex: photos.length - Math.abs(Math.round(offset)),
            }}
          >
            {photo.src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photo.src} alt={photo.caption} className="aspect-square w-full rounded-[1px] object-cover" />
            ) : (
              <div className="aspect-square w-full rounded-[1px] bg-[#f2f2f4]" />
            )}
            <figcaption className="absolute right-0 bottom-[6px] left-0 text-center text-[11px] leading-none text-muted">
              {photo.caption}
            </figcaption>
          </figure>
        );
      })}
    </div>
  );
}
