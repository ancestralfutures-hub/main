"use client";

import { useEffect, useState } from "react";
import NavLink from "@/components/NavLink";
import Wordmark from "@/components/Wordmark";
import { navigation } from "@/lib/content";

// Watches the page's sections and reports whichever fills most of the
// viewport, so the nav marks where you are as you scroll.
function useActiveSection() {
  const [active, setActive] = useState("");

  useEffect(() => {
    const sections = navigation
      .map((item) => document.getElementById(item.href.slice(1)))
      .filter((el): el is HTMLElement => el !== null);
    if (!sections.length) return;

    const ratios = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) ratios.set(entry.target.id, entry.intersectionRatio);
        let best = "";
        let bestRatio = 0;
        for (const [id, ratio] of ratios) {
          if (ratio > bestRatio) {
            best = id;
            bestRatio = ratio;
          }
        }
        setActive(bestRatio > 0 ? best : "");
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return active;
}

/*
  The chrome sits in two places: the name pinned top left, and the
  navigation pinned along the bottom. Both are fixed and fully transparent,
  so the screens pass beneath them. One page, so every link is an anchor.
*/
export default function Header() {
  const active = useActiveSection();

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 top-0 z-50 flex h-header items-center px-xs md:px-md">
        <div className="pointer-events-auto">
          <Wordmark />
        </div>
      </div>

      <nav aria-label="Primary" className="nav-bottom fixed inset-x-0 bottom-0 z-50 text-green">
        <div className="relative flex h-header items-center px-xs md:px-md">
          <ul className="flex w-full justify-between md:w-auto md:justify-start md:gap-md">
            {navigation.map((entry) => (
              <li key={entry.href}>
                <NavLink href={`/${entry.href}`} current={entry.href.slice(1) === active}>
                  {entry.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </>
  );
}
