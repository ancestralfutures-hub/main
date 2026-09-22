import Image from "next/image";
import logo from "@/assets/dare-logo.webp";
import Hut from "@/components/Hut";
import TicketsButton from "@/components/TicketsButton";
import { creditsContent, heroContent, ticketsContent } from "@/lib/content";

/*
  The opening screen, and the only screen: the logo, the line beneath it,
  the hut glowing in the dark, the month, and the one thing to do. It
  fills the height of the screen exactly and never scrolls; About and Sign
  up open over it.

  One button, and it is tickets, now that they are on sale. Sign up is a
  word away in the bar along the bottom, next to About, and putting it
  here as well only said the same thing twice on a screen that has room
  for very little.

  No reveal here. The logo and the hut are the two largest things the page
  paints, and fading them in would only hold back the moment it counts as
  loaded. The logo is imported rather than referenced by path, so the base
  path the site is served under is applied to it automatically.
*/
export default function HeroSection() {
  return (
    <section id="top" className="hero">
      <h1 className="hero-logo">
        <Image src={logo} alt={heroContent.title} loading="eager" />
      </h1>
      <p className="eyebrow">{heroContent.subtitle}</p>
      <Hut />
      <div className="hero-details">
        <p className="eyebrow">{heroContent.where}</p>
        <p className="eyebrow">{heroContent.when}</p>
      </div>
      <TicketsButton
        eventId={ticketsContent.eventId}
        url={ticketsContent.url}
        label={ticketsContent.title}
        className="hero-cta"
      />
      {/* The funders and the partner, as the poster carries them along its
          bottom edge. Small, because they are an acknowledgement and not a
          line anyone came to read. */}
      <p className="hero-credits">
        {creditsContent.map((line) => (
          <span key={line}>{line}</span>
        ))}
      </p>
    </section>
  );
}
