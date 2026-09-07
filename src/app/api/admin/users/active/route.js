import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/serverAuth";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.user) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const users = await prisma.user.findMany({ where: { verificationStatus: "ACTIVE" }, orderBy: { verifiedAt: "desc" }, select: { id: true, name: true, email: true, phone: true, verifiedAt: true, verificationStatus: true, documents: { where: { verificationStatus: "VERIFIED" }, select: { id: true } } } });
  const summarized = users.map(({ documents, ...user }) => ({ ...user, documentsVerified: documents.length }));
  return NextResponse.json({ users: summarized });
}