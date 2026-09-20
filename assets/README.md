# Artwork

The page imports these files, so each is published under a hashed name and
picks up the site's base path automatically. The originals are the
designer's: `Dare Logo-02.png` (5625 × 4500) and `hut lit up.jpg`
(12756 × 15945).

| File | What it is |
|---|---|
| `dare-logo.webp` | The logo, trimmed of its empty margin, 1400 wide, lossless |
| `hut-1800.webp` | The hut for large screens, 1800 wide |
| `hut-1000.webp` | The hut for phones, 1000 wide |

`public/` also carries `dare-logo.png` (2400 wide) and `hut.webp` (the same
as `hut-1800.webp`) for the asset generator, which loads them by path, and
`hut.glb`, the hut as a model, which `/hut` loads by path. The model was
not made here: `hut3d/README.md` says where it came from and how the 4.4MB
copy was cut out of the 400MB the renderer produced.

## How the hut was made

The designer's photograph is an opaque picture on a black, grainy night
sky. The page draws it with `mix-blend-mode: screen`, which drops pure
black out entirely, so the sky has to be pure black first:

1. **Crop** to a frame centred on the hut. In the original's pixels:
   left 2297, top 5559, width 8018, height 4666.
2. **Resize** to 2000 wide.
3. **Lift the black point**: every channel becomes
   `max(0, value − 30) × 255 / 225`, which sends the sky's grain to zero
   and leaves the fire and thatch in tone.
4. **Clear what is left of the grain**: any pixel whose brightest channel
   is under 6 becomes black. Invisible by eye, but screen would otherwise
   add it as a faint haze.
5. **Encode** as WebP, quality 82 (1800 wide) and 80 (1000 wide).

A transparent PNG was tried first. Grain in a transparency channel does not
compress, and it came out at over 2MB against 270KB for this.

Inside the hut's frame, the eaves sit at 57% of the height, the eave tips
at 9% and 91% of the width, and the base at 86% of the height. The glow in
`app/globals.css` and the feathered edge are placed from those numbers.
