# Wiring the RSVP to Brevo

**Where the RSVPs go right now: nowhere.** `rsvp.form.action` in
`content/home.json` is empty, so the form never posts and says "RSVP is
opening shortly" instead. Nothing is being collected and nothing is being
lost. One step is left and it is the one that cannot be done from here.

---

## The one thing that matters

**Make the RSVP its own list. Do not point it at `subscribers`.**

If party replies land in the newsletter list, everyone who RSVPs starts
getting ticket emails they never asked for, and the first one of those is
a complaint. Two different consents: one is "tell me about the work", the
other is "I am coming on the 15th".

---

## Already done

Built in the Ancestral Futures account over the API and read back to check:

- **A list called `Launch RSVP`, list id 4.** Separate from `subscribers`,
  which is list 3.
- **The four attributes**, spelled the way the form posts them:

  | Attribute | Type | Holds |
  |---|---|---|
  | `NAME` | text | who replied |
  | `GUEST` | text | their guest's name, blank if none |
  | `GUEST_EMAIL` | text | their guest's address, blank if none |
  | `PARTY_SIZE` | number | 1, or 2 with a named guest |

  `PARTY_SIZE` is a number rather than text so the door list can be added
  up instead of counted by hand.

---

## The step that is left

Brevo has no API for building forms, so this one is the UI.

1. **Contacts → Forms → Create a subscription form.** Point it at
   `Launch RSVP` and nothing else.

   - **Double opt-in off.** This is a reply to an invitation, not a
     newsletter sign-up. Asking someone to confirm a subscription they did
     not make will lose you replies.
   - **reCAPTCHA off.** The page posts the form itself rather than
     embedding Brevo's, so a captcha has no token to check and every
     submission fails. The form has a honeypot field instead, which stops
     the bots that bother with a site this size.

   The four attributes do not have to be fields on Brevo's own form. The
   page posts them by name whether or not Brevo drew a box for them.

2. **Share → copy the form's address.** It looks like
   `https://xxxxxxxx.sibforms.com/serve/MUIF...`

3. Put it in `content/home.json` as `rsvp.form.action`, and push.

4. **Send yourself one**, with a guest, and check the contact in list 4 has
   all four attributes filled.

---

## On the guest's address

The guest has not agreed to anything. Their address arrives as an
attribute on the host's record rather than as a contact of their own, so
they are on the door list and not on a mailing list. The form says so
underneath the field, which is the only place the person typing it will
see it.

If you want to write to guests directly, export the list, ask them, and
import the ones who say yes. Do not add them silently.

---

## What is safe about this already

- **No key in the browser.** The site is static files and Brevo's hosted
  form needs no key: it is public by design and can only ever add to the
  one list it was made for.
- **Posted once.** The reply cannot be read across origins, so the request
  is sent once rather than retried, and nobody is counted twice at the
  door.
- **A honeypot field** that people never see and bots fill in. A filled
  one is answered as though it worked and sent nowhere.
