import AboutSection from "@/components/sections/AboutSection";
import ArtistSection from "@/components/sections/ArtistSection";
import HeroSection from "@/components/sections/HeroSection";
import RulesSection from "@/components/sections/RulesSection";
import SignupSection from "@/components/sections/SignupSection";

/*
  One page, read from top to bottom: the title and the fire, what a daré
  is, who made this one, the three rules, and the way to hear first. The
  venue and the dates are not on it yet; the month is.
*/
export default function Home() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <ArtistSection />
      <RulesSection />
      <SignupSection />
    </>
  );
}
