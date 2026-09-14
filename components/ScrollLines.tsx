"use client";

import { useEffect, useRef } from "react";

// How fast the lines drift on their own, in pixels a second, and the most a
// scroll or a swipe can add on top.
const DRIFT = 26;
const MAX_PUSH = 900;

/*
  The two short lines, each on its own row, each said again and again end
  to end, the rows drifting sideways in opposite directions.

  The page itself never scrolls, so the scroll is put to use here instead:
  a turn of the wheel or a swipe pushes the lines along faster, and they
  ease back to their drift.

  Each row loops by the width of one saying of its phrase, so the join is
  never seen. It only moves while it is on screen, and under
  prefers-reduced-motion it does not move at all: the stylesheet shows each
  line once, centred. Screen readers get the two lines once, plainly.
*/
export default function ScrollLines({ lines }: { lines: string[] }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = root.current;
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const rows = Array.from(element.querySelectorAll<HTMLElement>(".lines-row")).map((row, index) => ({
      row,
      direction: index % 2 === 0 ? -1 : 1,
      x: 0,
      unit: 0,
    }));

    const measure = () => {
      for (const r of rows) {
        const first = r.row.firstElementChild as HTMLElement | null;
        r.unit = first?.offsetWidth ?? 0;
        // The rightward row starts a whole saying to the left, so its left
        // end is never on screen.
        if (r.direction > 0 && r.unit) r.x = -r.unit;
      }
    };
    measure();

    let push = 0;
    let visible = false;
    let frame = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      push *= Math.pow(0.04, dt);
      const speed = DRIFT + push;
      for (const r of rows) {
        if (!r.unit) continue;
        r.x += r.direction * speed * dt;
        if (r.x <= -r.unit) r.x += r.unit;
        if (r.x > 0) r.x -= r.unit;
        r.row.style.transform = `translate3d(${r.x.toFixed(2)}px, 0, 0)`;
      }
      frame = visible ? window.requestAnimationFrame(tick) : 0;
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !frame) {
        last = performance.now();
        frame = window.requestAnimationFrame(tick);
      }
    });
    observer.observe(element);

    const onWheel = (event: WheelEvent) => {
      if (visible) push = Math.min(MAX_PUSH, push + Math.abs(event.deltaY) + Math.abs(event.deltaX));
    };
    let touchY = 0;
    const onTouchStart = (event: TouchEvent) => {
      touchY = event.touches[0]?.clientY ?? 0;
    };
    const onTouchMove = (event: TouchEvent) => {
      const y = event.touches[0]?.clientY ?? touchY;
      if (visible) push = Math.min(MAX_PUSH, push + Math.abs(y - touchY) * 3);
      touchY = y;
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("resize", measure);
    };
  }, []);

  return (
    <>
      <div ref={root} className="lines" aria-hidden="true">
        {lines.map((line) => {
          // Enough sayings to cover a wide screen plus one to loop into.
          const count = Math.max(4, Math.ceil(2800 / (line.length * 12 + 70))) + 1;
          return (
            <div key={line} className="lines-row">
              {Array.from({ length: count }, (_, index) => (
                <span key={index} className="lines-item rule-line" data-repeat={index > 0 || undefined}>
                  {line}
                </span>
              ))}
            </div>
          );
        })}
      </div>
      <p className="sr-only">{lines.join(" ")}</p>
    </>
  );
}
