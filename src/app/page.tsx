import SiteHeader from "@/components/SiteHeader";
import Section from "@/components/Section";
import WorkIndex from "@/components/WorkIndex";
import Bookshelf from "@/components/Bookshelf";
import { experience } from "@/data/experience";
import { writing } from "@/data/writing";
import { links, calUrl } from "@/data/links";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main id="top" className="mx-auto max-w-6xl px-5 md:px-10">
        <div className="flex justify-between pt-6 text-[11px] uppercase tracking-[0.18em] text-muted">
          <span>Seattle, Washington</span>
          <span>Vol. VI</span>
        </div>

        <section className="pt-20 pb-20 md:pt-32 md:pb-28">
          <h1 className="max-w-4xl text-[clamp(2.5rem,6.5vw,5.25rem)] leading-[1.02] font-light tracking-[-0.02em]">
            Technology is moving faster than the people regulating it.{" "}
            <span className="font-serif italic">I&rsquo;m working on that.</span>
          </h1>
        </section>

        <Section id="about" number="01" label="About">
          <div className="max-w-2xl space-y-5 text-[17px] leading-relaxed md:text-lg">
            <p>
              I&rsquo;m Isabelle, an Indonesian-American student at the{" "}
              <a className="link" href="https://www.washington.edu/">
                University of Washington
              </a>{" "}
              working where technology meets public policy.
            </p>
            <p>
              Too many of the people writing our tech laws don&rsquo;t know how wifi works. Instead
              of preparing society for AGI, they&rsquo;re busy fighting data centers. I want to work
              on AI safety and policy that lets innovation thrive while protecting everyday people.
            </p>
            <p>
              Most of what I do starts as a side project, and I build in public on{" "}
              <a className="link" href="https://twitter.com/isareksopuro">
                X
              </a>
              .
            </p>
            <p className="text-muted">
              Off the clock: K-dramas (ask me what I&rsquo;m watching), an unreasonable amount of
              matcha, blueberry scones, and reading at 1,200+ words a minute, unofficially
              benchmarked.
            </p>
          </div>
        </Section>

        <Section id="currently" number="02" label="Currently">
          <ul className="max-w-2xl divide-y divide-rule border-y border-rule text-[17px] leading-relaxed">
            <li className="py-4">
              Campaigning for reproductive justice with{" "}
              <a className="link" href="https://www.advocatesforyouth.org/">
                Advocates for Youth
              </a>{" "}
              and helping form a sexual assault task force in Washington, D.C. and Seattle.
            </li>
            <li className="py-4">
              Leading the student ambassador program for the{" "}
              <a className="link" href="https://aaylc.org">
                Asian American Youth Leadership Conference
              </a>
              , which reaches 600+ students.
            </li>
            <li className="py-4">
              Running the{" "}
              <a className="link" href="https://www.instagram.com/seattlejunkjournalclub/">
                Seattle Junk Journal Club
              </a>{" "}
              and writing again on{" "}
              <a className="link" href="https://isaishangry.substack.com/">
                Substack
              </a>
              .
            </li>
          </ul>
        </Section>

        <Section id="work" number="03" label="Selected Work">
          <WorkIndex />
        </Section>

        <Section id="experience" number="04" label="Experience">
          <ol className="border-t border-ink">
            {experience.map((role) => (
              <li
                key={`${role.org}-${role.title}`}
                className="grid gap-x-6 gap-y-1 border-b border-rule py-6 md:grid-cols-[4rem_1fr_1.4fr]"
              >
                <span className="text-[12px] tabular-nums text-muted">{role.year}</span>
                <div>
                  <p className="text-lg font-light tracking-tight">{role.title}</p>
                  <a className="link text-[15px] text-muted" href={role.orgUrl}>
                    {role.org}
                  </a>
                </div>
                <p className="mt-2 text-[15px] leading-relaxed text-muted md:mt-0">
                  {role.description}
                </p>
              </li>
            ))}
          </ol>
        </Section>

        <Section id="writing" number="05" label="Writing">
          <ol className="border-t border-ink">
            {writing.map((essay) => (
              <li key={essay.url} className="border-b border-rule">
                <a
                  href={essay.url}
                  className="group grid grid-cols-[5.5rem_1fr_auto] items-baseline gap-x-4 py-5"
                >
                  <span className="text-[12px] text-muted">{essay.date}</span>
                  <span className="font-serif text-2xl italic transition-colors group-hover:text-rose">
                    {essay.title}
                  </span>
                  <span aria-hidden className="text-muted group-hover:text-rose">
                    ↗
                  </span>
                </a>
              </li>
            ))}
          </ol>
          <a className="link mt-6 inline-block text-[15px] text-muted" href="https://isaishangry.substack.com/">
            More on Substack
          </a>
        </Section>

        <Section id="reading" number="06" label="Reading">
          <Bookshelf />
        </Section>

        <Section id="contact" number="07" label="Contact">
          <p className="max-w-3xl text-[clamp(1.75rem,3.5vw,2.75rem)] leading-tight font-extralight tracking-tight">
            Curious about tech policy, or just want a matcha?{" "}
            <a className="link font-serif italic" href={calUrl}>
              Let&rsquo;s chat.
            </a>
          </p>
          <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-[15px]">
            {links.map((l) => (
              <li key={l.label}>
                <a className="link" href={l.href}>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </Section>
      </main>

      <footer className="border-t border-rule">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-8 text-[11px] uppercase tracking-[0.18em] text-muted md:flex-row md:justify-between md:px-10">
          <span>© 2026 Isabelle Reksopuro</span>
          <span>
            Made with stardust <span className="text-rose">★</span>
          </span>
        </div>
      </footer>
    </>
  );
}
