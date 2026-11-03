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

/**
 * Sends a notification email to the admin whenever a new user signs up.
 * @param {{ user: object, userCount: number, origin: string }} params
 */
export async function sendAdminNewUserNotification({ user, userCount, origin }) {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) {
    console.warn("ADMIN_EMAIL not set – skipping admin new-user notification.");
    return { skipped: true };
  }

  const ordinal = (n) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  const roleLabel = { BUYER: "Buyer", OWNER: "Owner", BROKER: "Broker" }[user.role] || user.role;

  try {
    const t = getTransporter();
    const fromEmail = senderAddress();
    const info = await t.sendMail({
      from: { name: "Bhoomi Real Estate", address: fromEmail },
      to: adminEmail,
      subject: `🎉 New User #${userCount} Registered – ${user.name}`,
      text: `New user registration!\n\nUser #${userCount}\nName: ${user.name}\nEmail: ${user.email}\nPhone: ${user.phone}\nRole: ${roleLabel}\n\nView in admin panel: ${origin}/admin/users`,
      html: `
        <main style="max-width:560px;margin:auto;padding:32px;font-family:Arial,sans-serif;color:#180e0f;background:#fff9f9;border:1px solid #fecdd3;border-radius:20px">
          <div style="display:inline-block;background:#c41920;color:#ffffff;font-size:18px;font-weight:bold;padding:8px 14px;border-radius:10px;margin-bottom:16px">₹ BHOOMI</div>
          <h1 style="margin:0 0 8px;color:#8e1016;font-size:22px">🎉 New User Registered!</h1>
          <p style="margin:0 0 24px;color:#6b7280;font-size:14px">A new user just created an account on Bhoomi.</p>

          <div style="background:#ffffff;border:1px solid #fecdd3;border-radius:14px;padding:20px;margin-bottom:24px">
            <div style="display:flex;align-items:center;gap:16px;margin-bottom:16px">
              <div style="width:56px;height:56px;background:linear-gradient(135deg,#c41920,#8e1016);border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-size:22px;font-weight:bold;flex-shrink:0">
                ${escapeHtml(user.name?.charAt(0)?.toUpperCase() || "U")}
              </div>
              <div>
                <div style="font-size:18px;font-weight:bold;color:#180e0f">${escapeHtml(user.name)}</div>
                <div style="font-size:12px;color:#6b7280;margin-top:2px">${roleLabel}</div>
              </div>
            </div>

            <table style="width:100%;border-collapse:collapse;font-size:14px">
              <tr>
                <td style="padding:8px 0;color:#6b7280;width:90px">Email</td>
                <td style="padding:8px 0;color:#180e0f;font-weight:500">${escapeHtml(user.email)}</td>
              </tr>
              <tr style="border-top:1px solid #fef2f2">
                <td style="padding:8px 0;color:#6b7280">Phone</td>
                <td style="padding:8px 0;color:#180e0f;font-weight:500">${escapeHtml(user.phone || "—")}</td>
              </tr>
              <tr style="border-top:1px solid #fef2f2">
                <td style="padding:8px 0;color:#6b7280">Role</td>
                <td style="padding:8px 0;color:#180e0f;font-weight:500">${roleLabel}</td>
              </tr>
              <tr style="border-top:1px solid #fef2f2">
                <td style="padding:8px 0;color:#6b7280">User No.</td>
                <td style="padding:8px 0">
                  <span style="background:#c41920;color:#fff;font-weight:bold;font-size:13px;padding:3px 10px;border-radius:20px"># ${userCount}</span>
                  <span style="color:#6b7280;font-size:12px;margin-left:8px">${ordinal(userCount)} registered user</span>
                </td>
              </tr>
            </table>
          </div>

          <p style="margin-top:24px">
            <a href="${escapeHtml(origin)}/admin/users" style="display:inline-block;background:#c41920;color:#ffffff;padding:12px 24px;border-radius:12px;text-decoration:none;font-weight:bold;font-size:14px;box-shadow:0 4px 12px rgba(196,25,32,0.25)">
              View in Admin Panel →
            </a>
          </p>

          <div style="margin-top:32px;padding-top:16px;border-top:1px solid #fecdd3;color:#9ca3af;font-size:12px">
            Bhoomi Real Estate · Admin Notification · Verified Properties Across India
          </div>
        </main>
      `,
    });
    console.log(`Admin new-user notification sent (User #${userCount} – ${user.email}), msgId: ${info.messageId}`);
    return { ok: true };
  } catch (error) {
    console.error("Admin new-user notification failed:", error?.message || error);
    return { ok: false, error: error?.message };
  }
}

const DOC_NAMES = {
  AADHAAR: "Aadhaar Card",
  PAN: "PAN Card",
  ADDRESS_PROOF: "Address Proof",
  ID_PROOF: "Identity Proof",
  aadhaar: "Aadhaar Card",
  pan: "PAN Card",
  voterId: "Voter ID Card",
};

/**
 * 1. User Account Verified by Admin
 */
export async function sendAccountVerifiedEmail({ user, origin }) {
  if (!user?.email) return { skipped: true };
  const appOrigin = origin || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return notifyEmail({
    to: user.email,
    subject: "🎉 Congratulations! Your Bhoomi Account is Verified by Admin",
    heading: "Account Verified Successfully!",
    message: `Hello ${user.name || "User"},\n\nGreat news! Your account and identity documents have been reviewed and approved by the Bhoomi administration team. Your account is now ACTIVE and verified.\n\nYou are now fully eligible to post, manage, and showcase property listings on Bhoomi.\n\nClick the button below to get started:`,
    action: {
      label: "Post Property Now →",
      url: `${appOrigin}/post-property`,
    },
  });
}

/**
 * 2. User Account Rejected by Admin
 */
export async function sendAccountRejectedEmail({ user, reason, origin }) {
  if (!user?.email) return { skipped: true };
  const appOrigin = origin || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const formattedReason = reason ? `\n\nReason given by admin:\n"${reason}"` : "";
  return notifyEmail({
    to: user.email,
    subject: "⚠️ Bhoomi Account Verification Status: Rejected",
    heading: "Account Verification Update",
    message: `Hello ${user.name || "User"},\n\nYour identity verification for your Bhoomi account has been reviewed and rejected by the administration team.${formattedReason}\n\nPlease log in to your account to review your profile and submit updated, valid documents for re-verification.`,
    action: {
      label: "Review Your Profile →",
      url: `${appOrigin}/login`,
    },
  });
}

/**
 * 3. Document Verified by Admin
 */
export async function sendDocumentVerifiedEmail({ user, documentType, allVerified, origin }) {
  if (!user?.email) return { skipped: true };
  const appOrigin = origin || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const docName = DOC_NAMES[documentType] || documentType || "Identity Document";
  const allActiveNote = allVerified
    ? "\n\n🎉 All required verification documents have now been approved! Your Bhoomi account is now ACTIVE and fully verified."
    : "\n\nOur team is reviewing any remaining documents. You will receive an update once all documents are processed.";

  return notifyEmail({
    to: user.email,
    subject: `✅ Your ${docName} Has Been Verified - Bhoomi`,
    heading: "Document Verified Successfully",
    message: `Hello ${user.name || "User"},\n\nYour uploaded ${docName} has been reviewed and successfully VERIFIED by the Bhoomi admin team.${allActiveNote}`,
    action: {
      label: allVerified ? "Post Property Now →" : "View Dashboard →",
      url: allVerified ? `${appOrigin}/post-property` : `${appOrigin}/dashboard`,
    },
  });
}

/**
 * 4. Document Rejected by Admin
 */
export async function sendDocumentRejectedEmail({ user, documentType, reason, origin }) {
  if (!user?.email) return { skipped: true };
  const appOrigin = origin || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const docName = DOC_NAMES[documentType] || documentType || "Identity Document";
  const formattedReason = reason ? `\n\nReason for rejection:\n"${reason}"` : "";

  return notifyEmail({
    to: user.email,
    subject: `⚠️ Action Required: Your ${docName} Was Rejected - Bhoomi`,
    heading: "Document Verification Update",
    message: `Hello ${user.name || "User"},\n\nYour uploaded ${docName} could not be verified by the admin team.${formattedReason}\n\nPlease log in to your Bhoomi dashboard and re-upload a clear, valid copy of this document to complete your account verification.`,
    action: {
      label: "Re-Upload Document →",
      url: `${appOrigin}/dashboard`,
    },
  });
}

/**
 * 5. Property Status Update (Approved, Active, or Rejected)
 */
export async function sendPropertyStatusEmail({ owner, listing, status, reason, origin }) {
  if (!owner?.email) return { skipped: true };
  const appOrigin = origin || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const title = listing?.title || "Your Property Listing";
  const location = [listing?.area, listing?.city].filter(Boolean).join(", ");

  if (status === "APPROVED" || status === "ACTIVE") {
    return notifyEmail({
      to: owner.email,
      subject: `🎉 Property Listing Approved: ${title} - Bhoomi`,
      heading: "Property Listing Approved!",
      message: `Hello ${owner.name || "Property Owner"},\n\nGreat news! Your property listing "${title}"${location ? ` located in ${location}` : ""} has been reviewed and APPROVED by the Bhoomi administration team.\n\nIt is now live on our platform and visible to verified buyers and tenants across India.`,
      action: {
        label: "View Your Listing →",
        url: `${appOrigin}/properties/${listing.id}`,
      },
    });
  }

  if (status === "REJECTED") {
    const formattedReason = reason ? `\n\nReason for rejection:\n"${reason}"` : "";
    return notifyEmail({
      to: owner.email,
      subject: `⚠️ Property Listing Review: ${title} - Bhoomi`,
      heading: "Property Listing Needs Attention",
      message: `Hello ${owner.name || "Property Owner"},\n\nYour property listing "${title}"${location ? ` located in ${location}` : ""} was reviewed by the administration team and could not be approved at this time.${formattedReason}\n\nPlease check your property details, description, pricing, or photos to ensure they comply with our platform guidelines.`,
      action: {
        label: "Manage Listings →",
        url: `${appOrigin}/dashboard`,
      },
    });
  }

  return { skipped: true };
}

/**
 * 6. User Account Deleted by Admin
 */
export async function sendAccountDeletedEmail({ user, note, origin }) {
  if (!user?.email) return { skipped: true };
  const appOrigin = origin || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const formattedNote = note ? `\n\nAdmin note: "${note}"` : "";
  return notifyEmail({
    to: user.email,
    subject: "⚠️ Notice: Your Bhoomi Account Has Been Removed",
    heading: "Account Removed",
    message: `Hello ${user.name || "User"},\n\nThis is an automated notice that your Bhoomi account (${user.email}) has been removed by the platform administration.${formattedNote}\n\nIf you believe this was done in error or if you have questions, please contact our support team.`,
    action: {
      label: "Contact Support →",
      url: `${appOrigin}/contact`,
    },
  });
}

