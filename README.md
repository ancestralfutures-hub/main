# DARÉ, by Ancestral Futures

The site for DARÉ, a sonic installation by Shumba Maasai, at
ancestralfutures.com. One page: the title and the fire, what a daré is,
the artist, the three rules, and a sign-up form.

Built with Next.js and Tailwind. The layout follows iandiworldwide.org;
the palette and the copy follow the poster.

## Running it

```bash
npm install
npm run dev
```

## Copy

Every word on the page is in `content/home.json` and `content/site.json`.
Edit those; nothing in the components needs to change. The venue and the
dates are deliberately not on the site yet. When they are announced, add
them to `content/home.json` and the poster's remaining lines can go in.

## Sign-up form (Brevo)

The form posts to `/api/subscribe`, which adds the address to a Brevo
list. Set these in Vercel, Settings > Environment Variables, for
Production:

| Name | What it is |
|---|---|
| `BREVO_API_KEY` | An API key, made in Brevo under SMTP & API > API keys |
| `BREVO_LIST_ID` | The id of the list sign-ups join, from Contacts > Lists |

Until both are set the form tells the visitor it is not ready yet.

## Going live

1. Push to a GitHub repository and import it into a new Vercel project.
2. Add the two Brevo variables above.
3. Add `ancestralfutures.com` and `www.ancestralfutures.com` under the
   project's Domains, then point the DNS at Vercel as it instructs.

The site address is set in `content/site.json`; every absolute link,
the sitemap and the social card are built from it.
