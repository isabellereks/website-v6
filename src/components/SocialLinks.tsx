"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { SocialStats } from "@/app/api/socials/route";

const EMAIL = "reksopuro.isabelle@gmail.com";

interface Social {
  label: string;
  href: string;
  brand: string;
  card: (stats: SocialStats | null) => React.ReactNode;
}

function Profile({ handle, line }: { handle: string; line?: React.ReactNode }) {
  return (
    <span className="flex items-center gap-3">
      <Image src="/headshot.jpeg" alt="" width={40} height={40} className="h-10 w-10 shrink-0 rounded-full object-cover" />
      <span className="block min-w-0">
        <span className="block truncate text-[14px] leading-5 text-ink">Isabelle Reksopuro</span>
        <span className="block truncate text-[13px] leading-5 text-muted">{handle}</span>
        {line && <span className="mt-0.5 block text-[13px] leading-5 text-muted">{line}</span>}
      </span>
    </span>
  );
}

function CopyEmail() {
  const [copied, setCopied] = useState(false);
  return (
    <span className="flex items-center justify-between gap-3">
      <span className="truncate text-[13px] text-ink">{EMAIL}</span>
      <button
        type="button"
        onClick={() => {
          navigator.clipboard.writeText(EMAIL).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1400);
          });
        }}
        className="shrink-0 rounded-full bg-[#f2f2f4] px-2.5 py-1 text-[12px] text-ink transition-colors hover:bg-[#e8e8ed]"
      >
        {copied ? "Copied" : "Copy"}
      </button>
    </span>
  );
}

const socials: Social[] = [
  {
    label: "X",
    href: "https://twitter.com/isareksopuro",
    brand: "#000000",
    card: () => <Profile handle="@isareksopuro" />,
  },
  {
    label: "Substack",
    href: "https://isaishangry.substack.com/",
    brand: "#ff6719",
    card: (stats) =>
      stats?.substack ? (
        <span className="block">
          <span className="block text-[12px] text-muted">Latest post · {stats.substack.date}</span>
          <span className="mt-0.5 block text-[14px] leading-5 text-ink">{stats.substack.title}</span>
        </span>
      ) : (
        <span className="block text-[13px] text-muted">Essays on Substack</span>
      ),
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/isabellereks/",
    brand: "#0a66c2",
    card: () => <Profile handle="Student at the University of Washington" />,
  },
  {
    label: "GitHub",
    href: "https://github.com/isabellereks",
    brand: "#1f2328",
    card: (stats) => (
      <Profile
        handle="@isabellereks"
        line={stats?.github ? `${stats.github.repos} repos · ${stats.github.followers} followers` : undefined}
      />
    ),
  },
  {
    label: "email",
    href: `mailto:${EMAIL}`,
    brand: "#ad606e",
    card: () => <CopyEmail />,
  },
];

// A link that tints to its brand color and shows a tiny card on hover, like liam.cv.
function SocialLink({ social, stats }: { social: Social; stats: SocialStats | null }) {
  const [open, setOpen] = useState(false);
  const leave = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = () => {
    if (leave.current) clearTimeout(leave.current);
    setOpen(true);
  };
  const hide = () => {
    leave.current = setTimeout(() => setOpen(false), 120);
  };

  return (
    <span
      className="relative inline-block"
      onPointerEnter={(e) => e.pointerType === "mouse" && show()}
      onPointerLeave={hide}
      style={{ "--brand": social.brand } as React.CSSProperties}
    >
      <a
        className="social-link link"
        data-open={open}
        href={social.href}
        target={social.href.startsWith("mailto") ? undefined : "_blank"}
        rel="noopener noreferrer"
        onFocus={show}
        onBlur={hide}
      >
        {social.label}
      </a>
      <span
        className="social-card absolute top-full left-1/2 z-40 mt-2 w-max max-w-[320px] min-w-[220px] rounded-2xl bg-white p-3 text-left shadow-[0_1px_2px_rgb(0_0_0/0.04),0_12px_32px_-8px_rgb(0_0_0/0.18)] ring-1 ring-black/[0.06]"
        data-open={open}
        role="tooltip"
      >
        {social.card(stats)}
      </span>
    </span>
  );
}

export default function SocialLinks() {
  const [stats, setStats] = useState<SocialStats | null>(null);

  useEffect(() => {
    fetch("/api/socials")
      .then((r) => (r.ok ? r.json() : null))
      .then(setStats)
      .catch(() => {});
  }, []);

  return (
    <p>
      Say hi on{" "}
      {socials.map((s, i) => (
        <span key={s.label}>
          <SocialLink social={s} stats={stats} />
          {i < socials.length - 2 ? ", " : i === socials.length - 2 ? " or " : ""}
        </span>
      ))}
      , or{" "}
      <a className="link" href="https://cal.com/isabellereks">
        grab a matcha
      </a>{" "}
      :)
    </p>
  );
}
