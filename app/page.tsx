import AboutSection from "@/components/sections/AboutSection";
import HeroSection from "@/components/sections/HeroSection";
import SignupSection from "@/components/sections/SignupSection";

/*
  Kept deliberately clean for now: the logo and the hut, what the Daré is,
  and the way to hear first. The month is on it; the venue and the dates
  are not.

  The artist and the three rules are built and waiting in
  components/sections (ArtistSection, RulesSection), with their words
  still in content/home.json. Import them here to bring them back.
*/
export default function Home() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <SignupSection />
    </>
  );
}
