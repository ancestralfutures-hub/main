import Ember from "@/components/Ember";
import { heroContent } from "@/lib/content";

// The opening screen, laid out as the poster: the title high, the line
// beneath it, the fire low in the dark, and the month in the corner.
export default function HeroSection() {
  return (
    <section id="top" className="section-full overflow-hidden">
      <Ember />
      <div className="ember-over flex h-full grow flex-col justify-between px-xs md:px-md">
        <div data-reveal>
          <h1 className="title">{heroContent.title}</h1>
          <p className="eyebrow mt-md">{heroContent.subtitle}</p>
        </div>

        <p className="eyebrow mt-lg flex justify-between" data-reveal style={{ "--reveal-delay": "300ms" } as React.CSSProperties}>
          <span>{heroContent.where}</span>
          <span>{heroContent.when}</span>
        </p>
      </div>
    </section>
  );
}
