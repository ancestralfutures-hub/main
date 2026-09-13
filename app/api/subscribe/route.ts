import { NextResponse } from "next/server";
import { EMAIL_PATTERN, addToList, brevoListId } from "@/lib/brevo";

/*
  The sign-up form posts here. The address is added to the Brevo list and
  nothing else happens. Until BREVO_API_KEY and BREVO_LIST_ID are set the
  form reports that it is not ready.
*/

interface Payload {
  email?: string;
  /** Honeypot. Real people never fill it. */
  company?: string;
}

export async function POST(request: Request) {
  const apiKey = process.env.BREVO_API_KEY;
  const listId = brevoListId();
  if (!apiKey || !listId) {
    return NextResponse.json({ error: "Sign-up is not set up yet." }, { status: 503 });
  }

  let body: Payload;
  try {
    body = (await request.json()) as Payload;
  } catch {
    return NextResponse.json({ error: "Could not read the address." }, { status: 400 });
  }

  // A filled honeypot is a bot. Say it went fine and do nothing.
  if (body.company) return NextResponse.json({ ok: true });

  const email = (body.email ?? "").trim().slice(0, 200);
  if (!EMAIL_PATTERN.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email." }, { status: 400 });
  }

  const added = await addToList(apiKey, listId, email);
  if (!added) {
    return NextResponse.json({ error: "That did not go through." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
