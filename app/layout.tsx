import type { Metadata, Viewport } from "next";
import { Figtree } from "next/font/google";
import Footer from "@/components/Footer";
import Grain from "@/components/Grain";
import Header from "@/components/Header";
import RevealObserver from "@/components/RevealObserver";
import StarField from "@/components/StarField";
import { siteConfig } from "@/lib/content";
import { siteUrl } from "@/lib/site-url";
import "./globals.css";

/*
  One typeface for everything, at one weight.

  The face is Halyard Pro Regular, which is licensed from Darden Studio
  and so is not bundled here. Figtree is the stand-in: the same geometric
  skeleton, the same tall x-height, free, and self-hosted by next/font.
  Both stacks in globals.css name Halyard first, so the moment the licensed
  files are installed the site takes them without a code change. See
  public/fonts/README.md.
*/
const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

/*
  What search engines and social cards read. The site address makes the
  canonical link, the card address and the sitemap absolute. The card
  image is app/opengraph-image.tsx and the icon is app/icon.tsx.
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={figtree.variable}>
      {/* No ground on the body: the sky is on <html>, and an opaque body
          would paint over the star field behind it. */}
      <body className="min-h-screen font-body text-body text-moss">
        <RevealObserver />
        <StarField />
        <Grain />
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
