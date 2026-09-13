import Link from "next/link";

// Nothing here. Back to the door.
export default function NotFound() {
  return (
    <section className="section-full px-xs md:px-md">
      <p className="rule-line">Not here.</p>
      <p className="mt-lg">
        <Link href="/" className="cta">
          Back to the Daré
        </Link>
      </p>
    </section>
  );
}
