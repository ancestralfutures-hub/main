import { artistContent } from "@/lib/content";

// The artist. The same grid as the screen before it.
export default function ArtistSection() {
  return (
    <section id="artist" aria-labelledby="artist-heading" className="section-full px-xs md:px-md">
      <div data-reveal className="grid gap-md md:grid-cols-4">
        <h2 id="artist-heading">{artistContent.title}</h2>
        <div className="md:col-span-2 max-w-[52ch]">
          <p className="eyebrow">{artistContent.name}</p>
          <p className="mt-md">{artistContent.bio}</p>
        </div>
      </div>
    </section>
  );
}
