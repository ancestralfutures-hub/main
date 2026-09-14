import HeroSection from "@/components/sections/HeroSection";

/*
  One screen, held still: the logo and the hut, the month, and the way in
  to sign up. About and Sign up open over it as full-screen drawers, from
  app/layout.tsx. The venue and the dates are not on it yet.

  The artist and the three rules are built and waiting in
  components/sections (ArtistSection, RulesSection), with their words still
  in content/home.json.
*/
export default function Home() {
  return <HeroSection />;
}
