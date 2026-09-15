import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/mailer";
import crypto from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const body = await req.json().catch(() => null);
    const emailRaw = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!emailRaw) {
      return NextResponse.json({ error: "Email address is required." }, { status: 400 });
    }

    // Always respond with success to prevent email enumeration attacks
    const user = await prisma.user.findFirst({ where: { email: emailRaw } });

    if (user) {
      // Generate a secure random token and hash it before storing
      const rawToken = crypto.randomBytes(32).toString("hex");
      const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Delete old tokens for this user, then create a new one
      await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
      await prisma.passwordResetToken.create({
        data: { userId: user.id, tokenHash, expiresAt },
      });

      const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
      const resetUrl = `${origin}/reset-password?token=${rawToken}`;

      await sendEmail({
        to: user.email,
        subject: "Reset Your Bhoomi Password",
        heading: "Password Reset Request",
        message: `Hi ${user.name || "there"},\n\nWe received a request to reset your Bhoomi account password.\n\nClick the button below to reset your password. This link will expire in 1 hour.\n\nIf you did not request a password reset, you can safely ignore this email.`,
        action: { label: "Reset Password →", url: resetUrl },
      });
    }

    // Always return success (prevent email enumeration)
    return NextResponse.json({
      message: "If an account with that email exists, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);
    return NextResponse.json(
      { error: "Unable to process request. Please try again." },
      { status: 500 }
    );
  }
}
