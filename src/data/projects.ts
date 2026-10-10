export interface Project {
  name: string;
  tagline: string;
  details: string[];
  stack: string;
  year: string;
  url: string;
}

export const projects: Project[] = [
  {
    name: "Track Policy",
    tagline: "A live map of where AI and data center policy is actually happening.",
    details: [
      "Tracks 960+ bills across US federal and state governments, the EU and Asia-Pacific, plus 300+ data center facilities and the politicians behind them.",
      "Click into any jurisdiction to see which governments are restricting AI, courting it, studying it, or doing nothing.",
    ],
    stack: "Next.js, d3-geo, LegiScan, Claude",
    year: "2026",
    url: "https://trackpolicy.org",
  },
  {
    name: "PolicySim",
    tagline: "Watch a bill move through the US government, vote by vote.",
    details: [
      "Pick a bill or write your own, then watch it pass through the Senate, House, a presidential veto and Supreme Court review.",
      "Every vote is computed from 570 real profiles of the 119th Congress, scored across 15 policy dimensions and the lobby pressure each member faces.",
    ],
    stack: "React, Next.js",
    year: "2026",
    url: "https://ai-gov-simulator.vercel.app",
  },
  {
    name: "Corruption Map",
    tagline: "Members of Congress, mapped against their money.",
    details: [
      "A data pipeline merges campaign finance, lobbying and voting records from FEC, OpenSecrets and Voteview into one map.",
      "Click any politician to see their net worth and vote alignment.",
    ],
    stack: "React, Python, FEC, OpenSecrets",
    year: "2026",
    url: "https://corruption-map.vercel.app",
  },
  {
    name: "iPod",
    tagline: "A clickable iPod Classic, powered by Spotify.",
    details: ["Spin the click wheel and browse my music, just like 2007."],
    stack: "React, Spotify",
    year: "2025",
    url: "https://old.isabellereks.com/ipod",
  },
];
