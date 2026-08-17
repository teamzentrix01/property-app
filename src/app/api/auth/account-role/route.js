import { NextResponse } from "next/server";
import { requireUser } from "@/lib/serverAuth";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  const auth = await requireUser(["BUYER"]);
  if (!auth.user) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const body = await req.json().catch(() => null);
  if (!body || !["OWNER", "BROKER"].includes(body.role)) return NextResponse.json({ error: "Choose Owner or Broker" }, { status: 400 });
  const user = await prisma.user.update({ where: { id: auth.user.id }, data: { role: body.role }, select: { id: true, name: true, email: true, role: true, adminArea: true } });
  return NextResponse.json({ user });
}
