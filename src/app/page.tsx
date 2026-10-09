import SiteHeader from "@/components/SiteHeader";
import DecodeText, { type DecodePart } from "@/components/DecodeText";
import { MapIcon, SimIcon, TrackerIcon } from "@/components/LineIcons";
import FlowText from "@/components/FlowText";
import LaptopEmbed from "@/components/LaptopEmbed";
import Reveal from "@/components/Reveal";
import Bookshelf from "@/components/Bookshelf";
import Signature from "@/components/Signature";
import LorePhotos from "@/components/LorePhotos";
import { projects } from "@/data/projects";
import { experience } from "@/data/experience";
import { writing } from "@/data/writing";
import { links } from "@/data/links";

const summary: DecodePart[] = [
  "I make tech policy easier to understand and act on through",
  { icon: <TrackerIcon />, href: "https://trackpolicy.org", label: "Track Policy" },
  "live trackers,",
  { icon: <SimIcon />, href: "https://policysim.policy.cafe", label: "PolicySim" },
  "simulations, and",
  { icon: <MapIcon />, href: "https://corruption-map.vercel.app", label: "Corruption Map" },
  "data maps that put the people writing our laws on the record.",
];

const about = [
  {
    text: "I’m an Indonesian-American student at the University of Washington. Too many of the people writing our tech laws don’t know how wifi works, and instead of preparing society for AGI, they’re busy fighting data centers.",
  },
  {
    text: "I want to work on AI safety and policy that lets innovation thrive while protecting everyday people. Most of what I do starts as a side project, built in public.",
  },
  {
    text: "Off the clock: K-dramas (ask me what I’m watching), an unreasonable amount of matcha, blueberry scones, and reading at 1,200+ words a minute, unofficially benchmarked.",
    muted: true,
  },
];

const currently = [
  { text: "Campaigning for reproductive justice with", link: { label: "Advocates for Youth", href: "https://www.advocatesforyouth.org/" } },
  { text: "Leading student ambassadors for the", link: { label: "Asian American Youth Leadership Conference", href: "https://aaylc.org" } },
  { text: "Running the", link: { label: "Seattle Junk Journal Club", href: "https://www.instagram.com/seattlejunkjournalclub/" } },
  { text: "Writing again on", link: { label: "Substack", href: "https://isaishangry.substack.com/" } },
];

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main id="top" className="sheet">
        <section className="row">
          <div className="cell overflow-hidden !pt-20 !pb-16 md:!pt-28 md:!pb-20">
            <div aria-hidden className="hatch hidden h-[260px] w-[260px] md:block" />
            <h1 className="font-display text-[clamp(3.25rem,10vw,7.5rem)] leading-[0.88] font-bold tracking-[-0.045em]">
              Isabelle
              <br />
              Reksopuro
            </h1>
            <p className="mt-10 max-w-[640px] text-[21px] leading-[1.55] md:text-[24px]">
              <DecodeText parts={summary} />
            </p>
            <p className="label mt-6">Student at the University of Washington, based in Seattle.</p>
          </div>
        </section>

        <section className="row md:grid-cols-3">
          <div className="cell md:col-span-2">
            <h2 className="label mb-6">About</h2>
            <FlowText paragraphs={about} />
          </div>
          <div className="cell">
            <h2 className="label mb-6">Currently</h2>
            <ul className="divide-y divide-rule text-[15px] leading-relaxed">
              {currently.map((item) => (
                <li key={item.link.label} className="py-3 first:pt-0">
                  {item.text}{" "}
                  <a className="link" href={item.link.href}>
                    {item.link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="work" aria-labelledby="work-heading">
          <div className="row">
            <div className="cell !py-6">
              <h2 id="work-heading" className="label">
                Selected work
              </h2>
            </div>
          </div>
          {projects.map((project) => (
            <article key={project.name}>
              <div className="row">
                <div className="cell md:!px-16 md:!py-14">
                  <Reveal>
                    <LaptopEmbed url={project.url} title={project.name} />
                  </Reveal>
                </div>
              </div>
              <div className="row md:grid-cols-3">
                <div className="cell">
                  <Reveal delay={100}>
                    <h3 className="font-display text-[22px] font-bold tracking-tight">{project.name}</h3>
                    <p className="label mt-1">
                      {project.year} · {project.stack}
                    </p>
                    <a className="link mt-5 inline-block text-[15px]" href={project.url} target="_blank" rel="noopener noreferrer">
                      Visit site ↗
                    </a>
                  </Reveal>
                </div>
                <div className="cell md:col-span-2">
                  <Reveal delay={180}>
                    <p className="text-[19px] leading-snug">{project.tagline}</p>
                    <div className="mt-4 max-w-[560px] space-y-3 text-[15px] leading-relaxed text-muted">
                      {project.details.map((d) => (
                        <p key={d}>{d}</p>
                      ))}
                    </div>
                  </Reveal>
                </div>
              </div>
            </article>
          ))}
        </section>

        <section className="row md:grid-cols-3" aria-labelledby="experience-heading">
          <div className="cell">
            <h2 id="experience-heading" className="label">
              Experience
            </h2>
          </div>
          <div className="cell md:col-span-2 !py-0">
            <ol className="divide-y divide-rule">
              {experience.map((role) => (
                <li key={`${role.org}-${role.title}`} className="grid gap-x-6 gap-y-1 py-6 md:grid-cols-[3.5rem_1fr]">
                  <span className="label tabular-nums">{role.year}</span>
                  <div>
                    <p className="text-[17px]">
                      {role.title},{" "}
                      <a className="link" href={role.orgUrl}>
                        {role.org}
                      </a>
                    </p>
                    <p className="mt-1.5 max-w-[560px] text-[15px] leading-relaxed text-muted">{role.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="row md:grid-cols-3">
          <div className="cell md:col-span-2">
            <h2 className="label mb-8">Reading</h2>
            <Bookshelf />
          </div>
          <div id="writing" className="cell">
            <h2 className="label mb-6">Writing</h2>
            <ul className="space-y-5">
              {writing.map((essay) => (
                <li key={essay.url}>
                  <a href={essay.url} className="group block">
                    <span className="block font-serif text-[22px] leading-tight italic transition-colors group-hover:text-rose">
                      {essay.title}
                    </span>
                    <span className="label">{essay.date}</span>
                  </a>
                </li>
              ))}
            </ul>
            <a className="link label mt-8 inline-block" href="https://isaishangry.substack.com/">
              More on Substack ↗
            </a>
          </div>
        </section>

        <section id="contact" className="row">
          <div className="cell">
            <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
              <p className="max-w-[560px] text-[21px] leading-snug md:text-[24px]">
                <span className="text-muted">Say hi via</span>{" "}
                {links.map((l, i) => (
                  <span key={l.label}>
                    <a className="link" href={l.href}>
                      {l.label}
                    </a>
                    <span className="text-muted">{i < links.length - 2 ? ", " : i === links.length - 2 ? ", or " : "."}</span>
                  </span>
                ))}{" "}
                <span className="text-muted">Or</span>{" "}
                <a className="link font-serif italic" href="https://cal.com/isabellereks">
                  grab a matcha
                </a>
                <span className="text-muted">.</span>
              </p>
              <Signature />
            </div>
            <div className="mt-12">
              <LorePhotos />
            </div>
          </div>
        </section>

        <footer className="row">
          <div className="cell flex justify-between !py-6 text-[12px] text-muted">
            <span>© 2026 Isabelle Reksopuro</span>
            <span>
              Made with stardust <span className="text-rose">★</span>
            </span>
          </div>
        </footer>
      </main>
    </>
  );
}
