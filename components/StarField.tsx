import type { CSSProperties } from "react";
import { starShadows } from "@/lib/stars";

/*
  Layers of stars drifting upward at different speeds, so the near ones
  pass the far ones. Each layer is a single element whose box-shadow is
  a list of dots; the list is passed down as a custom property so the
  ::after clone that makes the loop seamless can reuse it without
  repeating it in the CSS.

  The sky behind everything has three layers. A second, sparse sky of
  brighter stars sits in front of the opening screen, the logo and the hut
  included, and drifts a little faster, being nearer.

  Everything else is in globals.css under Night sky. Decorative, so it is
  hidden from screen readers, and it holds still under
  prefers-reduced-motion.
*/

const BACK = [
  { className: "stars-1", count: 600, seed: 11 },
  { className: "stars-2", count: 160, seed: 22 },
  { className: "stars-3", count: 70, seed: 33 },
];

const FRONT = [
  { className: "stars-2", count: 46, seed: 44 },
  { className: "stars-3", count: 16, seed: 55 },
];

export default function StarField({ front = false }: { front?: boolean }) {
  const layers = front ? FRONT : BACK;
  return (
    <div aria-hidden="true" className={front ? "sky sky-front" : "sky"}>
      {layers.map((layer) => (
        <div
          key={layer.className}
          className={`stars ${layer.className}`}
          style={{ "--shadows": starShadows(layer.count, layer.seed) } as CSSProperties}
        />
      ))}
    </div>
  );
}
