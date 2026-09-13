/*
  The one place the site talks to Brevo. The sign-up route adds an address
  to the list and nothing else.

  Needs, in the environment:
    BREVO_API_KEY   an API key from Brevo, SMTP & API > API keys
    BREVO_LIST_ID   the list new sign-ups join
*/

export const BREVO = "https://api.brevo.com/v3";

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const brevoHeaders = (apiKey: string) => ({
  "api-key": apiKey,
  "content-type": "application/json",
  accept: "application/json",
});

/** The configured list id, or null when signing up is not set up yet. */
export const brevoListId = () => {
  const id = Number(process.env.BREVO_LIST_ID);
  return Number.isInteger(id) && id > 0 ? id : null;
};

/**
  Adds an address to the list, creating the contact or updating one that
  already exists. Returns false when Brevo refuses.
*/
export async function addToList(apiKey: string, listId: number, email: string): Promise<boolean> {
  const response = await fetch(`${BREVO}/contacts`, {
    method: "POST",
    headers: brevoHeaders(apiKey),
    body: JSON.stringify({ email, listIds: [listId], updateEnabled: true }),
  }).catch((error: unknown) => {
    console.error("Brevo contact failed", error);
    return null;
  });

  if (!response) return false;
  if (!response.ok) {
    console.error("Brevo contact refused", response.status, await response.text().catch(() => ""));
    return false;
  }
  return true;
}
