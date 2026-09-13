import site from "@/content/site.json";

/*
  The public address of the site, with no trailing slash. Every absolute
  address a search engine or a social card needs is built on it: canonical
  links, the sitemap, the Open Graph card.

  It is the address in content/site.json if one is set; otherwise the
  domain Vercel serves production from; otherwise a local address.

  Server-only: the Vercel variable is not available in the browser.
*/
const configured = (site.siteConfig as { url?: string }).url?.trim();
const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;

export const siteUrl = configured
  ? configured.replace(/\/+$/, "")
  : vercel
    ? `https://${vercel}`
    : "http://localhost:3000";

/** An absolute address for a path on the site, e.g. absoluteUrl("/#signup"). */
export function absoluteUrl(path = "/") {
  return new URL(path, `${siteUrl}/`).toString().replace(/(?<=.)\/$/, "");
}
