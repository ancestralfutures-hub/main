"use client";

import { useEffect } from "react";

/*
  Reveals any element carrying a data-reveal attribute as it scrolls into
  view. Mounted once in the root layout; server components opt in simply by
  adding the attribute, and can stagger with a --reveal-delay style.

  Nothing is hidden until this component mounts and adds .reveal-ready to
  <html>, so with JavaScript off or under prefers-reduced-motion the page
  renders normally.
*/
export default function RevealObserver() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const root = document.documentElement;
    root.classList.add("reveal-ready");

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.revealed = "";
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.04 },
    );

    document.querySelectorAll("[data-reveal]").forEach((node) => observer.observe(node));

    return () => {
      observer.disconnect();
      root.classList.remove("reveal-ready");
    };
  }, []);

  return null;
}
