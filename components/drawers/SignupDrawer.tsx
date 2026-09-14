import SignupForm from "@/components/SignupForm";
import { signupContent } from "@/lib/content";

// The way to hear first: a line saying what for, and the form.
export default function SignupDrawer() {
  return (
    <>
      <h2 id="drawer-signup-title" className="eyebrow">
        {signupContent.title}
      </h2>
      <p className="measure">{signupContent.lede}</p>
      <SignupForm />
    </>
  );
}
