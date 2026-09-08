import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/serverAuth";
import { personName } from "@/lib/validation";

const select = { id: true, name: true, email: true, phone: true, role: true, adminArea: true, createdAt: true };

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.user) return NextResponse.json({ error: auth.error }, { status: auth.status });
  return NextResponse.json({ user: await prisma.user.findUnique({ where: { id: auth.user.id }, select }) });
}

export async function PATCH(request) {
  const auth = await requireAdmin();
  if (!auth.user) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const body = await request.json().catch(() => null);
  const name = personName(body?.name);
  if (!name) return NextResponse.json({ error: "Enter a valid full name" }, { status: 400 });
  const user = await prisma.user.update({ where: { id: auth.user.id }, data: { name }, select });
  await prisma.adminAudit.create({ data: { adminId: auth.user.id, action: "ADMIN_SETTINGS_UPDATED", targetType: "USER", targetId: auth.user.id, metadata: { changedFields: ["name"] } } });
  return NextResponse.json({ user });
}
