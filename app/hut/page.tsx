import type { Metadata } from "next";
import Hut3D from "@/components/Hut3D";
import HeroSection from "@/components/sections/HeroSection";
import { publicUrl } from "@/lib/base-path";

/*
  The opening screen with the turnable hut in place of the photograph.

  It is deliberately off the navigation and out of the sitemap, and asks
  not to be indexed: somewhere to look at the model while it is being
  decided whether it belongs on the front page. Nothing links to it, so
  the address is the only way in.

  The model lives in /public and is loaded by its own path, which is the
  one kind of file the build does not prefix for us. The address is worked
  out here, on the server, where the base path is readable, and handed to
  the viewer.
*/
export const metadata: Metadata = {
  title: "The hut, in three dimensions",
  robots: { index: false, follow: false },
  alternates: { canonical: "/hut" },
};

export default function HutPage() {
  return (
    <HeroSection
      hut={
        <Hut3D
          src={publicUrl("/hut.glb")}
          alt="A thatched hut at night, lit from inside, under the stars"
        />
      }
    />
  );
}
