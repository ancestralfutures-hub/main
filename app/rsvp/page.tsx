import type { Metadata } from "next";
import RsvpForm from "@/components/RsvpForm";
import { rsvpContent } from "@/lib/content";

/*
  The launch RSVP, for the people the invitation goes to by name.

  Reachable but not indexed and not in the navigation: it is a private
  party on a public site, so the address is given out rather than found.
  It scrolls, unlike the opening screen, because a form with a guest on it
  will not fit a phone otherwise.
*/
export const metadata: Metadata = {
  title: "RSVP · The launch of Daré",
  robots: { index: false, follow: false },
  alternates: { canonical: "/rsvp" },
};

export default function RsvpPage() {
  return (
    <section className="rsvp-page">
      <h1 className="eyebrow rsvp-invite">{rsvpContent.lede}</h1>

      <div className="rsvp-when">
        <p className="eyebrow">{rsvpContent.when}</p>
        <p className="eyebrow">{rsvpContent.where}</p>
      </div>

      <RsvpForm />
    </section>
  );
}
