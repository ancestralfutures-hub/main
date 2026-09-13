import type { CSSProperties } from "react";
import { starShadows } from "@/lib/stars";

/*
  Three layers of stars behind the whole page, drifting upward at three
  speeds so the near ones pass the far ones. Each layer is a single
  element whose box-shadow is a few hundred dots; the list is passed down
  as a custom property so the ::after clone that makes the loop seamless
  can reuse it without repeating several kilobytes of CSS.

  Everything else is in globals.css under Night sky. Decorative, so it is
  hidden from screen readers, and it holds still under
  prefers-reduced-motion.
*/

const layers = [
  { className: "stars-1", count: 600, seed: 11 },
  { className: "stars-2", count: 160, seed: 22 },
  { className: "stars-3", count: 70, seed: 33 },
];

export default function StarField() {
  return (
    <div aria-hidden="true" className="sky">
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
