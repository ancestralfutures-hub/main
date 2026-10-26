import HeroSection from "@/components/sections/HeroSection";
import { liveContent, siteConfig } from "@/lib/content";
import { absoluteUrl } from "@/lib/site-url";

/*
  One screen, held still: the logo and the hut, where and when, the way to
  book, and the credits along the bottom. About and Sign up open over it as
  full-screen drawers, from app/layout.tsx.

  The artist and the three rules are built and waiting in
  components/sections (ArtistSection, RulesSection), with their words still
  in content/home.json.
*/

/*
  The same facts again, in the form a search engine reads, so that a result
  can carry the date, the venue and a way to buy without anyone opening the
  page. A TheaterEvent, since that is what a night on a stage is, drawn
  from content/home.json so the words on the screen and the words in the
  markup cannot drift apart. The installation that ran before it is over
  and is not described here: a past event in the markup only invites a
  search engine to show the wrong one.

  No price: the tickets are Eventbrite's and this file does not know what
  they cost. Better to say nothing than to say a number that goes stale.
*/
const liveSchema = {
  "@context": "https://schema.org",
  "@type": "TheaterEvent",
  name: liveContent.name,
  description: siteConfig.metaDescription,
  startDate: liveContent.startDate,
  endDate: liveContent.endDate,
  eventStatus: "https://schema.org/EventScheduled",
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  image: [absoluteUrl("/opengraph-image.png")],
  url: liveContent.url,
  location: {
    "@type": "Place",
    name: liveContent.venue,
    address: {
      "@type": "PostalAddress",
      streetAddress: liveContent.street,
      addressLocality: liveContent.city,
      postalCode: liveContent.postcode,
      addressCountry: liveContent.country,
    },
  },
  performer: { "@type": "Person", name: "Shumba Maasai" },
  organizer: { "@type": "Organization", name: siteConfig.name, url: absoluteUrl("/") },
  offers: {
    "@type": "Offer",
    url: liveContent.url,
    availability: "https://schema.org/InStock",
  },
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        // The object above is ours, built from our own content files, so
        // there is nothing here that could have come from a visitor.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(liveSchema) }}
      />
      <HeroSection />
    </>
  );
}
