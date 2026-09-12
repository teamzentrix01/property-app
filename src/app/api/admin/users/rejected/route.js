import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/serverAuth";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.user) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const users = await prisma.user.findMany({ where: { verificationStatus: { in: ["REJECTED", "EXPIRED"] } }, orderBy: { createdAt: "asc" }, select: { id: true, name: true, email: true, phone: true, rejectionReason: true, rejectedAt: true, verificationStatus: true } });
  return NextResponse.json({ users });
}