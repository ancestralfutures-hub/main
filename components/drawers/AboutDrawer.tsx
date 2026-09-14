import ScrollLines from "@/components/ScrollLines";
import { aboutContent, footerContent } from "@/lib/content";

// What the Daré is: the paragraph, the two lines drifting across beneath
// it, and the copyright at the foot.
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
      <ScrollLines lines={aboutContent.statement} />
      <p className="text-muted">{footerContent.copyright}</p>
    </>
  );
}
