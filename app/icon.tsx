import { ImageResponse } from "next/og";

// The tab icon: a green D on the dark, drawn at build time.
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0b0d0c",
          color: "#3f8f55",
          fontSize: 44,
          fontWeight: 400,
          fontFamily: "sans-serif",
        }}
      >
        D
      </div>
    ),
    size,
  );
}
