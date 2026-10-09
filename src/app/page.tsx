import TopBar from "@/components/TopBar";
import DecodeText, { type DecodePart } from "@/components/DecodeText";
import { MapIcon, SimIcon, TrackerIcon } from "@/components/LineIcons";
import Reveal from "@/components/Reveal";
import WorkTabs from "@/components/WorkTabs";
import { links } from "@/data/links";

const summary: DecodePart[] = [
  "I make tech policy easier to understand through ",
  { icon: <TrackerIcon />, text: "live trackers", href: "https://trackpolicy.org", label: "Track Policy" },
  ", ",
  { icon: <SimIcon />, text: "simulations", href: "https://policysim.policy.cafe", label: "PolicySim" },
  ", and ",
  { icon: <MapIcon />, text: "data maps", href: "https://corruption-map.vercel.app", label: "Corruption Map" },
  ".",
];

export default function Home() {
  return (
    <main className="mx-auto max-w-[600px] px-4 pt-10 pb-24 md:pt-16">
      <Reveal>
        <TopBar />
      </Reveal>

      <Reveal delay={60} className="mt-16 md:mt-20">
        <h1 className="font-display text-[20px] leading-[28px] font-normal">Isabelle Reksopuro</h1>
        <p className="mt-3 font-display text-[19px] leading-[30px] font-normal">
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
          I’ve worked at{" "}
          <a className="link" href="https://million.dev">
            startups
          </a>
          , in{" "}
          <a className="link" href="https://www.seattle.gov/city-light">
            city government
          </a>
          , and at{" "}
          <a className="link" href="https://www.napca.org/">
            nonprofits
          </a>{" "}
          lobbying Congress.
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
