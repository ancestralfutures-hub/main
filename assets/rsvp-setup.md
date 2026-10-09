# Wiring the RSVP to Brevo

**The form is live and working.** `rsvp.form.action` holds the Brevo form,
a reply lands in `Launch RSVP` with all four fields filled, with or without
a guest, and nothing reaches `subscribers`. Both paths were tested from a
real browser against the built site on 8 October 2026, then the test
contacts deleted, so the list starts empty.

**Being told when someone replies** is the one thing not set up. See the
end of this note.

---

## The one thing that matters

**Make the RSVP its own list. Do not point it at `subscribers`.**

If party replies land in the newsletter list, everyone who RSVPs starts
getting ticket emails they never asked for, and the first one of those is
a complaint. Two different consents: one is "tell me about the work", the
other is "I am coming on the 15th".

---

## What is in place

Built in the Ancestral Futures account over the API and read back to check:

- **A list called `Launch RSVP`, list id 4.** Separate from `subscribers`,
  which is list 3.
- **The hosted form**, pointed at list 4 only, no confirmation email, no
  captcha, all four fields on it and none of them required, wired into
  `content/home.json`.
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

## How the form has to stay set up

If the form is ever rebuilt, these are the settings that matter.

- **Pointed at `Launch RSVP` and nothing else.**
- **Double opt-in off.** This is a reply to an invitation, not a newsletter
  sign-up. Asking someone to confirm a subscription they did not make will
  lose you replies.
- **reCAPTCHA off.** The page posts the form itself rather than embedding
  Brevo's, so a captcha has no token to check and every submission fails.
  The form has a honeypot field instead, which stops the bots that bother
  with a site this size.
- **All four fields on the form.** See above. Off the form, off the record.
- **None of them marked Required.** With Required on `GUEST`, Brevo refuses
  everyone who comes alone. The page already insists on a name and an
  address, and on both guest details once the box is ticked; Brevo's copy
  of that rule can only get it wrong.

Brevo has no API for building forms, so all of that is the UI.

## Two things that will waste an afternoon

**A success reply is not proof of a save.** A field that is not on the
form is dropped with `success: true`. A required field left empty comes
back as `success: false`, which the page now shows as not having gone
through. The only way to know a change to the form worked is to submit
one and then look at the contact.

**It ignores anything that does not look like a browser.** Submitting with
`curl` and its default user agent gets `{"success": true}` and is thrown
away silently. Testing from the command line needs a real browser's user
agent string, or it looks like it works and never does.

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
- **The reply is read.** Brevo lets the site's origin read its answer, and
  the page shows the thank-you only on an actual `success: true`. A
  refusal, or a reply it cannot read, shows "did not go through" instead.
  Brevo keys contacts on the address, so trying again never counts anyone
  twice at the door.
- **A honeypot field** that people never see and bots fill in. A filled
  one is answered as though it worked and sent nowhere.

---

## What they get back

A short note from Shumba, straight after they reply: on the list, looking
forward to seeing you and celebrating together, see you deya. It names
them and, if they brought one, their guest, with the night's time and
address underneath.

It is built in Brevo as a **transactional template, id 8, "RSVP
confirmation: See you on the 15th"**, from Shumba Maasai at
`shumba@ancestralfutures.co.uk`. The source is
`assets/emails/rsvp-confirmation.html`; edit that, then paste it over the
template's HTML in Brevo. The name and guest come from the contact's
attributes, written as `{{ contact.NAME }}` and `{{ contact.GUEST }}`, each
inside an `{% if %}` so a missing one leaves no gap.

**Shumba is copied on every one.** Brevo's form can send a confirmation
itself but cannot copy anyone on it, so the form's own confirmation stays
**off** and the note is sent from here instead: `scripts/rsvp-notify.mjs`,
run every ten minutes by `.github/workflows/rsvp-notify.yml`, reads the
list and sends template 8 to every guest nobody has answered yet, with
`shumba@ancestralfutures.co.uk` in cc. Do not also turn on the form's
confirmation email, or guests get the note twice.

The memory is the contact's `NOTIFIED` attribute, written only after the
send is accepted. No state file, nothing sent twice, and a failed send is
tried again next time rather than lost. Clear the attribute on a contact
and they are answered again.

**It needs one secret.** In the repository on GitHub, **Settings →
Secrets and variables → Actions → New repository secret**, named
`BREVO_API_KEY`, holding a Brevo API key. Until it is there, the workflow
runs and sends nothing. Make the key fresh for this rather than reusing
one that has been pasted anywhere.

Ten minutes is as often as GitHub will run anything on a schedule, and
on a busy day it can be later. If instant matters, the automation is
still there to build in Brevo: trigger *a contact is added to a list*,
`Launch RSVP`; action the one that emails you rather than the contact.

Either way the list is the record: **Contacts → Lists → Launch RSVP**
shows everyone, and the four attribute columns are the door list.
