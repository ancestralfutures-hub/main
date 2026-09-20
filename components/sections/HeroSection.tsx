import Image from "next/image";
import type { ReactNode } from "react";
import logo from "@/assets/dare-logo.webp";
import Hut from "@/components/Hut";
import { heroContent, signupContent } from "@/lib/content";

/*
  The opening screen, and the only screen: the logo, the line beneath it,
  the hut glowing in the dark, the month, and the button that opens the
  sign-up drawer. It fills the height of the screen exactly and never
  scrolls; About and Sign up open over it.

  The hut is a prop only so that /hut can put the turnable model in the
  same slot without a second copy of everything around it. Every page but
  that one takes the photograph, which is the default.

  No reveal here. The logo and the hut are the two largest things the page
  paints, and fading them in would only hold back the moment it counts as
  loaded. The logo is imported rather than referenced by path, so the base
  path the site is served under is applied to it automatically.
*/
export default function HeroSection({ hut = <Hut /> }: { hut?: ReactNode }) {
  return (
    <section id="top" className="hero">
      <h1 className="hero-logo">
        <Image src={logo} alt={heroContent.title} loading="eager" />
      </h1>
      <p className="eyebrow">{heroContent.subtitle}</p>
      {hut}
      <p className="eyebrow">{heroContent.when}</p>
      <a href="#signup" className="hero-cta">
        {signupContent.title}
      </a>
    </section>
  );
}
