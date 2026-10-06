import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site-url";

// Rendered once at build time into a plain file, as a static export requires.
export const dynamic = "force-static";

// Everything may be crawled except the two tools for whoever makes the
// posts, which are not pages of the site.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/asset-generator.html", "/rollout.html", "/qr/", "/emails/"] },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
