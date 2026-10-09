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
- The social rollout is at `/rollout.html`: the whole run of posts from now
  to the last day, each one drawn on a canvas at full size with the caption
  written beside it. The countdown numbers are worked out from the real
  dates, so they are right whenever the page is opened. Both tools are kept
  out of the sitemap and out of search.
- `/emails/` composes every send in the plan from one template: edit the
  subject, headline and Shumba's note, then copy the finished HTML straight
  into Brevo. Each one carries a Book tickets button and a share row.
- `assets/social-plan.md` is the run from today to the day after it closes:
  what goes out each morning and evening, the caption for every post, and
  an email for every day.
- `assets/qr/` holds the QR codes for the window vinyl, as SVG and as very
  large PNGs, with a README on how big to print them and the four things
  that stop one scanning. They were decoded back from the rendered files to
  check they work.
- `assets/session-cards.md` is the copy for the cards handed out at each
  session, in four versions.
- `assets/signage-brief.md` is the brief for the exhibition signage: six
  signs, three versions of each, and the one thing that governs all of it,
  which is that the room is dark and nobody has a phone to read by.
- The artwork those two draw with is in `public/art/`: the wordmark, the hut
  drawing and the two carved figures, each one carried as a white stencil
  with the shape in its alpha so it can be filled in any colour, and
  `stars.jpg`, the artist's night sky that the launch invitation sits on.
  `assets/README.md` says how they were made.

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

## The launch RSVP

`/rsvp` is the invitation page for the launch on 15 October: name, email,
and one guest with their own address. Everyone who fills it in is coming,
so there is nothing to answer yes or no to. Off the navigation, out of the sitemap
and not indexed, because it is a private party on a public site, so the
address is given out rather than found.

It posts to a Brevo form the same way the sign-up does, since GitHub Pages
cannot hold an API key. It is wired up and working: replies land in
`Launch RSVP`, list 4, deliberately **not** `subscribers`, which is list 3.
Party replies in the newsletter list means everyone who RSVPs starts
getting ticket email they never asked for.

The page reads Brevo's reply and only says "you're on the list" when a
contact was actually saved; anything else shows as not having gone
through. `assets/rsvp-setup.md` has the settings the form has to keep,
the two ways Brevo hides a broken form behind a working one, and how to
be emailed when a reply comes in.

The story asset that points at it is `assets/invite-story.png`, and it is
editable on `/rollout.html` under Launch invitation. The note Shumba sends
back to each reply is `assets/emails/rsvp-confirmation.html`, held in Brevo
as a transactional template. Shumba is told about each reply by
`scripts/rsvp-notify.mjs`, which `.github/workflows/rsvp-notify.yml` runs
every ten minutes once the `BREVO_API_KEY` secret is set.

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
