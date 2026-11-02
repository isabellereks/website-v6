"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";

/**
 * THESIS: A bright campus strip should feel like a useful notice, not an ad or portal.
 * OWN-WORLD: Flat AFY-inspired blue, yellow, and pink; square actions; no decoration.
 * STORY: DOH owns the information, the college hostname supplies context, and AFY maintains it.
 * FIRST VIEWPORT: One host selector, one simulated college header, and one compact banner.
 * FORM: A precise, production-minded port of the approved mock rather than a new concept.
 */

interface College {
  name: string;
  region: string;
}

interface BannerMockProps {
  initialHost?: string;
}

const DEFAULT_HOST = "www.yvcc.edu";
const STATEWIDE_HOST = "unknown.example.edu";

const collegeByHost: Record<string, College> = {
  "www.washington.edu": {
    name: "University of Washington",
    region: "Seattle and King County",
  },
  "washington.edu": { name: "University of Washington", region: "Seattle and King County" },
  "wsu.edu": {
    name: "Washington State University",
    region: "Pullman and eastern Washington",
  },
  "www.cwu.edu": {
    name: "Central Washington University",
    region: "Ellensburg and Kittitas County",
  },
  "www.ewu.edu": { name: "Eastern Washington University", region: "Cheney and Spokane" },
  "www.evergreen.edu": {
    name: "The Evergreen State College",
    region: "Olympia and Thurston County",
  },
  "www.wwu.edu": {
    name: "Western Washington University",
    region: "Bellingham and Whatcom County",
  },
  "www.batestech.edu": { name: "Bates Technical College", region: "Tacoma and Pierce County" },
  "www.bellevuecollege.edu": { name: "Bellevue College", region: "Bellevue and King County" },
  "www.btc.edu": {
    name: "Bellingham Technical College",
    region: "Bellingham and Whatcom County",
  },
  "www.bigbend.edu": {
    name: "Big Bend Community College",
    region: "Moses Lake and Grant County",
  },
  "www.cascadia.edu": { name: "Cascadia College", region: "Bothell and King County" },
  "www.centralia.edu": { name: "Centralia College", region: "Centralia and Lewis County" },
  "www.clark.edu": { name: "Clark College", region: "Vancouver and Clark County" },
  "www.cptc.edu": {
    name: "Clover Park Technical College",
    region: "Lakewood and Pierce County",
  },
  "www.columbiabasin.edu": { name: "Columbia Basin College", region: "Tri-Cities" },
  "www.edmonds.edu": {
    name: "Edmonds College",
    region: "Lynnwood and Snohomish County",
  },
  "www.everettcc.edu": {
    name: "Everett Community College",
    region: "Everett and Snohomish County",
  },
  "www.ghc.edu": {
    name: "Grays Harbor College",
    region: "Aberdeen and Grays Harbor County",
  },
  "www.greenriver.edu": {
    name: "Green River College",
    region: "Auburn and south King County",
  },
  "www.highline.edu": {
    name: "Highline College",
    region: "Des Moines and south King County",
  },
  "www.lwtech.edu": {
    name: "Lake Washington Institute of Technology",
    region: "Kirkland and King County",
  },
  "lowercolumbia.edu": {
    name: "Lower Columbia College",
    region: "Longview and Cowlitz County",
  },
  "northseattle.edu": { name: "North Seattle College", region: "Seattle and King County" },
  "www.olympic.edu": { name: "Olympic College", region: "Bremerton and Kitsap County" },
  "pencol.edu": { name: "Peninsula College", region: "Port Angeles and Clallam County" },
  "www.pierce.ctc.edu": {
    name: "Pierce College",
    region: "Lakewood, Puyallup, and Pierce County",
  },
  "www.rtc.edu": { name: "Renton Technical College", region: "Renton and King County" },
  "seattlecentral.edu": { name: "Seattle Central College", region: "Seattle and King County" },
  "www.shoreline.edu": {
    name: "Shoreline Community College",
    region: "Shoreline and King County",
  },
  "www.skagit.edu": {
    name: "Skagit Valley College",
    region: "Mount Vernon and Skagit County",
  },
  "spscc.edu": {
    name: "South Puget Sound Community College",
    region: "Olympia and Thurston County",
  },
  "southseattle.edu": { name: "South Seattle College", region: "Seattle and King County" },
  "scc.spokane.edu": { name: "Spokane Community College", region: "Spokane" },
  "sfcc.spokane.edu": { name: "Spokane Falls Community College", region: "Spokane" },
  "www.tacomacc.edu": {
    name: "Tacoma Community College",
    region: "Tacoma and Pierce County",
  },
  "www.wwcc.edu": {
    name: "Walla Walla Community College",
    region: "Walla Walla and Clarkston",
  },
  "wvc.edu": { name: "Wenatchee Valley College", region: "Wenatchee and Chelan County" },
  "www.whatcom.edu": {
    name: "Whatcom Community College",
    region: "Bellingham and Whatcom County",
  },
  "www.yvcc.edu": { name: "Yakima Valley College", region: "Yakima" },
};

const previewOptions = [
  DEFAULT_HOST,
  "www.washington.edu",
  "wsu.edu",
  "www.wwu.edu",
  "www.bellevuecollege.edu",
  "www.everettcc.edu",
  "scc.spokane.edu",
  "www.wwcc.edu",
  STATEWIDE_HOST,
];

const normalizeHost = (host: string) =>
  host.replace(/^https?:\/\//, "").replace(/\/$/, "").toLowerCase();

const getInitialHost = (initialHost?: string) => {
  if (!initialHost) return DEFAULT_HOST;

  const normalizedHost = normalizeHost(initialHost);
  return collegeByHost[normalizedHost] ? normalizedHost : STATEWIDE_HOST;
};

const leavePage = () => window.location.replace("https://www.google.com/");

export default function BannerMock({ initialHost }: BannerMockProps) {
  const [selectedHost, setSelectedHost] = useState(() => getInitialHost(initialHost));
  const college = collegeByHost[selectedHost];
  const collegeName = college?.name ?? "Example Washington public college";
  const regionMessage = college
    ? `Resources for ${college.region}`
    : "Washington statewide resources";

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") leavePage();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <div>
          <h1>A clearer campus link to abortion care.</h1>
          <p>
            The banner matches each college website to a service region—without using a
            student&apos;s location.
          </p>
        </div>

        <div className={styles.previewControl}>
          <label htmlFor="college-preview">Preview for</label>
          <select
            id="college-preview"
            value={selectedHost}
            onChange={(event) => setSelectedHost(event.target.value)}
          >
            {previewOptions.map((host) => (
              <option key={host} value={host}>
                {collegeByHost[host]?.name ?? "Unknown site / statewide"}
              </option>
            ))}
          </select>
        </div>
      </header>

      <main id="main">
        <article className={styles.demo} aria-label="Simulated college website">
          <header className={styles.collegeHeader}>
            <p className={styles.collegeName}>{collegeName}</p>
            <nav className={styles.collegeNav} aria-label="Example college navigation">
              <a href="#academics">Academics</a>
              <a href="#campus-life">Campus life</a>
              <a href="#student-support">Student support</a>
            </nav>
          </header>

          <div className={styles.collegePage}>
            <aside className={styles.resourceBanner} aria-labelledby="resource-title">
              <button
                className={styles.quickExit}
                type="button"
                onClick={leavePage}
                title="Leaves this page; does not clear browser history"
              >
                Quick exit
              </button>

              <div className={styles.bannerContent}>
                <h2 id="resource-title">Abortion care is available in Washington.</h2>
                <p className={styles.bannerDescription}>
                  Find trusted providers, help paying for care and travel, ways to protect your
                  privacy, and information about your rights.
                </p>
                <p className={styles.bannerMatch} aria-live="polite">
                  {regionMessage}
                </p>
              </div>

              <div className={styles.bannerActions}>
                <a
                  className={styles.primaryAction}
                  href="https://doh.wa.gov/you-and-your-family/sexual-and-reproductive-health/abortion"
                  rel="noreferrer"
                >
                  Find care and support →
                </a>
                <a
                  className={styles.privacyAction}
                  href="https://doh.wa.gov/you-and-your-family/sexual-and-reproductive-health/abortion/your-privacy"
                  rel="noreferrer"
                >
                  Protect your privacy
                </a>
              </div>

              <p className={styles.bannerSource}>
                From{" "}
                <a
                  href="https://doh.wa.gov/you-and-your-family/sexual-and-reproductive-health/abortion"
                  rel="noreferrer"
                >
                  Washington State Department of Health
                </a>{" "}
                · Maintained by{" "}
                <a href="https://www.advocatesforyouth.org/" rel="noreferrer">
                  Advocates for Youth
                </a>
              </p>
            </aside>

            <div className={styles.placeholder} aria-hidden="true">
              <section id="student-support">
                <h3>Student support</h3>
                <p>This is placeholder campus content, included only to show the banner in context.</p>
              </section>
              <ul>
                <li>Health and wellness</li>
                <li>Counseling</li>
                <li>Basic needs</li>
              </ul>
            </div>
          </div>
        </article>

        <section className={styles.notes} aria-label="Mock notes">
          <details>
            <summary>About the design and routing</summary>
            <p>
              The design borrows the directness of Advocates for Youth&apos;s current site: black
              text, flat color, square actions, and a blue/yellow/pink palette. It does not copy or
              recreate the organization&apos;s logo.
            </p>
            <ul className={styles.brandKey} aria-label="Advocates for Youth-inspired color palette">
              <li>
                <span className={`${styles.swatch} ${styles.swatchBlue}`} aria-hidden="true" />
                Blue #0076C0
              </li>
              <li>
                <span className={`${styles.swatch} ${styles.swatchYellow}`} aria-hidden="true" />
                Yellow #FCCB36
              </li>
              <li>
                <span className={`${styles.swatch} ${styles.swatchPink}`} aria-hidden="true" />
                Pink #F83180
              </li>
            </ul>
            <p>
              <strong>Production choice:</strong> keep DOH as the information owner; let Advocates
              for Youth maintain the snippet and host-to-region table. Unknown hosts fall back to
              statewide resources. No IP, GPS, cookies, or student data are needed.
            </p>
          </details>
        </section>
      </main>
    </div>
  );
}
