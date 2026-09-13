import Link from "next/link";
import { siteConfig } from "@/lib/content";

// The name, pinned top left, set in small spaced capitals until artwork
// is supplied. Links back to the top of the page.
export default function Wordmark() {
  return (
    <Link href="/#top" aria-label={siteConfig.name} className="wordmark">
      {siteConfig.name}
    </Link>
  );
}
