import nodemailer from "nodemailer";

let transporter;

function escapeHtml(value) {
  return String(value).replace(
    /[&<>'"]/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;",
      }[character])
  );
}

function senderAddress() {
  const raw = process.env.SMTP_FROM || process.env.SMTP_USER || "bhoomiproperty7@gmail.com";
  const cleaned = raw.replace(/^["']|["']$/g, "").trim();
  const bracketed = cleaned.match(/<([^>]+)>/);
  return bracketed ? bracketed[1].trim() : cleaned;
}

export function getTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    throw new Error("SMTP is not configured in .env");
  }

  const cleanUser = SMTP_USER.replace(/^["']|["']$/g, "").trim();
  const cleanPass = SMTP_PASS.replace(/^["']|["']$/g, "").trim();
  const cleanHost = SMTP_HOST.replace(/^["']|["']$/g, "").trim();
  const portNum = Number(SMTP_PORT);

  // Return existing transporter if alive
  if (transporter) return transporter;

  const isGmail = cleanHost.includes("gmail") || cleanUser.includes("gmail.com");

  transporter = nodemailer.createTransport({
    service: isGmail ? "gmail" : undefined,
    host: isGmail ? undefined : cleanHost,
    port: isGmail ? undefined : portNum,
    secure: portNum === 465,
    auth: {
      user: cleanUser,
      pass: cleanPass,
    },
    tls: {
      rejectUnauthorized: false,
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
  });

  return transporter;
}

export async function sendEmail({ to, subject, heading, message, action }) {
  if (!to) {
    console.warn("sendEmail: No recipient (to) specified, skipping.");
    return { skipped: true, error: "Recipient email is missing" };
  }

  const safeHeading = escapeHtml(heading);
  const formattedMessage = escapeHtml(message).replace(/\n/g, "<br/>");
  const actionHtml = action
    ? `<p style="margin-top:24px"><a href="${escapeHtml(
        action.url
      )}" style="display:inline-block;background:#c41920;color:#ffffff;padding:12px 24px;border-radius:12px;text-decoration:none;font-weight:bold;font-size:14px;box-shadow:0 4px 12px rgba(196,25,32,0.25)">${escapeHtml(
        action.label
      )}</a></p>`
    : "";

  const fromEmail = senderAddress();

  try {
    const t = getTransporter();
    const info = await t.sendMail({
      from: { name: "Bhoomi Real Estate", address: fromEmail },
      to,
      subject,
      text: `${heading}\n\n${message}${
        action ? `\n\n${action.label}: ${action.url}` : ""
      }`,
      html: `
        <main style="max-width:560px;margin:auto;padding:32px;font-family:Arial,sans-serif;color:#180e0f;background:#fff9f9;border:1px solid #fecdd3;border-radius:20px">
          <div style="display:inline-block;background:#c41920;color:#ffffff;font-size:18px;font-weight:bold;padding:8px 14px;border-radius:10px;margin-bottom:16px">₹ BHOOMI</div>
          <h1 style="margin:0 0 16px;color:#8e1016;font-size:22px">${safeHeading}</h1>
          <div style="line-height:1.6;font-size:14px;color:#374151">${formattedMessage}</div>
          ${actionHtml}
          <div style="margin-top:32px;padding-top:16px;border-top:1px solid #fecdd3;color:#9ca3af;font-size:12px">
            Bhoomi Real Estate · Verified Properties Across India
          </div>
        </main>
      `,
    });

    console.log(`Email sent successfully to ${to} (Message ID: ${info.messageId})`);
    return { ok: true, messageId: info.messageId };
  } catch (error) {
    console.error(`Email delivery failed to ${to}:`, error?.message || error);
    // Invalidate cached transporter on failure so next attempt gets a fresh connection
    transporter = null;
    return { ok: false, error: error?.message || "Email delivery failed" };
  }
}

export async function notifyEmail(payload) {
  try {
    return await sendEmail(payload);
  } catch (error) {
    console.error("notifyEmail caught error:", error);
    return { ok: false, error: error?.message };
  }
}
