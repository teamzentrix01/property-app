import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/serverAuth";

export async function GET(req) {
  const auth = await requireAdmin();
  if (!auth.user) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const status = new URL(req.url).searchParams.get("status");
  const documents = await prisma.userDocument.findMany({
    where: status && ["PENDING", "VERIFIED", "REJECTED"].includes(status) ? { verificationStatus: status } : {},
    orderBy: { uploadedAt: "asc" },
    include: { user: { select: { id: true, name: true, email: true, phone: true, verificationStatus: true } } },
  });
  return NextResponse.json({ documents });
}
