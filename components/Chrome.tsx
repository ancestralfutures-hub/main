"use client";

import { useEffect, useRef, useSyncExternalStore, type ReactNode } from "react";
import { navigation, siteConfig } from "@/lib/content";

type Drawer = "about" | "signup";
const DRAWERS: Drawer[] = ["about", "signup"];

const fromHash = (hash: string): Drawer | null => {
  const key = hash.replace(/^#/, "");
  return (DRAWERS as string[]).includes(key) ? (key as Drawer) : null;
};

// The address bar's hash is the one source of truth for which drawer is
// open, read through useSyncExternalStore so the server and the first
// render in the browser agree (both closed) and nothing flashes.
const subscribe = (notify: () => void) => {
  window.addEventListener("hashchange", notify);
  return () => window.removeEventListener("hashchange", notify);
};
const readHash = () => window.location.hash;
const readHashOnServer = () => "";

/*
  Everything around the opening screen: the name along the top, the two
  drawers' names along the bottom, and the drawers themselves.

  A drawer is opened by any link on the page to #about or #signup, the
  navigation and the button on the opening screen alike, so a drawer can
  also be linked to from anywhere, an Instagram bio included. Opening one
  adds a step to the browser's history, so Back closes it, as it would on
  a phone. Close, Escape, and pressing the open drawer's name again all
  close it too.

  While a drawer is open the opening screen is made inert, so the
  keyboard and screen readers move only between the drawer and the two
  bars, and focus goes into the drawer and back to whatever opened it.
*/
export default function Chrome({
  about,
  signup,
  closeLabel,
}: {
  about: ReactNode;
  signup: ReactNode;
  closeLabel: string;
}) {
  const hash = useSyncExternalStore(subscribe, readHash, readHashOnServer);
  const open = fromHash(hash);

  // How many drawer steps this visit has added to the history, so closing
  // can step back over exactly those, and what to return focus to.
  const steps = useRef(0);
  const opener = useRef<HTMLElement | null>(null);
  const panels = useRef<Record<Drawer, HTMLDivElement | null>>({ about: null, signup: null });

  useEffect(() => {
    const close = () => {
      if (!fromHash(window.location.hash)) return;
      if (steps.current > 0) {
        const back = steps.current;
        steps.current = 0;
        window.history.go(-back);
      } else {
        // Arrived with the drawer already open, from a shared link: there is
        // nothing to step back to, so the hash is simply cleared.
        window.history.replaceState(null, "", window.location.pathname + window.location.search);
        window.dispatchEvent(new HashChangeEvent("hashchange"));
      }
    };

    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const closer = target?.closest<HTMLElement>("[data-close-drawer]");
      if (closer) {
        event.preventDefault();
        close();
        return;
      }
      const link = target?.closest<HTMLAnchorElement>('a[href^="#"]');
      const key = link ? fromHash(link.getAttribute("href") ?? "") : null;
      if (!link || !key) return;
      // Pressing the name of the drawer that is already open closes it.
      if (fromHash(window.location.hash) === key) {
        event.preventDefault();
        close();
        return;
      }
      if (!fromHash(window.location.hash)) opener.current = link;
      steps.current += 1;
    };

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  // The opening screen goes inert under a drawer; focus moves into the
  // drawer when it opens and back to what opened it when it closes.
  useEffect(() => {
    document.querySelector("main")?.toggleAttribute("inert", open !== null);
    if (open) {
      const panel = panels.current[open];
      const first = panel?.querySelector<HTMLElement>("[data-autofocus]") ?? panel?.querySelector<HTMLElement>("button");
      // After the drawer has begun to rise, so a phone does not jump.
      const id = window.setTimeout(() => first?.focus({ preventScroll: true }), 80);
      return () => window.clearTimeout(id);
    }
    opener.current?.focus({ preventScroll: true });
    opener.current = null;
  }, [open]);

  return (
    <>
      <div className="bar bar-top">
        <p>{siteConfig.name}</p>
      </div>

      {DRAWERS.map((key) => (
        <div
          key={key}
          ref={(node) => {
            panels.current[key] = node;
          }}
          id={`drawer-${key}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby={`drawer-${key}-title`}
          className="drawer"
          data-open={open === key || undefined}
          inert={open !== key}
        >
          <button type="button" className="drawer-close" data-close-drawer>
            {closeLabel}
          </button>
          <div className="drawer-body">{key === "about" ? about : signup}</div>
        </div>
      ))}

      <nav aria-label="Primary" className="bar bar-bottom">
        <ul>
          {navigation.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                aria-current={open === fromHash(item.href) ? "true" : undefined}
                aria-controls={`drawer-${fromHash(item.href)}`}
                aria-expanded={open === fromHash(item.href)}
                className="link-sweep eyebrow"
              >
                {item.name}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
