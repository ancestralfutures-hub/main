import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site-url";

// One page. Dated at build time, which is when the content last changed,
// since every edit redeploys.
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: absoluteUrl("/"), lastModified: new Date(), changeFrequency: "weekly", priority: 1 }];
}
