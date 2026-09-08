import { NextResponse } from "next/server";
import { ADMIN_AUTH_COOKIE } from "@/lib/auth";
import { currentAdmin } from "@/lib/serverAuth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const admin = await currentAdmin();
  // Incrementing the separate version invalidates this admin token server-side
  // too, while leaving any normal user session untouched.
  if (admin) await prisma.user.update({ where: { id: admin.id }, data: { adminSessionVersion: { increment: 1 } } });
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_AUTH_COOKIE, "", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 0 });
  return response;
}
