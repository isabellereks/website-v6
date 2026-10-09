"use client";

import { useState } from "react";
import { photos } from "@/data/photos";

// A "lore" link that fans out a stack of polaroids on hover, Aiden Bai style.
export default function LorePhotos() {
  const [open, setOpen] = useState(false);
  const mid = (photos.length - 1) / 2;

  return (
    <div onPointerEnter={() => setOpen(true)} onPointerLeave={() => setOpen(false)}>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="label inline-flex items-center gap-1 transition-colors hover:text-ink"
      >
        lore
        <span aria-hidden className={`transition-transform duration-300 ${open ? "rotate-90" : ""}`}>
          ›
        </span>
      </button>
      <div
        className="relative mx-auto mt-4 h-[150px] max-w-[560px] transition-[height,opacity] duration-500"
        style={{ height: open ? 150 : 0, opacity: open ? 1 : 0 }}
        aria-hidden={!open}
      >
        {photos.map((photo, i) => {
          const offset = i - mid;
          return (
            <figure
              key={photo.caption}
              className="absolute top-0 left-1/2 w-[92px] bg-white p-[6px] pb-[22px] shadow-[0_8px_20px_-10px_rgb(0_0_0/0.35)] ring-1 ring-black/5 transition-transform duration-500 ease-[cubic-bezier(0.3,1.3,0.5,1)] hover:z-10 hover:!-translate-y-3"
              style={{
                transform: open
                  ? `translateX(calc(-50% + ${offset * 70}px)) translateY(${Math.abs(offset) * 6}px) rotate(${offset * 4}deg)`
                  : "translateX(-50%) rotate(0deg)",
                transitionDelay: `${Math.abs(offset) * 30}ms`,
              }}
            >
              {photo.src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photo.src} alt={photo.caption} className="aspect-square w-full object-cover" />
              ) : (
                <div
                  className="aspect-square w-full bg-paper"
                  style={{
                    backgroundImage:
                      "linear-gradient(var(--color-rule) 1px, transparent 1px), linear-gradient(90deg, var(--color-rule) 1px, transparent 1px)",
                    backgroundSize: "8px 8px",
                  }}
                />
              )}
              <figcaption className="absolute right-0 bottom-[5px] left-0 text-center font-script text-[13px] leading-none text-ink/80">
                {photo.caption}
              </figcaption>
            </figure>
          );
        })}
      </div>
    </div>
  );
}
