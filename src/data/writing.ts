export interface Essay {
  title: string;
  date: string;
  url: string;
  // Where it was published, if not my Substack.
  publication?: string;
}

export const writing: Essay[] = [
  {
    title: "Use this map to find the data centers in your backyard",
    date: "May 2026",
    url: "https://www.theverge.com/policy/930629/data-center-policy-map-interactive",
    publication: "The Verge",
  },
  {
    title: "What 21 means to me",
    date: "Mar 2026",
    url: "https://isaishangry.substack.com/p/what-21-means-to-me",
  },
  {
    title: "SF needs to stop covering up for men",
    date: "Oct 2025",
    url: "https://isaishangry.substack.com/p/sf-needs-to-stop-covering-up-for",
  },
];
