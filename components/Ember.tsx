"use client";

import { useEffect, useRef } from "react";

// The fire behind the opening screen, seen through the thatch of a hut.
// CSS does the glowing; the one piece of script here stops the animation
// while the screen is out of view. It holds still under
// prefers-reduced-motion, and it is decorative so it is hidden from
// screen readers.
export default function Ember() {
  const field = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = field.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => element.toggleAttribute("data-still", !entry.isIntersecting),
      { rootMargin: "20% 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={field} aria-hidden="true" className="ember">
      <span className="ember-bloom ember-bloom-3" />
      <span className="ember-bloom ember-bloom-1" />
      <span className="ember-bloom ember-bloom-2" />
      <span className="ember-hut" />
    </div>
  );
}
