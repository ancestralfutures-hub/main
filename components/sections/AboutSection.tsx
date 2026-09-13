import { aboutContent } from "@/lib/content";

// What a daré is, and what this one is. A heading in one column and the
// copy in a narrow measure beside it, with the rest of the screen dark.
export default function AboutSection() {
  return (
    <section id="dare" aria-labelledby="dare-heading" className="section-full px-xs md:px-md">
      <div data-reveal className="grid gap-md md:grid-cols-4">
        <h2 id="dare-heading">{aboutContent.title}</h2>
        <div className="space-y-md md:col-span-2 max-w-[52ch]">
          {aboutContent.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
