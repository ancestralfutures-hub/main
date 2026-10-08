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
  silently, which is what happens if a form posts into nothing.

  Sent once, with mode "no-cors". Brevo's reply cannot be read across
  origins, so success is taken as the request going out. Sending it once
  rather than retrying on an unreadable reply means nobody is ever counted
  twice on a guest list.
*/
export default function RsvpForm() {
  const { form } = rsvpContent;
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [coming, setComing] = useState<"yes" | "no">("yes");
  const [bringing, setBringing] = useState(false);
  const [guest, setGuest] = useState("");
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
    const body = new FormData();
    body.set("EMAIL", email);
    body.set("NAME", name.trim());
    body.set("ATTENDING", coming === "yes" ? "Yes" : "No");
    // Only a named guest counts. A ticked box with nothing in it is not a
    // person, and a guest list that thinks it is will be wrong at the door.
    const named = bringing && coming === "yes" ? guest.trim() : "";
    body.set("GUEST", named);
    body.set("PARTY_SIZE", coming === "yes" ? String(named ? 2 : 1) : "0");
    body.set("email_address_check", "");
    body.set("locale", "en");

    try {
      await fetch(form.action, { method: "POST", body, mode: "no-cors" });
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <p role="status" className="rsvp-done">
        {coming === "yes" ? form.success : form.successNo}
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

      <fieldset className="rsvp-field">
        <legend>{form.coming}</legend>
        <div className="rsvp-choice">
          {(["yes", "no"] as const).map((value) => (
            <label key={value} data-on={coming === value || undefined}>
              <input
                type="radio"
                name="coming"
                value={value}
                checked={coming === value}
                onChange={() => setComing(value)}
              />
              {value === "yes" ? form.yes : form.no}
            </label>
          ))}
        </div>
      </fieldset>

      {/* The guest only exists for someone who is coming. */}
      {coming === "yes" && (
        <div className="rsvp-field">
          <label className="rsvp-check">
            <input type="checkbox" checked={bringing} onChange={(e) => setBringing(e.target.checked)} />
            {form.guestToggle}
          </label>
          {bringing && (
            <label className="rsvp-guest">
              <span className="sr-only">{form.guestName}</span>
              <input
                type="text"
                name="guest"
                value={guest}
                onChange={(e) => setGuest(e.target.value)}
                placeholder={form.guestName}
                autoComplete="off"
              />
            </label>
          )}
        </div>
      )}

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
