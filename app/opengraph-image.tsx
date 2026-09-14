import { ImageResponse } from "next/og";
import { heroContent, siteConfig } from "@/lib/content";
import { siteUrl } from "@/lib/site-url";

/*
  The card shown when the site is shared: the title in green on the dark,
  the line beneath it, the ember low in the frame and the address. Drawn
  once at build time. Figtree, the stand-in for Halyard Pro, is fetched
  from Google Fonts then; if that fails the card is still drawn, in the
  default face.
*/
export const alt = siteConfig.metaTitle;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const AGENT = "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:20.0) Gecko/20100101 Firefox/20.0";

// Google Fonts serves a plain .woff, which the renderer can read, to an
// older browser. Returns nothing rather than throwing, so the card never
// blocks a build.
async function googleFont(family: string, weight: number) {
  try {
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}`,
      { headers: { "user-agent": AGENT } },
    ).then((response) => response.text());
    const url = css.match(/url\((https:\/\/[^)]+\.woff)\)/)?.[1];
    if (!url) return undefined;
    return await fetch(url).then((response) => response.arrayBuffer());
  } catch {
    return undefined;
  }
}

export default async function Image() {
  const display = await googleFont("Figtree", 400);
  const fonts = display
    ? [{ name: "Figtree", data: display, weight: 400 as const, style: "normal" as const }]
    : [];
  const face = display ? "Figtree" : "sans-serif";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px 72px",
          color: "#3f8f55",
          backgroundColor: "#0b0d0c",
          backgroundImage: [
            "radial-gradient(ellipse 34% 22% at 50% 96%, rgba(240,144,79,0.95), rgba(212,96,43,0.6) 45%, rgba(212,96,43,0) 100%)",
            "radial-gradient(ellipse 60% 40% at 50% 100%, rgba(122,47,18,0.7), rgba(122,47,18,0) 100%)",
          ].join(", "),
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontFamily: face,
              fontSize: 250,
              fontWeight: 400,
              lineHeight: 0.86,
              letterSpacing: "-0.03em",
            }}
          >
            {heroContent.title}
          </div>
          <div
            style={{
              marginTop: 28,
              fontSize: 24,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
            }}
          >
            {heroContent.subtitle}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 22,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
          }}
        >
          <span>{`${heroContent.where} · ${heroContent.when}`}</span>
          <span>{siteUrl.replace(/^https?:\/\//, "")}</span>
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
