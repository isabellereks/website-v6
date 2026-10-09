import FlowText, { type Paragraph } from "./FlowText";
import PhotoStack from "./PhotoStack";

// All of About flows around the matcha bowl, so dragging it reshapes the whole section.
const about: Paragraph[] = [
  {
    runs: [
      { text: "Most recently I worked on policy and a caregiver resource database at " },
      { text: "NAPCA", href: "https://www.napca.org/" },
      { text: ", and on operations and growth at " },
      { text: "Million", href: "https://million.dev" },
      { text: ", where we hosted YC’s first agents hackathon." },
    ],
  },
  {
    runs: [
      { text: "Before that, I was on race and social justice at the " },
      { text: "City of Seattle", href: "https://www.seattle.gov/city-light" },
      { text: ", and did community work with the " },
      { text: "Oregon Health Equity Alliance", href: "https://www.oregonhealthequity.org/" },
      { text: " and the " },
      { text: "Coalition of Communities of Color", href: "https://www.coalitioncommunitiescolor.org/" },
      { text: "." },
    ],
  },
  {
    runs: [
      { text: "I got into AI ethics through a mentorship with the autonomous vehicles team at " },
      { text: "Southwest Research Institute", href: "https://www.swri.org/" },
      { text: "." },
    ],
  },
  {
    runs: [
      {
        text: "Outside of all that: K-dramas, too much matcha, blueberry scones, and reading fast (1,200+ words a minute, unofficially).",
      },
    ],
  },
];

export default function About() {
  return (
    <div className="text-muted">
      <FlowText paragraphs={about} />
      <div className="pt-10">
        <PhotoStack />
      </div>
    </div>
  );
}
