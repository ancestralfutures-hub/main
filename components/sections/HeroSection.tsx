import Image from "next/image";
import logo from "@/assets/dare-logo.webp";
import Hut from "@/components/Hut";
import TicketsButton from "@/components/TicketsButton";
import { heroContent, signupContent, ticketsContent } from "@/lib/content";

/*
  The opening screen, and the only screen: the logo, the line beneath it,
  the hut glowing in the dark, the month, and the two things to do. It
  fills the height of the screen exactly and never scrolls; About and Sign
  up open over it.

  Tickets are the ask now that they are on sale, so that is the solid
  orange one; sign up is the same shape, outlined, and is in the bar along
  the bottom as well. They sit on one line, so the row is exactly the one
  button-height the hut's room is worked out against.

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
      <p className="eyebrow">{heroContent.when}</p>
      <div className="hero-actions">
        <TicketsButton
          eventId={ticketsContent.eventId}
          url={ticketsContent.url}
          label={ticketsContent.title}
          className="hero-cta"
        />
        <a href="#signup" className="hero-cta hero-cta-quiet">
          {signupContent.title}
        </a>
      </div>
    </section>
  );
}
