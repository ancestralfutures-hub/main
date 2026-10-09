/*
  Sends Shumba's note back to each new RSVP, with Shumba copied in.

  Brevo's form can send a confirmation itself, but it cannot copy anyone
  on it, and a copy to Shumba on every one is the ask. So this sends the
  note instead: it reads the Launch RSVP list, and for every reply nobody
  has answered yet it sends the confirmation template to the guest with
  Shumba in cc, then writes the time onto the contact's NOTIFIED
  attribute. That attribute is the whole memory. There is no state file
  and nothing to lose between runs, and a reply is answered exactly once
  however many times this runs or on how many machines.

  The template is Brevo transactional template 8, whose source is
  assets/emails/rsvp-confirmation.html. Its {{ contact.NAME }} and
  {{ contact.GUEST }} are filled from the guest's own contact record.

  Run by .github/workflows/rsvp-notify.yml every ten minutes, and by hand
  with BREVO_API_KEY in the environment. NOTIFY_CC overrides who is
  copied, for trying it out without writing to Shumba.
*/

const KEY = process.env.BREVO_API_KEY;
if (!KEY) {
  console.error("BREVO_API_KEY is not set");
  process.exit(1);
}

const LIST = 4; // Launch RSVP
const TEMPLATE = 8; // RSVP confirmation: See you on the 15th
// Shumba and Valentine both see every reply. NOTIFY_CC, comma separated,
// replaces the whole list.
const CC = (process.env.NOTIFY_CC || "shumba@ancestralfutures.co.uk,valentineeluwasi@pavilionofzimbabwe.com")
  .split(",")
  .map((e) => e.trim())
  .filter(Boolean);
const API = "https://api.brevo.com/v3";

async function brevo(path, init = {}) {
  const res = await fetch(API + path, {
    ...init,
    headers: {
      "api-key": KEY,
      accept: "application/json",
      ...(init.body ? { "content-type": "application/json" } : {}),
      ...(init.headers || {}),
    },
  });
  if (!res.ok && res.status !== 204) {
    throw new Error(`${init.method || "GET"} ${path} -> ${res.status} ${await res.text()}`);
  }
  return res.status === 204 ? null : res.json();
}

// The whole list, a page at a time. It will never be long, but a loop
// costs nothing and a cap of 500 would be a silent one.
async function everyone() {
  const out = [];
  for (let offset = 0; ; offset += 500) {
    const page = await brevo(`/contacts/lists/${LIST}/contacts?limit=500&offset=${offset}`);
    out.push(...page.contacts);
    if (out.length >= page.count || page.contacts.length === 0) break;
  }
  return out;
}

// The note, to the guest, with Shumba copied. Sender, subject and
// reply-to all come from the template, so the words live in one place.
function message(c) {
  const a = c.attributes || {};
  return {
    templateId: TEMPLATE,
    to: [{ email: c.email, ...(a.NAME ? { name: a.NAME } : {}) }],
    cc: CC.map((email) => ({ email })),
    tags: ["rsvp-confirmation"],
  };
}

const all = await everyone();
const fresh = all.filter((c) => !(c.attributes && c.attributes.NOTIFIED));
console.log(`${all.length} on the list, ${fresh.length} unanswered`);

for (const c of fresh) {
  await brevo("/smtp/email", { method: "POST", body: JSON.stringify(message(c)) });
  // Written only after the send has been accepted, so a failure sends
  // again next time rather than losing the reply.
  await brevo(`/contacts/${encodeURIComponent(c.email)}`, {
    method: "PUT",
    body: JSON.stringify({ attributes: { NOTIFIED: new Date().toISOString() } }),
  });
  console.log(`answered ${c.email}, copied ${CC.join(", ")}`);
}
