import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, signToken, AUTH_COOKIE, AUTH_COOKIE_OPTIONS } from "@/lib/auth";
import { email, phone } from "@/lib/validation";

export async function POST(req) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body.password !== "string" || !body.emailOrPhone) {
    return NextResponse.json({ error: "Email/phone and password are required" }, { status: 400 });
  }

  const safeEmail = email(body.emailOrPhone);
  const safePhone = phone(body.emailOrPhone);
  const user = await prisma.user.findFirst({
    where: { OR: [{ email: safeEmail || "" }, { phone: safePhone || "" }] },
  });
  if (!user || !(await verifyPassword(body.password, user.passwordHash))) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = signToken({ id: user.id, sessionVersion: user.sessionVersion });
  const res = NextResponse.json({ id: user.id, name: user.name, role: user.role });
  res.cookies.set(AUTH_COOKIE, token, AUTH_COOKIE_OPTIONS);
  return res;
}
