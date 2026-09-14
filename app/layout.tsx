import type { Metadata, Viewport } from "next";
import { Figtree } from "next/font/google";
import Chrome from "@/components/Chrome";
import AboutDrawer from "@/components/drawers/AboutDrawer";
import SignupDrawer from "@/components/drawers/SignupDrawer";
import Grain from "@/components/Grain";
import StarField from "@/components/StarField";
import { siteConfig } from "@/lib/content";
import { siteUrl } from "@/lib/site-url";
import "./globals.css";

/*
  One typeface for everything, at one size and one weight.

  The face is Halyard Pro, which is licensed from Darden Studio and so is
  not bundled here. Figtree is the stand-in: the same geometric skeleton,
  the same tall x-height, free, and self-hosted by next/font. It is loaded
  at semibold only, the one weight the site uses. Both stacks in
  globals.css name Halyard first, so the moment the licensed files are
  installed the site takes them without a code change. See
  public/fonts/README.md.
*/
const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  weight: "600",
  display: "swap",
});

/*
  What search engines and social cards read. The site address makes the
  canonical link, the card address and the sitemap absolute. The card is
  app/opengraph-image.png and the icons are the files beside it.
*/
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: siteConfig.metaTitle,
  description: siteConfig.metaDescription,
  applicationName: siteConfig.name,
  alternates: { canonical: "/" },
  openGraph: {
    title: siteConfig.metaTitle,
    description: siteConfig.metaDescription,
    url: "/",
    siteName: siteConfig.name,
    locale: "en_GB",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true, googleBot: { "max-image-preview": "large" } },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#0b0d0c",
};

/*
  The order here is the order things stack in. The far sky, the opening
  screen, the near stars in front of it, then the controls and drawers,
  with the grain laid over the drawers and beneath the two bars.

  No ground on the body: the sky is on <html>, and an opaque body would
  paint over the star field behind it.
*/
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={figtree.variable}>
      <body className="font-body text-body text-cream">
        <StarField />
        <main>{children}</main>
        <StarField front />
        <Grain />
        <Chrome about={<AboutDrawer />} signup={<SignupDrawer />} closeLabel="Close" />
      </body>
    </html>
  );
}
