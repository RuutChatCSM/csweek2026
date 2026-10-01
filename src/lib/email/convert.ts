import "server-only";
import { saveOutboxEmail } from "../store";

/**
 * Email delivery through Convert by Ruut.
 *
 * Configure with:
 *   CONVERT_API_URL      e.g. https://api.<convert-host>/v1/emails/send
 *   CONVERT_API_KEY      API key (sent as a Bearer token)
 *   CONVERT_FROM_EMAIL   verified sender address, e.g. celebrate@ruut.chat
 *   CONVERT_FROM_NAME    defaults to "CS Week by Ruut"
 *
 * The request body below is a generic transactional-email shape. Adjust `buildPayload`
 * to match Convert's API contract once confirmed.
 *
 * Without CONVERT_API_KEY, emails are written to .data/outbox and can be previewed at
 * /dev/outbox/<cardId> (development only).
 */

export type OutgoingEmail = {
  id: string;
  to: { email: string; name: string };
  subject: string;
  html: string;
  text: string;
};

export type SendResult = { status: "sent" } | { status: "queued_dev" } | { status: "failed"; error: string };

export const convertConfigured = Boolean(process.env.CONVERT_API_KEY && process.env.CONVERT_API_URL);

function buildPayload(email: OutgoingEmail) {
  return {
    from: {
      email: process.env.CONVERT_FROM_EMAIL ?? "celebrate@ruut.chat",
      name: process.env.CONVERT_FROM_NAME ?? "CS Week by Ruut",
    },
    to: [email.to],
    subject: email.subject,
    html: email.html,
    text: email.text,
    tags: ["cs-week-2026", "celebration-card"],
    metadata: { cardId: email.id },
  };
}

export async function sendWithConvert(email: OutgoingEmail): Promise<SendResult> {
  if (!convertConfigured) {
    await saveOutboxEmail(email.id, { to: email.to.email, subject: email.subject, html: email.html });
    console.info(`[convert] CONVERT_API_KEY not set — email saved to outbox: /dev/outbox/${email.id}`);
    return { status: "queued_dev" };
  }

  try {
    const res = await fetch(process.env.CONVERT_API_URL!, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.CONVERT_API_KEY}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `csweek-${email.id}`,
      },
      body: JSON.stringify(buildPayload(email)),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error(`[convert] send failed ${res.status}: ${body.slice(0, 500)}`);
      return { status: "failed", error: `Convert responded ${res.status}` };
    }
    return { status: "sent" };
  } catch (err) {
    console.error("[convert] send error", err);
    return { status: "failed", error: "Could not reach Convert" };
  }
}
