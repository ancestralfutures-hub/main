/*
  The night sky, made the way the well-known pure-CSS parallax star field
  does it: one 1px element carrying several hundred box-shadows, each
  shadow a star. Three of those at three sizes, each drifting at its own
  pace, give the parallax.

  The original generates the shadows with Sass's random(). There is no
  Sass here, so they are built in TypeScript instead, with a seeded
  generator rather than Math.random: the same seed gives the same sky on
  every build, so the HTML, the screenshots and the git diff stay still.
*/

/** The field the stars are scattered over, in pixels. */
export const FIELD = { width: 2600, height: 2000 };

// Mulberry32: small, fast, and good enough for scattering dots.
function seeded(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
  A box-shadow list of `count` stars, as one string. Handed to the element
  as a custom property so its ::after clone, which makes the loop seamless,
  can use the very same list.
*/
export function starShadows(count: number, seed: number, colour = "#fff") {
  const next = seeded(seed);
  const stars: string[] = [];
  for (let i = 0; i < count; i += 1) {
    const x = Math.round(next() * FIELD.width);
    const y = Math.round(next() * FIELD.height);
    stars.push(`${x}px ${y}px ${colour}`);
  }
  return stars.join(",");
}
