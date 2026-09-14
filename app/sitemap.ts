import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site-url";

// Rendered once at build time into a plain file, as a static export requires.
export const dynamic = "force-static";

// One page. Dated at build time, which is when the content last changed,
// since every edit redeploys.
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: absoluteUrl("/"), lastModified: new Date(), changeFrequency: "weekly", priority: 1 }];
}
