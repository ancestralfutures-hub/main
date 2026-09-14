import Image from "next/image";
import logo from "@/assets/dare-logo.webp";
import Hut from "@/components/Hut";
import { heroContent } from "@/lib/content";

/*
  The opening screen, set as the poster is: the logo high and centred, the
  line beneath it, the hut glowing in the middle of the dark, and the month
  at the foot. Nothing else.

  No reveal here. The logo and the hut are the two largest things the page
  paints, and fading them in would only hold back the moment it counts as
  loaded. The logo is imported rather than referenced by path, so the base
  path the site is served under is applied to it automatically.
*/
export default function HeroSection() {
  return (
    <section id="top" className="hero section-full">
      <div className="hero-head">
        <h1 className="hero-logo">
          <Image src={logo} alt={heroContent.title} loading="eager" />
        </h1>
        <p className="eyebrow">{heroContent.subtitle}</p>
      </div>

      <Hut />

      <p className="eyebrow">{heroContent.when}</p>
    </section>
  );
}
