import Image from "next/image";
import ScrollLines from "@/components/ScrollLines";
import room from "@/assets/bgac-room.jpg";
import partnerLogo from "@/assets/bgac-logo.png";
import { aboutContent, footerContent } from "@/lib/content";

/*
  What the Daré is: the paragraphs, the room it happens in, the partner
  whose room it is, the two lines drifting across beneath, and the
  copyright at the foot.

  The photograph is the auditorium at Bernie Grant Arts Centre, from
  their own site, held back and feathered at its edges so it sits in the
  night like the hut does rather than as a bright rectangle on it. The
  logo is theirs as they publish it, green, and links to them.
*/
export default function AboutDrawer() {
  return (
    <>
      <h2 id="drawer-about-title" className="eyebrow">
        {aboutContent.title}
      </h2>
      {aboutContent.paragraphs.map((paragraph) => (
        <p key={paragraph} className="measure">
          {paragraph}
        </p>
      ))}
      <figure className="about-photo">
        <Image src={room} alt={aboutContent.photo.alt} sizes="(max-width: 600px) 100vw, 544px" />
        <figcaption>{aboutContent.photo.caption}</figcaption>
      </figure>
      <p className="partner">
        <span className="eyebrow">{aboutContent.partner.lede}</span>
        <a href={aboutContent.partner.url} target="_blank" rel="noopener noreferrer">
          <Image src={partnerLogo} alt={aboutContent.partner.name} />
        </a>
      </p>
      <ScrollLines lines={aboutContent.statement} />
      <p className="text-muted">{footerContent.copyright}</p>
    </>
  );
}
