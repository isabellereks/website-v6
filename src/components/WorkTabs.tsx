"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { writing } from "@/data/writing";
import WorkStage from "./WorkStage";
import Bookshelf from "./Bookshelf";
import About from "./About";

const tabs = ["Work", "About", "Writing", "Reading"] as const;
type Tab = (typeof tabs)[number];

// Wider than the text column.
const bleed = "relative left-1/2 w-[min(880px,calc(100vw-32px))] -translate-x-1/2";

// v4's pill: a white highlight that springs to the selected tab.
function TabPill({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  const refs = useRef<Partial<Record<Tab, HTMLButtonElement | null>>>({});
  const [box, setBox] = useState<{ left: number; width: number } | null>(null);

  useLayoutEffect(() => {
    const el = refs.current[tab];
    if (el) setBox({ left: el.offsetLeft, width: el.offsetWidth });
  }, [tab]);

  return (
    <div role="tablist" aria-label="Sections" className="relative flex w-fit gap-1 rounded-full bg-[#f2f2f4] p-1">
      {box && (
        <span
          aria-hidden
          className="absolute top-1 bottom-1 rounded-full bg-white shadow-[0_1px_2px_rgb(0_0_0/0.08),0_1px_6px_rgb(0_0_0/0.04)] transition-[left,width] duration-300 ease-[var(--ease)] motion-reduce:transition-none"
          style={{ left: box.left, width: box.width }}
        />
      )}
      {tabs.map((t) => (
        <button
          key={t}
          ref={(el) => {
            refs.current[t] = el;
          }}
          type="button"
          role="tab"
          id={`tab-${t}`}
          aria-selected={tab === t}
          aria-controls={`panel-${t}`}
          onClick={() => onChange(t)}
          className={`relative z-10 rounded-full px-4 py-1.5 text-[13px] transition-colors duration-150 ${
            tab === t ? "font-medium text-ink" : "text-muted hover:text-ink"
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

export default function WorkTabs() {
  const [tab, setTab] = useState<Tab>("Work");

  return (
    <section>
      <div className="intro-fade">
        <TabPill tab={tab} onChange={setTab} />
      </div>

      <div
        key={tab}
        id={`panel-${tab}`}
        role="tabpanel"
        aria-labelledby={`tab-${tab}`}
        className="tab-panel mt-8"
      >
        {tab === "Work" && <WorkStage />}
        {tab === "About" && <About />}
        {tab === "Writing" && (
          <ul className="space-y-2 text-[16px]">
            {writing.map((essay) => (
              <li key={essay.url}>
                <a className="link" href={essay.url}>
                  {essay.title}
                </a>
                <span className="text-muted">
                  {essay.publication ? ` · ${essay.publication}` : ""} · {essay.date}
                </span>
              </li>
            ))}
            <li>
              <a className="link !text-muted" href="https://isaishangry.substack.com/">
                More on Substack
              </a>
            </li>
          </ul>
        )}
        {tab === "Reading" && (
          <div className={bleed}>
            <div className="mx-auto max-w-[760px]">
              <Bookshelf />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
