import HeroSection from "@/components/sections/HeroSection";
import { eventContent, heroContent, siteConfig, ticketsContent } from "@/lib/content";
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
  can carry the dates, the venue and a way to buy without anyone opening
  the page. It is an ExhibitionEvent rather than a plain Event because that
  is what a week-long installation is, and it draws every value from
  content/home.json, so the words on the screen and the words in the markup
  cannot drift apart.

  No price: the tickets are Eventbrite's and this file does not know what
  they cost. Better to say nothing than to say a number that goes stale.
*/
const eventSchema = {
  "@context": "https://schema.org",
  "@type": "ExhibitionEvent",
  name: heroContent.title,
  alternateName: siteConfig.metaTitle,
  description: siteConfig.metaDescription,
  startDate: eventContent.startDate,
  endDate: eventContent.endDate,
  eventStatus: "https://schema.org/EventScheduled",
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  image: [absoluteUrl("/opengraph-image.png")],
  url: absoluteUrl("/"),
  location: {
    "@type": "Place",
    name: eventContent.venue,
    address: {
      "@type": "PostalAddress",
      streetAddress: eventContent.street,
      addressLocality: eventContent.city,
      addressCountry: eventContent.country,
    },
  },
  performer: { "@type": "Person", name: "Shumba Maasai" },
  organizer: { "@type": "Organization", name: siteConfig.name, url: absoluteUrl("/") },
  offers: {
    "@type": "Offer",
    url: ticketsContent.url,
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchema) }}
      />
      <HeroSection />
    </>
  );
}
