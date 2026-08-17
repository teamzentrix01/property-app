import nodemailer from "nodemailer";

let transporter;

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
}

function getTransporter() {
  if (transporter) return transporter;
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) throw new Error("SMTP is not configured");
  transporter = nodemailer.createTransport({ host: SMTP_HOST, port: Number(SMTP_PORT), secure: Number(SMTP_PORT) === 465, auth: { user: SMTP_USER, pass: SMTP_PASS } });
  return transporter;
}

export async function sendEmail({ to, subject, heading, message, action }) {
  if (!to) return;
  const safeHeading = escapeHtml(heading);
  const safeMessage = escapeHtml(message);
  const actionHtml = action ? `<p><a href="${escapeHtml(action.url)}" style="display:inline-block;background:#1c5740;color:#fffdf8;padding:12px 18px;border-radius:999px;text-decoration:none">${escapeHtml(action.label)}</a></p>` : "";
  await getTransporter().sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    text: `${heading}\n\n${message}${action ? `\n\n${action.label}: ${action.url}` : ""}`,
    html: `<main style="max-width:560px;margin:auto;padding:32px;font-family:Arial,sans-serif;color:#16302b;background:#f5f0e6"><h1 style="margin:0 0 16px">${safeHeading}</h1><p style="line-height:1.6">${safeMessage}</p>${actionHtml}<p style="margin-top:28px;color:#64736d;font-size:13px">Bhoomi · Property made simpler</p></main>`,
  });
}

export function notifyEmail(payload) {
  sendEmail(payload).catch((error) => console.error("Email notification failed", error));
}
