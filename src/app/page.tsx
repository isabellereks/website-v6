import TopBar from "@/components/TopBar";
import DecodeText, { type DecodePart } from "@/components/DecodeText";
import { MapIcon, SimIcon, TrackerIcon } from "@/components/LineIcons";
import Reveal from "@/components/Reveal";
import WorkTabs from "@/components/WorkTabs";
import SocialLinks from "@/components/SocialLinks";

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
      <Reveal className="intro-fade">
        <TopBar />
      </Reveal>

      <Reveal delay={60} className="intro-fade mt-16 md:mt-20">
        <h1 className="font-display text-[20px] leading-[28px] font-normal transition-colors duration-300 ease-[var(--ease)] hover:text-rose">Isabelle Reksopuro</h1>
        <p className="mt-3 font-display text-[19px] leading-[30px] font-normal">
          <DecodeText parts={summary} />
        </p>
      </Reveal>

      <Reveal delay={120} className="intro-fade mt-6 space-y-2 text-muted">
        <p>
          I’m an Indonesian-American student at the{" "}
          <a className="link" href="https://www.washington.edu/">
            University of Washington
          </a>
          . Half of Congress would need ChatGPT to explain ChatGPT, so I’m working on AI safety and policy that
          protects everyday people.
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
        <SocialLinks />
      </Reveal>

      <Reveal delay={180} className="mt-10">
        <WorkTabs />
      </Reveal>
    </main>
  );
}
