# The QR codes

All of them point to **https://ancestralfutures.co.uk** and nothing else,
so they never need reprinting if a page moves.

Generated and then **decoded again from the rendered files** to check they
actually scan, including downsampled to 500px to stand in for a phone
camera at a distance. All four read back correctly.

## Use the SVG

Vinyl is cut and printed from vector, and a QR code is pure geometry, so
it should never go to a printer as pixels. `dare-qr_*.svg` scales to any
size with no loss.

The PNGs at 4000px and 8000px are there only for anyone who cannot take an
SVG. 8000px is enough for a full window at print resolution.

## Which colourway

| File | Use |
|---|---|
| `black-on-cream` | **Default.** Highest contrast, scans from furthest |
| `black-on-orange` | On brand and still dark-on-light. Safe |
| `black-on-white` | For clear vinyl, where the glass is the light part |
| `cream-on-black` | Inverted. See the warning below |

**On the inverted one.** Phone cameras from about 2017 onwards read a
light code on a dark ground, but older phones and some scanning apps do
not. For a window that strangers walk past once, do not gamble on their
phone. Use it only where it is decorative and there is a dark-on-light
code elsewhere in the same window.

## How big

The rule is **width = scanning distance ÷ 10**.

| Read from | QR at least |
|---|---|
| 1m | 100mm |
| 2m | 200mm |
| 3m | 300mm |

For a window on the Strand, people are scanning from the pavement, so
**300mm square is the minimum** and bigger is better. At 300mm each module
is about 8mm, which is comfortable.

## Four things that break a QR code

1. **Cropping the quiet zone.** The clear border around the code is part
   of the code. It is four modules wide and it is already in these files.
   Do not trim to the edge of the pattern.
2. **Stretching it.** Scale proportionally. A code squashed to fit a
   shape will not read.
3. **Putting anything on top**, including the logo. These are error
   correction Q, so a quarter can be lost, but spend that on glass and
   dirt rather than decoration.
4. **Low contrast.** Keep the dark part dark. Orange on black looks right
   and scans badly.

## Through glass

Test the real thing in daylight before signing it off, standing where a
passer-by would stand. Reflections are the thing that kills a window code,
so avoid putting it where the building opposite is mirrored, and keep it
below eye level rather than up in the glare.

## Making them again

`node qr.mjs` in the scratchpad, or any encoder set to **error correction
Q** and **four-module quiet zone**. The code is version 3, 29 × 29
modules, 37 across including the quiet zone.
