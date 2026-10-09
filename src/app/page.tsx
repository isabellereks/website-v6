import TopBar from "@/components/TopBar";
import DecodeText, { type DecodePart } from "@/components/DecodeText";
import { MapIcon, SimIcon, TrackerIcon } from "@/components/LineIcons";
import Reveal from "@/components/Reveal";
import WorkTabs from "@/components/WorkTabs";
import { links } from "@/data/links";

const summary: DecodePart[] = [
  "I make tech policy easier to understand through",
  { icon: <TrackerIcon />, href: "https://trackpolicy.org", label: "Track Policy" },
  "live trackers,",
  { icon: <SimIcon />, href: "https://policysim.policy.cafe", label: "PolicySim" },
  "simulations, and",
  { icon: <MapIcon />, href: "https://corruption-map.vercel.app", label: "Corruption Map" },
  "data maps.",
];

export default function Home() {
  return (
    <main className="mx-auto max-w-[600px] px-4 pt-10 pb-24 md:pt-16">
      <Reveal>
        <TopBar />
      </Reveal>

      <Reveal delay={60} className="mt-16 md:mt-20">
        <h1 className="font-display text-[22px] font-bold tracking-[-0.02em]">Isabelle Reksopuro</h1>
        <p className="mt-3 font-display text-[20px] leading-[30px] font-light tracking-[-0.01em]">
          <DecodeText parts={summary} />
        </p>
      </Reveal>

      <Reveal delay={120} className="mt-6 space-y-2 text-muted">
        <p>
          I’m an Indonesian-American student at the{" "}
          <a className="link" href="https://www.washington.edu/">
            University of Washington
          </a>
          . Too many of the people writing our tech laws don’t know how wifi works, so I’m working toward AI
          safety and policy that protects everyday people.
        </p>
        <p>
          Right now I’m campaigning for reproductive justice with{" "}
          <a className="link" href="https://www.advocatesforyouth.org/">
            Advocates for Youth
          </a>
          , leading student ambassadors for{" "}
          <a className="link" href="https://aaylc.org">
            AAYLC
          </a>
          , and running the{" "}
          <a className="link" href="https://www.instagram.com/seattlejunkjournalclub/">
            Seattle Junk Journal Club
          </a>
          .
        </p>
        <p>
          Say hi on{" "}
          {links.map((l, i) => (
            <span key={l.label}>
              <a className="link" href={l.href}>
                {l.label}
              </a>
              {i < links.length - 2 ? ", " : i === links.length - 2 ? " or " : ""}
            </span>
          ))}
          , or{" "}
          <a className="link" href="https://cal.com/isabellereks">
            grab a matcha
          </a>{" "}
          :)
        </p>
      </Reveal>

      <Reveal delay={180} className="mt-10">
        <WorkTabs />
      </Reveal>
    </main>
  );
}
