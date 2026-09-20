import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site-url";

// Rendered once at build time into a plain file, as a static export requires.
export const dynamic = "force-static";

// Everything may be crawled except the asset generator, which is a tool
// for whoever makes the posts rather than a page of the site, and /hut,
// which is the model on trial and is off the navigation on purpose.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/asset-generator.html", "/hut"] },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
