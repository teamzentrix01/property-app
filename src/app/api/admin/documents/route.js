import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/serverAuth";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.user) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const documents = await prisma.userDocument.findMany({
    where: { verificationStatus: { in: ["PENDING", "REJECTED"] } },
    orderBy: { uploadedAt: "asc" },
    include: { user: { select: { id: true, name: true, email: true, phone: true, verificationStatus: true } } },
  });
  return NextResponse.json({ documents });
}
