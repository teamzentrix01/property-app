import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, signToken, AUTH_COOKIE, AUTH_COOKIE_OPTIONS } from "@/lib/auth";
import { email, phone } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function loginIdentifiers(body) {
  const candidates = [body.emailOrPhone, body.email, body.mobile, body.phone]
    .filter((value) => typeof value === "string")
    .map((value) => value.trim());
  const emails = [...new Set(candidates.map(email).filter(Boolean))];
  const phones = [...new Set(candidates.map((value) => {
    const digits = value.replace(/\D/g, "");
    return phone(digits.startsWith("91") && digits.length === 12 ? digits.slice(2) : digits);
  }).filter(Boolean))];
  return { emails, phones };
}

export async function POST(req) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body.password !== "string" || !body.password) {
      return NextResponse.json({ error: "Email/phone and password are required" }, { status: 400 });
    }

    const { emails, phones } = loginIdentifiers(body);
    if (!emails.length && !phones.length) {
      return NextResponse.json({ error: "Enter a valid email or mobile number" }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          ...emails.map((value) => ({ email: value })),
          ...phones.map((value) => ({ phone: value })),
        ],
      },
    });
    if (!user || !(await verifyPassword(body.password, user.passwordHash))) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const token = signToken({ id: user.id, userId: user.id, email: user.email, sessionVersion: user.sessionVersion });
    const response = NextResponse.json({ id: user.id, name: user.name, role: user.role }, { status: 200 });
    response.cookies.set(AUTH_COOKIE, token, AUTH_COOKIE_OPTIONS);
    return response;
  } catch (error) {
    // Keep the client response safe, but preserve enough detail to diagnose
    // database, Prisma, bcrypt, or JWT configuration failures in development.
    const message = error instanceof Error ? error.message : "Unknown error";
    const code = typeof error === "object" && error ? error.code : undefined;
    console.error("LOGIN API ERROR", { code, message, stack: process.env.NODE_ENV === "development" && error instanceof Error ? error.stack : undefined });
    const unavailable = code === "P1001" || code === "P1002" || code === "P1008" || /JWT_SECRET must be set|database|connect/i.test(message);
    return NextResponse.json(
      { error: unavailable ? "Login service is temporarily unavailable. Please try again." : "Unable to complete login. Please try again." },
      { status: unavailable ? 503 : 500 },
    );
  }
}
