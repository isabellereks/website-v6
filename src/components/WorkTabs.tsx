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
    // Tabs fill the pill edge to edge (no dead space); the highlight sits 4px inside.
    if (el) setBox({ left: el.offsetLeft + 4, width: el.offsetWidth - 8 });
  }, [tab]);

  return (
    <div role="tablist" aria-label="Sections" className="relative flex w-fit overflow-hidden rounded-full bg-[#f2f2f4] select-none">
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
          className={`relative z-10 px-[22px] py-[10px] text-[13px] transition-colors duration-150 ${
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
          // v4-style rows: year, title, date, with hairlines between.
          <div>
            <ul className="divide-y divide-rule">
              {writing.map((essay) => (
                <li key={essay.url}>
                  <a
                    href={essay.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group grid grid-cols-[3.5rem_1fr_auto] items-baseline gap-x-4 py-3"
                  >
                    <span className="text-[#c7c7cc] tabular-nums">{essay.date.slice(-4)}</span>
                    <span className="text-ink transition-colors group-hover:text-muted">
                      {essay.title}
                      <span aria-hidden className="ml-1 text-[14px] text-[#c7c7cc] transition-colors group-hover:text-muted">
                        ↗
                      </span>
                      {essay.publication && <span className="ml-2 text-[14px] text-muted">{essay.publication}</span>}
                    </span>
                    <span className="text-[14px] text-[#c7c7cc] tabular-nums">{essay.date}</span>
                  </a>
                </li>
              ))}
            </ul>
            <a
              href="https://isaishangry.substack.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="link mt-3 inline-block text-[14px] !text-muted"
            >
              Read more on Substack ↗
            </a>
          </div>
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
