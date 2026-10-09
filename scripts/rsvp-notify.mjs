/*
  Tells Shumba about each new RSVP.

  Brevo can only do this itself through an automation, and automations
  cannot be made over the API, so this runs instead: it reads the Launch
  RSVP list, and for every reply nobody has been told about yet it sends
  one email and then writes the time onto the contact's NOTIFIED
  attribute. That attribute is the whole memory. There is no state file
  and nothing to lose between runs, and a reply is told about exactly
  once however many times this runs or on how many machines.

  Run by .github/workflows/rsvp-notify.yml every ten minutes, and by hand
  with BREVO_API_KEY in the environment. NOTIFY_TO overrides who is told,
  for trying it out without writing to Shumba.
*/

const KEY = process.env.BREVO_API_KEY;
if (!KEY) {
  console.error("BREVO_API_KEY is not set");
  process.exit(1);
}

const LIST = 4; // Launch RSVP
const TO = process.env.NOTIFY_TO || "shumba@ancestralfutures.co.uk";
const FROM = { name: "Ancestral Futures", email: "hello@ancestralfutures.co.uk" };
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

const esc = (s) =>
  String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

function message(c) {
  const a = c.attributes || {};
  const name = a.NAME || c.email;
  const guest = a.GUEST ? ` and ${a.GUEST}` : "";
  const party = Number(a.PARTY_SIZE) || (a.GUEST ? 2 : 1);
  const when = new Date(c.modifiedAt || Date.now()).toLocaleString("en-GB", {
    timeZone: "Europe/London",
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  const rows = [
    ["Name", name],
    ["Email", c.email],
    ...(a.GUEST ? [["Guest", a.GUEST], ["Guest email", a.GUEST_EMAIL || ""]] : []),
    ["Party", String(party)],
    ["Replied", when],
  ];

  const text = `${name}${guest} ${party === 1 ? "is" : "are"} coming to the launch.\n\n` +
    rows.map(([k, v]) => `${k}: ${v}`).join("\n") +
    `\n\nThe full list: https://app.brevo.com/contact/list/id/${LIST}\n`;

  const html = `<!doctype html><html><body style="margin:0;padding:32px 24px;background:#0b0d0c;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;color:#f9f5cd;">
<p style="margin:0 0 24px 0;font-size:20px;line-height:28px;">${esc(name)}${esc(guest)} ${party === 1 ? "is" : "are"} coming to the launch.</p>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="font-size:15px;line-height:24px;">
${rows.map(([k, v]) => `<tr><td style="padding:0 24px 6px 0;color:#908f78;">${esc(k)}</td><td style="padding:0 0 6px 0;color:#f9f5cd;">${esc(v)}</td></tr>`).join("\n")}
</table>
<p style="margin:28px 0 0 0;font-size:13px;line-height:20px;color:#908f78;">The full list: <a href="https://app.brevo.com/contact/list/id/${LIST}" style="color:#f43e00;">Launch RSVP in Brevo</a></p>
</body></html>`;

  return {
    sender: FROM,
    to: [{ email: TO, name: "Shumba Maasai" }],
    replyTo: { email: c.email, name },
    subject: `RSVP: ${name}${guest}`,
    textContent: text,
    htmlContent: html,
    tags: ["rsvp-notify"],
  };
}

const all = await everyone();
const fresh = all.filter((c) => !(c.attributes && c.attributes.NOTIFIED));
console.log(`${all.length} on the list, ${fresh.length} new`);

for (const c of fresh) {
  await brevo("/smtp/email", { method: "POST", body: JSON.stringify(message(c)) });
  // Written only after the send has been accepted, so a failure sends
  // again next time rather than losing the reply.
  await brevo(`/contacts/${encodeURIComponent(c.email)}`, {
    method: "PUT",
    body: JSON.stringify({ attributes: { NOTIFIED: new Date().toISOString() } }),
  });
  console.log(`told ${TO} about ${c.email}`);
}
