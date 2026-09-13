import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Instrument_Sans } from "next/font/google";
import Footer from "@/components/Footer";
import Grain from "@/components/Grain";
import Header from "@/components/Header";
import RevealObserver from "@/components/RevealObserver";
import { siteConfig } from "@/lib/content";
import { siteUrl } from "@/lib/site-url";
import "./globals.css";

// Body: a plain grotesque, self-hosted by next/font.
const instrument = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

// Title and rules: a grotesque with ink traps, heavy, close to the
// poster's lettering. 400 carries the section headings.
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["400", "800"],
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
    <html lang="en" className={`${instrument.variable} ${bricolage.variable}`}>
      <body className="min-h-screen bg-ground font-body text-body text-moss">
        <RevealObserver />
        <Grain />
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
