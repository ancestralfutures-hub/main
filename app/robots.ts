import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site-url";

// Everything may be crawled except the sign-up endpoint and the asset
// generator, which is a tool for whoever makes the posts rather than a
// page of the site.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/asset-generator.html"] },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
