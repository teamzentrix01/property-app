import { createHmac, randomInt } from "crypto";

import { prisma } from "@/lib/prisma";
import { notifyEmail } from "@/lib/mailer";

export const EMAIL_OTP_TTL_MS = 10 * 60 * 1000;
export const EMAIL_OTP_RESEND_COOLDOWN_MS = 60 * 1000;

function otpSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) throw new Error("JWT_SECRET must be set before email verification can be used");
  return secret;
}

export function createEmailOtp() {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

export function hashEmailOtp(userId, otp) {
  return createHmac("sha256", otpSecret()).update(`${userId}:${otp}`).digest("hex");
}

export async function sendEmailVerificationOtp({ user, origin }) {
  const otp = createEmailOtp();
  const token = await prisma.$transaction(async (tx) => {
    await tx.emailVerificationToken.deleteMany({ where: { userId: user.id, usedAt: null } });
    return tx.emailVerificationToken.create({ data: { userId: user.id, tokenHash: hashEmailOtp(user.id, otp), expiresAt: new Date(Date.now() + EMAIL_OTP_TTL_MS) } });
  });

  const result = await notifyEmail({
    to: user.email,
    subject: "Your Bhoomi email verification code",
    heading: "Verify your email address",
    message: `Hello ${user.name || "there"},\n\nYour Bhoomi verification code is ${otp}. It expires in 10 minutes. Do not share this code with anyone.`,
    action: { label: "Verify your email", url: `${origin}/verify-email?email=${encodeURIComponent(user.email)}` },
  });

  if (!result?.ok) await prisma.emailVerificationToken.deleteMany({ where: { id: token.id, usedAt: null } });
  return { ok: Boolean(result?.ok), error: result?.error };
}
