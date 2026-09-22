# DARÉ, by Ancestral Futures

The site for DARÉ, a sonic installation by Shumba Maasai. One screen that
never scrolls: the logo, the hut, the venue and dates, Book tickets, and
the credits along the bottom, with About and Sign up opening over it as
full-screen drawers.

Zimbabwe House, 429 Strand, London, 15 to 22 October 2026, 1pm to 8pm.

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
  `www.ancestralfutures.co.uk/#signup` goes straight to the form, from an
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

The site's address is **www.ancestralfutures.co.uk**, registered with IONOS.
The DNS there already points at GitHub:

| Type | Host | Value |
|---|---|---|
| A | @ | 185.199.108.153, .109.153, .110.153, .111.153 |
| CNAME | www | ancestralfutures-hub.github.io |

GitHub will only attach a domain to one repository. If it reports the
domain as already taken, verify it on the account that owns this
repository, which releases it from anywhere else:

1. Signed in as **ancestralfutures-hub**, open your account's
   **Settings > Pages > Add a domain** and enter `ancestralfutures.co.uk`.
2. GitHub shows a TXT record. In IONOS, under **Domains & SSL > the domain >
   DNS**, add it: type TXT, host `_github-pages-challenge-ancestralfutures-hub`,
   value as shown.
3. Back in GitHub, press **Verify**.
4. In this repository, **Settings > Pages > Custom domain**: enter
   `www.ancestralfutures.co.uk` and save.
5. Once the DNS check passes, tick **Enforce HTTPS**, then re-run the
   deploy from the Actions tab so the site is rebuilt for the domain's root.

The address the site builds its links from is `url` in `content/site.json`.

## Sign-up (Brevo)

GitHub Pages cannot run server code, so the form cannot hold an API key.
It posts instead to a sign-up form hosted by Brevo, which needs no key.

1. In Brevo: **Contacts > Forms > Create a subscription form**.
2. Add it to the **subscribers** list (list 3). Leave reCAPTCHA off.
3. Under **Share**, take the form's address. It looks like
   `https://xxxxxxxx.sibforms.com/serve/MUIF...`.
4. Put it in `content/home.json` as `signup.form.action`, and push.

Until then the form says sign-up is opening soon.

## Tickets (Eventbrite)

**Book tickets** opens Eventbrite's checkout over the page, without
leaving it. The event is in `content/home.json` under `tickets`: change
`eventId` and `url` together and nothing else needs touching.

`components/TicketsButton.tsx` renders it as a plain link to the Eventbrite
page and upgrades it. Only once Eventbrite's widget script has loaded and
the modal has actually been built does a click stop following the link, so
with JavaScript off, with the script blocked, or in the moment before it
arrives, the button still takes you to Eventbrite. Eventbrite's own snippet
uses a `<button>` with a `<noscript>` link beside it, which is a dead
control in all three of those cases.

Eventbrite refuses to open the checkout on an origin it does not know:
`parent=http://localhost` is answered with a 403, so **the modal cannot be
tested from `npm run dev`**: the button falls back to the link, which is
the fallback working as intended. Both live origins are accepted.
