import "server-only";
import { saveOutboxEmail } from "../store";

/**
 * Convert by Ruut — https://convert.ruut.chat/api/v1
 *
 *  - Celebration emails:   POST /messages                         (scope messages:write)
 *  - Contact list capture: POST /contact_lists/:id/contacts       (scope contacts:write)
 *
 * Configure in .env.local (never commit the key):
 *   CONVERT_API_KEY           rk_live_…  (Bearer token, organisation-scoped)
 *   CONVERT_API_BASE          defaults to https://convert.ruut.chat/api/v1
 *   CONVERT_CONTACT_LIST_ID   list every recipient is added to (e.g. 21)
 *   CONVERT_SENDER            optional active email sender; Convert's default sender otherwise
 *   CONVERT_TEST_MODE         "true" → messages are validated by Convert but not sent or charged
 *
 * Without CONVERT_API_KEY, emails are written to .data/outbox and can be previewed at
 * /dev/outbox/<cardId> (development only).
 */

const API_BASE = (process.env.CONVERT_API_BASE ?? "https://convert.ruut.chat/api/v1").replace(/\/$/, "");
const API_KEY = process.env.CONVERT_API_KEY;
const CONTACT_LIST_ID = process.env.CONVERT_CONTACT_LIST_ID;
const TEST_MODE = process.env.CONVERT_TEST_MODE === "true";

export const convertConfigured = Boolean(API_KEY);

export type OutgoingEmail = {
  id: string;
  to: { email: string; name: string };
  subject: string;
  html: string;
  text: string;
};

export type SendResult = { status: "sent" } | { status: "queued_dev" } | { status: "failed"; error: string };

type ConvertError = { success?: false; error?: string; error_code?: string };

async function convertFetch(path: string, init: { body: unknown; idempotencyKey?: string }) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
      ...(init.idempotencyKey ? { "Idempotency-Key": init.idempotencyKey } : {}),
    },
    body: JSON.stringify(init.body),
    cache: "no-store",
  });
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown> & ConvertError;
  return { res, json };
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Sends the celebration email. Network errors and 5xx are retried with backoff using the
 * same Idempotency-Key and identical body (per Convert's guidance); 4xx are not retried.
 * A message_id means Convert accepted it, not that it was delivered (see delivery webhooks).
 */
export async function sendWithConvert(email: OutgoingEmail): Promise<SendResult> {
  if (!convertConfigured) {
    await saveOutboxEmail(email.id, { to: email.to.email, subject: email.subject, html: email.html });
    console.info(`[convert] CONVERT_API_KEY not set — email saved to outbox: /dev/outbox/${email.id}`);
    return { status: "queued_dev" };
  }

  const body = {
    to: email.to.email,
    channel: "email",
    subject: email.subject,
    html: email.html,
    message: email.text,
    ...(process.env.CONVERT_SENDER ? { sender: process.env.CONVERT_SENDER } : {}),
    ...(TEST_MODE ? { test: true } : {}),
  };
  const idempotencyKey = `csweek26-card-${email.id}`;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const { res, json } = await convertFetch("/messages", { body, idempotencyKey });
      if (res.ok && json.success !== false) {
        console.info(`[convert] message accepted ${String(json.message_id ?? "")}${TEST_MODE ? " (test mode)" : ""}`);
        return { status: "sent" };
      }
      console.error(`[convert] message failed ${res.status} ${json.error_code ?? ""}: ${json.error ?? ""}`);
      if (res.status < 500) return { status: "failed", error: json.error_code ?? `HTTP ${res.status}` };
    } catch (err) {
      console.error("[convert] message network error", err);
    }
    await sleep(400 * 2 ** attempt);
  }
  return { status: "failed", error: "Could not reach Convert" };
}

export type ContactRecord = {
  email: string;
  firstName: string;
  lastName?: string;
  businessName?: string;
};

/**
 * Adds a person to the CS Week contact list (CONVERT_CONTACT_LIST_ID). Convert creates or
 * enriches the contact by normalised email, so repeat celebrations don't duplicate people.
 * Never throws: list capture must not block the celebration itself.
 */
export async function addToContactList(contact: ContactRecord): Promise<boolean> {
  if (!convertConfigured || !CONTACT_LIST_ID) return false;
  const body = {
    email: contact.email,
    first_name: contact.firstName,
    ...(contact.lastName ? { last_name: contact.lastName } : {}),
    ...(contact.businessName ? { custom_fields: { business_name: contact.businessName } } : {}),
  };
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const { res, json } = await convertFetch(`/contact_lists/${encodeURIComponent(CONTACT_LIST_ID)}/contacts`, { body });
      if (res.ok && json.success !== false) return true;
      console.error(`[convert] contact list add failed ${res.status} ${json.error_code ?? ""}: ${json.error ?? ""}`);
      if (res.status < 500) return false;
    } catch (err) {
      console.error("[convert] contact list network error", err);
    }
    await sleep(400 * 2 ** attempt);
  }
  return false;
}
