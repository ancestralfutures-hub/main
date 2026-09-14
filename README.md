# DARÉ, by Ancestral Futures

The site for DARÉ, a sonic installation by Shumba Maasai. One screen that
never scrolls: the logo, the hut and October 2026, with About and Sign up
opening over it as full-screen drawers. No venue or dates yet.

Built with Next.js as plain static files and hosted on GitHub Pages. The
logo and the hut are the designer's; the colours are the logo's own cream
and orange, and all text is one size and one weight.

## Running it

```bash
npm install
npm run dev
```

`npm run build` writes the finished site to `out/`.

## Words and pictures

- Every word is in `content/home.json` and `content/site.json`.
- The logo and the hut are in `assets/`. `assets/README.md` records exactly
  how the hut was prepared from the designer's file.
- The typeface is Halyard Pro SemiBold, standing in as Figtree until it is
  licensed. See `public/fonts/README.md`.
- The drawers open from any link to `#about` or `#signup`, so
  `ancestralfutures.com/#signup` goes straight to the form, from an
  Instagram bio for instance. Back, Escape and Close all shut them.
- The asset generator for social posts is at `/asset-generator.html`.

The artist section and the three rules are built but not shown, in
`components/sections`.

## Publishing

Every push to `main` builds and publishes the site, through
`.github/workflows/pages.yml`.

One-time setup on github.com, in the repository:
**Settings > Pages > Build and deployment > Source: GitHub Actions**.

Until a domain is attached the site is at
`https://ancestralfutures-hub.github.io/main/`.

## The domain

In **Settings > Pages > Custom domain**, enter the domain and save. Then add
these records wherever the domain's DNS is managed:

| Type | Host | Value |
|---|---|---|
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| AAAA | @ | 2606:50c0:8000::153 |
| AAAA | @ | 2606:50c0:8001::153 |
| AAAA | @ | 2606:50c0:8002::153 |
| AAAA | @ | 2606:50c0:8003::153 |
| CNAME | www | ancestralfutures-hub.github.io |

Remove any other A, AAAA or CNAME records on `@` and `www` first, such as a
Squarespace site or a forwarding rule. Once GitHub shows the domain as
verified, tick **Enforce HTTPS**. Then re-run the workflow from the
Actions tab, so the site is rebuilt for the domain's root.

## Sign-up (Brevo)

GitHub Pages cannot run server code, so the form cannot hold an API key.
It posts instead to a sign-up form hosted by Brevo, which needs no key.

1. In Brevo: **Contacts > Forms > Create a subscription form**.
2. Add it to the **subscribers** list (list 3). Leave reCAPTCHA off.
3. Under **Share**, take the form's address. It looks like
   `https://xxxxxxxx.sibforms.com/serve/MUIF...`.
4. Put it in `content/home.json` as `signup.form.action`, and push.

Until then the form says sign-up is opening soon.
