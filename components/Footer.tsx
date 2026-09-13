import { footerContent } from "@/lib/content";

/*
  Sits at the foot of the document rather than pinned to the viewport, so it
  never floats over a full-height screen. The presenting line first, spaced
  wide as the poster sets it, then one borderless row: copyright left, links
  right. Bottom padding clears the fixed navigation.
*/
export default function Footer() {
  return (
    <footer className="rule-top px-xs pt-lg pb-header md:px-md">
      <p className="eyebrow">{footerContent.presentedBy}</p>

      <div className="mt-lg grid h-header grid-cols-2 items-center text-caption text-dusk">
        <p>{footerContent.copyright}</p>
        <ul className="flex justify-end gap-md">
          {footerContent.socials.map((social: { name: string; url: string }) => (
            <li key={social.name}>
              <a href={social.url} target="_blank" rel="noopener noreferrer" className="link-sweep">
                {social.name}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
