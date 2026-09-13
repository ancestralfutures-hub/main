import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site-url";

// Everything may be crawled except the sign-up endpoint.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/"] },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
