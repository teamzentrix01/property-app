import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/serverAuth";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.user) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const now = new Date();
  await prisma.user.updateMany({ where: { verificationStatus: "PENDING", verificationDeadline: { lt: now } }, data: { verificationStatus: "EXPIRED" } });
  const users = await prisma.user.findMany({ where: { verificationStatus: "PENDING" }, orderBy: { verificationSubmittedAt: "asc" }, select: { id: true, name: true, email: true, phone: true, createdAt: true, verificationSubmittedAt: true, verificationDeadline: true, verificationStatus: true, documents: { select: { verificationStatus: true } } } });
  const summarized = users.map(({ documents, ...user }) => ({ ...user, documentCount: documents.length, verifiedDocuments: documents.filter((document) => document.verificationStatus === "VERIFIED").length, pendingDocuments: documents.filter((document) => document.verificationStatus === "PENDING").length, rejectedDocuments: documents.filter((document) => document.verificationStatus === "REJECTED").length }));
  return NextResponse.json({ users: summarized });
}