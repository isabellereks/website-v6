import FlowText from "./FlowText";
import PhotoStack from "./PhotoStack";

const offTheClock = [
  {
    text: "Off the clock: K-dramas (ask me what I’m watching), an unreasonable amount of matcha, baking blueberry scones, and reading at 1,200+ words a minute, unofficially benchmarked.",
  },
];

// The old "lore": background as prose, plus a paragraph that flows around the matcha.
export default function About() {
  return (
    <div className="space-y-2 text-muted">
      <p>
        I’ve worked on public policy and a caregiver resource database at{" "}
        <a className="link" href="https://www.napca.org/">NAPCA</a>, operations and growth at{" "}
        <a className="link" href="https://million.dev">Million</a> (we hosted YC’s first agents hackathon), and race &amp;
        social justice at the <a className="link" href="https://www.seattle.gov/city-light">City of Seattle</a>.
      </p>
      <p>
        Before that, I did community work with the{" "}
        <a className="link" href="https://www.oregonhealthequity.org/">Oregon Health Equity Alliance</a> and the{" "}
        <a className="link" href="https://www.coalitioncommunitiescolor.org/">Coalition of Communities of Color</a>. I found
        AI ethics during a mentorship in autonomous vehicles at{" "}
        <a className="link" href="https://www.swri.org/">Southwest Research Institute</a>.
      </p>
      <div className="pt-2">
        <FlowText paragraphs={offTheClock} />
      </div>
      <div className="pt-8">
        <PhotoStack />
      </div>
    </div>
  );
}
