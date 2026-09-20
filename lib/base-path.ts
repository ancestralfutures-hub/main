/*
  The prefix the site is served under, the same value next.config.ts gives
  Next. Anything imported (the logo, the hut photograph) has this applied
  for it; a file loaded from /public by its own path, as the hut model is,
  does not, so it is spelled out here.

  Server-only, like lib/site-url.ts: the variable is set on the build and
  is not handed to the browser. A page reads it and passes the finished
  address down to whatever fetches the file.
*/
export const basePath = (process.env.PAGES_BASE_PATH || "").replace(/\/+$/, "");

/** The address of a file in /public, e.g. publicUrl("/hut.glb"). */
export function publicUrl(path: string) {
  return `${basePath}${path}`;
}
