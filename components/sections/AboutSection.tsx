import { aboutContent } from "@/lib/content";

/*
  What the Daré is. The heading in one column and the copy in a narrow
  measure beside it, then the two short lines set large beneath, where
  the paragraph has already done the explaining and they can simply land.
*/
export default function AboutSection() {
  return (
    <section id="about" aria-labelledby="about-heading" className="section-full px-xs md:px-md">
      <div data-reveal className="grid gap-md md:grid-cols-4">
        <h2 id="about-heading">{aboutContent.title}</h2>
        <div className="space-y-md md:col-span-2 max-w-[52ch]">
          {aboutContent.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </div>

      <div className="mt-lg grid md:grid-cols-4">
        <div className="md:col-span-3 md:col-start-2">
          {aboutContent.statement.map((line, index) => (
            <p
              key={line}
              data-reveal
              style={{ "--reveal-delay": `${200 + index * 200}ms` } as React.CSSProperties}
              className="rule-line"
            >
              {line}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
