"use client";

import { FormEvent, useState } from "react";
import { signupContent } from "@/lib/content";

type Status = "idle" | "sending" | "sent" | "error";

// One field and a button. Posts to /api/subscribe, which adds the address
// to the Brevo list.
export default function SignupForm() {
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const { form } = signupContent;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, company }),
      });
      if (!response.ok) throw new Error(String(response.status));
      setStatus("sent");
      setEmail("");
    } catch {
      setStatus("error");
    }
  };

  return (
    <form onSubmit={handleSubmit} aria-label={form.label}>
      <div className="flex items-end gap-md">
        <label className="block grow">
          <span className="eyebrow block">{form.label}</span>
          <input
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder={form.placeholder}
          />
        </label>
        <button type="submit" className="cta shrink-0 pb-[0.3em]" disabled={status === "sending"}>
          {status === "sending" ? form.sending : form.submit}
        </button>
      </div>

      {/* Honeypot: hidden from people, filled by bots. */}
      <label className="sr-only" aria-hidden="true">
        Company
        <input
          type="text"
          name="company"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
        />
      </label>

      {status === "sent" && (
        <p role="status" className="mt-sm text-caption text-bone">
          {form.success}
        </p>
      )}
      {status === "error" && (
        <p role="alert" className="mt-sm text-caption text-bone">
          {form.error}
        </p>
      )}
    </form>
  );
}
