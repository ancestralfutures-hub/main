import SignupForm from "@/components/SignupForm";
import { signupContent } from "@/lib/content";

// The way to hear first. A heading in one column, the invitation and the
// one-field form across the next two, with air above and below.
export default function SignupSection() {
  return (
    <section id="signup" aria-labelledby="signup-heading" className="section section-band rule-top px-xs md:px-md">
      <div data-reveal className="grid gap-md md:grid-cols-4">
        <h2 id="signup-heading">{signupContent.title}</h2>
        <div className="md:col-span-2 max-w-[52ch]">
          <p>{signupContent.lede}</p>
          <div className="mt-lg">
            <SignupForm />
          </div>
        </div>
      </div>
    </section>
  );
}
