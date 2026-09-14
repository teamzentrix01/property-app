import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { email as validEmail } from "@/lib/validation";
import { hashEmailOtp } from "@/lib/emailVerification";
import { notifyEmail } from "@/lib/mailer";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const body = await req.json().catch(() => null);
    const email = validEmail(body?.email);
    const otp = typeof body?.otp === "string" ? body.otp.trim() : "";
    if (!email || !/^\d{6}$/.test(otp)) return NextResponse.json({ error: "Enter the six-digit code sent to your email." }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email }, select: { id: true, name: true, email: true, emailVerifiedAt: true } });
    if (!user) return NextResponse.json({ error: "This verification request is no longer valid. Please sign up again." }, { status: 404 });
    if (user.emailVerifiedAt) return NextResponse.json({ error: "This email address is already verified. Please log in." }, { status: 409 });

    const token = await prisma.emailVerificationToken.findFirst({ where: { userId: user.id, tokenHash: hashEmailOtp(user.id, otp), usedAt: null, expiresAt: { gt: new Date() } }, select: { id: true } });
    if (!token) return NextResponse.json({ error: "That code is incorrect or has expired. Request a new code and try again." }, { status: 400 });

    const completed = await prisma.$transaction(async (tx) => {
      const consumed = await tx.emailVerificationToken.updateMany({ where: { id: token.id, usedAt: null }, data: { usedAt: new Date() } });
      if (consumed.count !== 1) return false;
      await tx.user.update({ where: { id: user.id }, data: { emailVerifiedAt: new Date() } });
      return true;
    });
    if (!completed) return NextResponse.json({ error: "That code has already been used. Please log in." }, { status: 409 });

    const greeting = await notifyEmail({
      to: user.email,
      subject: "Welcome to Bhoomi",
      heading: `Welcome, ${user.name || "there"}`,
      message: "Your email is verified and your Bhoomi account is ready. You can now browse properties and manage your activity from the dashboard.",
      action: { label: "Log in to Bhoomi", url: `${new URL(req.url).origin}/login` },
    });
    return NextResponse.json({ ok: true, greetingSent: Boolean(greeting?.ok), message: "Email verified successfully. Your account is ready—please log in." });
  } catch (error) {
    console.error("EMAIL VERIFICATION ERROR:", error);
    return NextResponse.json({ error: "Unable to verify your email right now. Please try again." }, { status: 500 });
  }
}
