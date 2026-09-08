import { timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { email as validEmail } from "@/lib/validation";
import { ADMIN_AUTH_COOKIE, ADMIN_AUTH_COOKIE_OPTIONS, signAdminToken } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function credentialsMatch(value, expected) {
  const received = Buffer.from(value);
  const configured = Buffer.from(expected);
  return received.length === configured.length && timingSafeEqual(received, configured);
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => null);
    const submittedEmail = validEmail(body?.email);
    const password = typeof body?.password === "string" ? body.password : "";
    const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminEmail || !validEmail(adminEmail) || !adminPassword || adminPassword.length < 12) {
      console.error("Admin login is not configured: set ADMIN_EMAIL and a 12+ character ADMIN_PASSWORD.");
      return NextResponse.json({ error: "Admin login is not configured. Set ADMIN_EMAIL and ADMIN_PASSWORD on the server." }, { status: 503 });
    }
    const emailMatches = credentialsMatch(submittedEmail || "", adminEmail);
    const passwordMatches = credentialsMatch(password, adminPassword);
    if (!emailMatches || !passwordMatches) return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    const existing = await prisma.user.findUnique({ where: { email: adminEmail }, select: { id: true, role: true } });
    if (!existing) return NextResponse.json({ error: "The configured ADMIN_EMAIL must belong to an existing User with an admin role." }, { status: 503 });
    if (!['AREA_ADMIN', 'SUPER_ADMIN'].includes(existing.role)) return NextResponse.json({ error: "The configured user does not have permission to access the Admin Panel." }, { status: 403 });
    const user = await prisma.user.update({ where: { id: existing.id }, data: { adminSessionVersion: { increment: 1 } }, select: { id: true, email: true, name: true, role: true, adminSessionVersion: true } });
    const token = signAdminToken({ id: user.id, email: user.email, role: user.role, adminSessionVersion: user.adminSessionVersion });
    const response = NextResponse.json({ ok: true, admin: { id: user.id, name: user.name, email: user.email, role: user.role } });
    response.cookies.set(ADMIN_AUTH_COOKIE, token, ADMIN_AUTH_COOKIE_OPTIONS);
    return response;
  } catch (error) {
    console.error("ADMIN LOGIN API ERROR", { code: error?.code, message: error instanceof Error ? error.message : "Unknown error" });
    return NextResponse.json({ error: "Admin login is temporarily unavailable. Please try again." }, { status: 503 });
  }
}
