import type { NextConfig } from "next";

/*
  Built as plain static files for GitHub Pages: every page is rendered at
  build time into /out, and nothing runs on a server.

  The base path is supplied by the deploy workflow. Served from the free
  address (ancestralfutures-hub.github.io/main) the site lives under /main;
  once a custom domain is set on the repository it lives at the root, and
  the workflow passes an empty base path without anyone editing this file.
*/
const nextConfig: NextConfig = {
  output: "export",
  basePath: process.env.PAGES_BASE_PATH || "",
  images: {
    // Pages cannot resize images on request. The sizes the page needs are
    // made ahead of time and live in /assets.
    unoptimized: true,
  },
};

export default nextConfig;
