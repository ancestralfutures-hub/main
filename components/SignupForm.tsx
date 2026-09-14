"use client";

import { type SubmitEvent, useState } from "react";
import { signupContent } from "@/lib/content";

type Status = "idle" | "sending" | "sent" | "error" | "unset";

/*
  One field joined to one button, posting straight to a sign-up form hosted
  by Brevo, which adds the address to the "subscribers" list. The site is
  static files on GitHub Pages, so there is no server of its own to hold an
  API key, and a key must never be sent to the browser. Brevo's hosted form
  needs no key: it is public by design and only ever adds an address to the
  list it was made for.

  The form's address lives in content/home.json as signup.form.action.
  Until it is set, submitting says sign-up is opening soon.

  The request is sent once, with mode "no-cors". Brevo's reply cannot be
  read across origins, so success is taken as the request going out; what
  the browser does report, a dropped connection, shows as an error. Sending
  it once, rather than retrying when the reply is unreadable, means nobody
  is ever sent two confirmation emails.
*/
export default function SignupForm() {
  const [email, setEmail] = useState("");
  const [trap, setTrap] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const { form } = signupContent;

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
      setEmail("");
      return;
    }

    setStatus("sending");
    const body = new FormData();
    // The field names Brevo's hosted form expects.
    body.set("EMAIL", email);
    body.set("email_address_check", "");
    body.set("locale", "en");
    try {
      await fetch(form.action, { method: "POST", body, mode: "no-cors" });
      setStatus("sent");
      setEmail("");
    } catch {
      setStatus("error");
    }
  };

  const message =
    status === "sent" ? form.success : status === "error" ? form.error : status === "unset" ? form.notReady : "";

  return (
    <form onSubmit={handleSubmit} className="signup">
      <div className="signup-row">
        <label htmlFor="signup-email" className="sr-only">
          {form.label}
        </label>
        <input
          id="signup-email"
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          placeholder={form.placeholder}
          className="signup-input"
          data-autofocus
        />
        <button type="submit" className="signup-button" disabled={status === "sending"}>
          {status === "sending" ? form.sending : form.submit}
        </button>
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

      <p role={status === "error" ? "alert" : "status"} className="min-h-[1.5em]">
        {message}
      </p>
    </form>
  );
}
