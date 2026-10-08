"use client";

import { type SubmitEvent, useState } from "react";
import { rsvpContent } from "@/lib/content";

type Status = "idle" | "sending" | "sent" | "error" | "unset";

/*
  The RSVP for the launch, posting to a Brevo form the same way the
  sign-up does: the site is static files on GitHub Pages, so there is no
  server of its own to hold an API key, and a key must never be sent to
  the browser. Brevo's hosted form needs none.

  The form's address lives in content/home.json as rsvp.form.action. Until
  it is set, submitting says RSVP is opening shortly rather than failing
  silently, which is what a form posting into nothing does.

  Brevo's form host allows this site's origin to read its reply, and the
  reply is the only thing that says whether anything was saved: a field the
  form rejects comes back as success false, and a request it treats as a
  bot comes back as success true with nothing written. So the reply is
  read, and the thank-you shows only on an actual success. Anything else,
  including a reply that cannot be read, is shown as not having gone
  through, because on a door list a false "you're on it" is worse than a
  false "try again". Brevo keys contacts on the address, so a retry never
  counts anyone twice.
*/
export default function RsvpForm() {
  const { form } = rsvpContent;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [bringing, setBringing] = useState(false);
  const [guest, setGuest] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [trap, setTrap] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === "sending") return;
    if (!form.action) {
      setStatus("unset");
      return;
    }
    // A filled honeypot is a bot. Say it went fine and send nothing.
    if (trap) {
      setStatus("sent");
      return;
    }

    setStatus("sending");
    const named = bringing ? guest.trim() : "";
    const body = new FormData();
    body.set("EMAIL", email);
    body.set("NAME", name.trim());
    body.set("GUEST", named);
    body.set("GUEST_EMAIL", bringing ? guestEmail.trim() : "");
    // Only a named guest counts. A ticked box with nothing in it is not a
    // person, and a list that thinks it is will be wrong at the door.
    body.set("PARTY_SIZE", String(named ? 2 : 1));
    body.set("email_address_check", "");
    body.set("locale", "en");

    try {
      const reply = await fetch(form.action, {
        method: "POST",
        body,
        headers: { accept: "application/json" },
      });
      const result = (await reply.json()) as { success?: boolean };
      setStatus(result.success === true ? "sent" : "error");
    } catch {
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <p role="status" className="rsvp-done">
        {form.success}
      </p>
    );
  }

  const message = status === "error" ? form.error : status === "unset" ? form.notReady : "";

  return (
    <form onSubmit={handleSubmit} className="rsvp">
      <label className="rsvp-field">
        <span>{form.name}</span>
        <input
          type="text"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoComplete="name"
          data-autofocus
        />
      </label>

      <label className="rsvp-field">
        <span>{form.email}</span>
        <input
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </label>

      <div className="rsvp-field">
        <label className="rsvp-check">
          <input type="checkbox" checked={bringing} onChange={(e) => setBringing(e.target.checked)} />
          {form.guestToggle}
        </label>

        {/* Both of the guest's details appear together, because a name with
            no address is a person nobody can write to. */}
        {bringing && (
          <div className="rsvp-guest">
            <label>
              <span className="sr-only">{form.guestName}</span>
              <input
                type="text"
                name="guest"
                value={guest}
                onChange={(e) => setGuest(e.target.value)}
                placeholder={form.guestName}
                autoComplete="off"
                required
              />
            </label>
            <label>
              <span className="sr-only">{form.guestEmail}</span>
              <input
                type="email"
                name="guestEmail"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                placeholder={form.guestEmail}
                autoComplete="off"
                required
              />
            </label>
            {/* The guest has not agreed to anything. Whoever is typing
                their address is the one who has to be told what happens
                to it, and here is the only place to say so. */}
            <p className="rsvp-notice">{form.guestNotice}</p>
          </div>
        )}
      </div>

      {/* Honeypot: hidden from people, filled by bots. */}
      <label className="sr-only" aria-hidden="true">
        Company
        <input
          type="text"
          name="company"
          value={trap}
          onChange={(e) => setTrap(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
        />
      </label>

      <button type="submit" className="hero-cta rsvp-submit" disabled={status === "sending"}>
        {status === "sending" ? form.sending : form.submit}
      </button>

      <p role={status === "error" ? "alert" : "status"} className="rsvp-message">
        {message}
      </p>
    </form>
  );
}
