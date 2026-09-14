# The typeface

Everything on the site is set in **Halyard Pro SemiBold**, one face at one
size and one weight, from the name at the top to the sign-up field.

Halyard is licensed from [Darden Studio](https://www.dardenstudio.com) and
is not bundled with this repository, so the site currently renders in the
stand-in: **Figtree**, a free geometric sans with the same skeleton and a
similar x-height, self-hosted by `next/font` in `app/layout.tsx`.

No `@font-face` is declared for Halyard while the files are missing. A
declaration pointing at a file that is not there costs a failed request on
every page load. Instead both stacks in `app/globals.css` name Halyard
first and fall through:

```css
--font-body: "Halyard Text", "Halyard Pro", var(--font-figtree), "Helvetica Neue", Arial, sans-serif;
```

## When the licence is bought

1. Put the web files in this folder, for example
   `HalyardText-SemiBold.woff2` and `HalyardDisplay-SemiBold.woff2`.
2. Add the declarations to the top of `app/globals.css`, above `:root`:

   ```css
   @font-face {
     font-family: "Halyard Text";
     src: url("/fonts/HalyardText-SemiBold.woff2") format("woff2");
     font-weight: 600;
     font-style: normal;
     font-display: swap;
   }
   @font-face {
     font-family: "Halyard Display";
     src: url("/fonts/HalyardDisplay-SemiBold.woff2") format("woff2");
     font-weight: 600;
     font-style: normal;
     font-display: swap;
   }
   ```

3. Nothing else changes. The stacks already name them, so the site picks
   them up and Figtree becomes the fallback it was always meant to be.
4. Optionally drop the `Figtree` import from `app/layout.tsx` to save the
   request, and remove `var(--font-figtree)` from the two stacks.

The asset generator at `/asset-generator.html` names the same faces in the
same order, so its exports follow without any further change. It is a
standalone file, so it pulls the stand-in straight from Google Fonts
rather than through `next/font`.
