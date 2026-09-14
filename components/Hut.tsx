import hutLarge from "@/assets/hut-1800.webp";
import hutSmall from "@/assets/hut-1000.webp";

/*
  The hut, lit from inside, with the fire's glow breathing behind it.

  The photograph is an ordinary opaque image whose night sky has been
  pushed to pure black (see assets/README.md). It is drawn with
  mix-blend-mode: screen, which leaves the page untouched wherever the
  picture is black and adds light wherever it is not. So the sky around the
  hut disappears, the fire glows, and the page's own stars show through
  the dark thatch, all without a transparent file, which for a photograph
  this grainy would be many times the size. It is held a touch below full
  strength on top of that.

  For screen to see the stars, nothing between this picture and the page
  may start a new stacking context: no z-index, opacity, transform, filter
  or will-change on .hut or any section around it. The glows are siblings,
  not ancestors, so their blur and animation are fine.

  Behind it, two glows. The wide one breathes, slowly swelling and
  settling. The small hot one sits at the eaves, where the light spills
  out, and trembles, as a fire does. Both are pure CSS, compositor-only,
  and hold still under prefers-reduced-motion.
*/
export default function Hut() {
  return (
    <div className="hut">
      <span aria-hidden="true" className="hut-glow" />
      <span aria-hidden="true" className="hut-glow-core" />
      {/* A plain img: the site is a static export with no image optimiser,
          so the two sizes are made ahead of time and offered as a srcset. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={hutLarge.src}
        srcSet={`${hutSmall.src} ${hutSmall.width}w, ${hutLarge.src} ${hutLarge.width}w`}
        sizes="(max-width: 640px) 92vw, 760px"
        width={hutLarge.width}
        height={hutLarge.height}
        alt="A thatched hut at night, lit from inside, under the stars"
        fetchPriority="high"
        decoding="async"
        className="hut-img"
      />
    </div>
  );
}
