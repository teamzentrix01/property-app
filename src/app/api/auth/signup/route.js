import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, signToken, AUTH_COOKIE, AUTH_COOKIE_OPTIONS } from "@/lib/auth";
import { email, personName, phone } from "@/lib/validation";
import { notifyEmail } from "@/lib/mailer";

export async function POST(req) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  const name = personName(body.name);
  const safeEmail = email(body.email);
  const safePhone = phone(body.phone);
  const { password, role } = body;

  if (!name || !safeEmail || !safePhone || typeof password !== "string" || password.length < 12 || password.length > 128) {
    return NextResponse.json({ error: "Use a valid name, email, phone, and a password of 12–128 characters" }, { status: 400 });
  }

  const allowedSignupRoles = ["BUYER", "OWNER", "BROKER"];
  const safeRole = allowedSignupRoles.includes(role) ? role : "BUYER";

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email: safeEmail }, { phone: safePhone }] },
  });
  if (existing) {
    return NextResponse.json({ error: "An account with this email or phone already exists" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { name, email: safeEmail, phone: safePhone, passwordHash, role: safeRole },
  });

  const token = signToken({ id: user.id, sessionVersion: user.sessionVersion });
  const res = NextResponse.json({ id: user.id, name: user.name, role: user.role });
  res.cookies.set(AUTH_COOKIE, token, AUTH_COOKIE_OPTIONS);
  notifyEmail({ to: user.email, subject: "Welcome to Bhoomi", heading: `Welcome, ${user.name}`, message: "Your Bhoomi account is ready. You can now browse properties and manage your activity from the dashboard.", action: { label: "Open dashboard", url: `${new URL(req.url).origin}/dashboard` } });
  return res;
}
