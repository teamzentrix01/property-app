import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { email as validEmail } from "@/lib/validation";
import { EMAIL_OTP_RESEND_COOLDOWN_MS, sendEmailVerificationOtp } from "@/lib/emailVerification";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const body = await req.json().catch(() => null);
    const email = validEmail(body?.email);
    if (!email) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    const user = await prisma.user.findUnique({ where: { email }, select: { id: true, name: true, email: true, emailVerifiedAt: true } });
    if (!user || user.emailVerifiedAt) return NextResponse.json({ ok: true, message: "If this address needs verification, a code has been sent." });

    const latest = await prisma.emailVerificationToken.findFirst({ where: { userId: user.id, usedAt: null }, orderBy: { createdAt: "desc" }, select: { createdAt: true } });
    const retryAt = latest && new Date(latest.createdAt).getTime() + EMAIL_OTP_RESEND_COOLDOWN_MS;
    if (retryAt && retryAt > Date.now()) return NextResponse.json({ error: `Please wait ${Math.ceil((retryAt - Date.now()) / 1000)} seconds before requesting another code.` }, { status: 429 });

    const result = await sendEmailVerificationOtp({ user, origin: new URL(req.url).origin });
    if (!result.ok) return NextResponse.json({ error: "We could not send the verification email. Please try again shortly." }, { status: 503 });
    return NextResponse.json({ ok: true, message: "A new verification code has been sent." });
  } catch (error) {
    console.error("RESEND EMAIL OTP ERROR:", error);
    return NextResponse.json({ error: "Unable to send a new code right now. Please try again." }, { status: 500 });
  }
}
