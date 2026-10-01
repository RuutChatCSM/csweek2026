import { getTheme } from "../themes";
import { CS_WEEK, type StoredCard } from "../types";

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export function celebrationEmail({
  card,
  recipientFirstName,
  siteUrl,
}: {
  card: StoredCard;
  recipientFirstName: string;
  siteUrl: string;
}) {
  const theme = getTheme(card.theme);
  const from = card.senderName.trim();
  const cardUrl = `${siteUrl}/c/${card.id}?via=email`;
  const imageUrl = `${siteUrl}/api/cards/${card.id}/image`;
  const downloadUrl = `${siteUrl}/api/cards/${card.id}/image?download=1`;
  const celebrateUrl = `${siteUrl}/create?ref=email&from=${card.id}`;
  const first = esc(recipientFirstName.trim());

  const subject = from
    ? `${from} is celebrating you this Customer Service Week 🎉`
    : `${recipientFirstName.trim()}, someone is celebrating you this Customer Service Week 🎉`;

  const preheader = from
    ? `${from} made you a CS Week card: “${card.message.slice(0, 80)}${card.message.length > 80 ? "…" : ""}”`
    : `You've been celebrated for going the extra mile.`;

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<title>${esc(subject)}</title>
</head>
<body style="margin:0;padding:0;background:#F4F1EA;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F4F1EA;">
  <tr><td align="center" style="padding:32px 16px;">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;font-family:Figtree,'Helvetica Neue',Arial,sans-serif;color:#16161A;">
      <tr><td style="padding:0 8px 20px;font-size:13px;letter-spacing:2px;text-transform:uppercase;font-weight:700;">
        Customer Service Week ${CS_WEEK.year} &nbsp;·&nbsp; ${CS_WEEK.theme}
      </td></tr>
      <tr><td style="background:${theme.bg};border-radius:28px;padding:40px 36px 36px;color:${theme.ink};">
        <p style="margin:0 0 6px;font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:22px;opacity:.8;">Hey ${first},</p>
        <h1 style="margin:0 0 18px;font-size:38px;line-height:1.05;font-weight:800;letter-spacing:-1px;">
          ${from ? `${esc(from)} is celebrating you.` : "Someone is celebrating you."}
        </h1>
        <p style="margin:0;font-size:17px;line-height:1.5;">
          For Customer Service Week ${CS_WEEK.year}, ${from ? esc(from) : "a colleague"} made you a card to say thank you for going <strong>the extra mile</strong> for customers.
        </p>
      </td></tr>
      <tr><td style="padding:28px 8px 0;">
        <a href="${cardUrl}" style="display:block;text-decoration:none;">
          <img src="${imageUrl}" width="584" alt="Your CS Week ${CS_WEEK.year} celebration card" style="display:block;width:100%;max-width:584px;height:auto;border-radius:22px;border:0;">
        </a>
      </td></tr>
      <tr><td style="padding:24px 8px 0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border-radius:24px;">
          <tr><td style="padding:28px 30px;">
            <p style="margin:0;font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:21px;line-height:1.4;color:#16161A;">“${esc(card.message)}”</p>
            ${from ? `<p style="margin:12px 0 0;font-size:14px;font-weight:700;">— ${esc(from)}</p>` : ""}
            <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:24px;">
              <tr>
                <td style="border-radius:999px;background:#16161A;">
                  <a href="${cardUrl}" style="display:inline-block;padding:14px 24px;font-size:15px;font-weight:700;color:#FFFFFF;text-decoration:none;">View your card</a>
                </td>
                <td style="width:10px;"></td>
                <td style="border-radius:999px;border:2px solid #16161A;">
                  <a href="${downloadUrl}" style="display:inline-block;padding:12px 22px;font-size:15px;font-weight:700;color:#16161A;text-decoration:none;">Download</a>
                </td>
              </tr>
            </table>
          </td></tr>
        </table>
      </td></tr>
      <tr><td style="padding:32px 8px 8px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#16161A;border-radius:24px;">
          <tr><td style="padding:30px 32px;color:#FFFFFF;">
            <p style="margin:0 0 6px;font-size:22px;font-weight:800;line-height:1.2;">Someone celebrated you.</p>
            <p style="margin:0 0 20px;font-size:16px;line-height:1.5;color:rgba(255,255,255,.75);">Now celebrate someone who makes customer experiences better.</p>
            <a href="${celebrateUrl}" style="display:inline-block;padding:14px 24px;border-radius:999px;background:#FFC629;color:#16161A;font-size:15px;font-weight:800;text-decoration:none;">Celebrate someone →</a>
          </td></tr>
        </table>
      </td></tr>
      <tr><td style="padding:24px 8px;font-size:12px;line-height:1.6;color:rgba(22,22,26,.6);">
        A <strong>Ruut × Customer Support Hub</strong> celebration of the people behind great customer experiences.<br>
        Delivered with <strong>Convert by Ruut</strong>. You received this because ${from ? esc(from) : "someone"} entered your email to send you this card. We won't email you again.
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;

  const text = [
    `Hey ${recipientFirstName.trim()},`,
    "",
    from ? `${from} is celebrating you this Customer Service Week.` : "Someone is celebrating you this Customer Service Week.",
    "",
    `"${card.message}"`,
    "",
    `View your card: ${cardUrl}`,
    `Download it: ${downloadUrl}`,
    "",
    "Someone celebrated you. Now celebrate someone who makes customer experiences better:",
    celebrateUrl,
    "",
    "Ruut × Customer Support Hub · Delivered with Convert by Ruut",
  ].join("\n");

  return { subject, html, text };
}
