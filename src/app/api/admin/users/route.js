import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/serverAuth";
import { ROLES, text } from "@/lib/validation";

const safeUser = { id: true, name: true, email: true, phone: true, role: true, adminArea: true, verified: true, createdAt: true };

export async function GET() {
  const auth = await requireUser(["SUPER_ADMIN"]);
  if (!auth.user) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const users = await prisma.user.findMany({ select: safeUser, orderBy: { createdAt: "desc" }, take: 200 });
  return NextResponse.json({ users });
}

export async function PATCH(req) {
  const auth = await requireUser(["SUPER_ADMIN"]);
  if (!auth.user) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const body = await req.json().catch(() => null);
  if (!body?.userId || typeof body.userId !== "string") return NextResponse.json({ error: "userId is required" }, { status: 400 });
  const target = await prisma.user.findUnique({ where: { id: body.userId } });
  if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (target.id === auth.user.id && body.role && body.role !== "SUPER_ADMIN") return NextResponse.json({ error: "You cannot remove your own super-admin access" }, { status: 400 });
  if (body.role && !ROLES.includes(body.role)) return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  if (body.role === "AREA_ADMIN" && !text(body.adminArea ?? target.adminArea, { min: 2, max: 80, required: true })) return NextResponse.json({ error: "Area admins require an assigned city" }, { status: 400 });
  if (body.verified !== undefined && typeof body.verified !== "boolean") return NextResponse.json({ error: "verified must be a boolean" }, { status: 400 });
  const data = {};
  if (body.role) data.role = body.role;
  if (body.adminArea !== undefined) data.adminArea = body.role === "AREA_ADMIN" || target.role === "AREA_ADMIN" ? text(body.adminArea, { min: 2, max: 80 }) : null;
  if (body.verified !== undefined) data.verified = body.verified;
  if (!Object.keys(data).length) return NextResponse.json({ error: "No changes supplied" }, { status: 400 });
  const user = await prisma.user.update({ where: { id: target.id }, data: { ...data, sessionVersion: { increment: target.id === auth.user.id ? 0 : 1 } }, select: safeUser });
  await prisma.adminAudit.create({ data: { adminId: auth.user.id, action: "USER_UPDATED", targetType: "USER", targetId: target.id, metadata: { changedFields: Object.keys(data), previousRole: target.role, nextRole: user.role, verified: user.verified } } });
  return NextResponse.json({ user });
}
