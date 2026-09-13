import { rulesContent } from "@/lib/content";

// The three lines from the poster, one beneath the other, each arriving
// a beat after the last.
export default function RulesSection() {
  return (
    <section id="enter" aria-labelledby="enter-heading" className="section-full px-xs md:px-md">
      <h2 id="enter-heading" className="sr-only">
        {rulesContent.title}
      </h2>
      <ul>
        {rulesContent.lines.map((line, index) => (
          <li
            key={line}
            data-reveal
            style={{ "--reveal-delay": `${index * 220}ms` } as React.CSSProperties}
            className="rule-line"
          >
            {line}
          </li>
        ))}
      </ul>
    </section>
  );
}
