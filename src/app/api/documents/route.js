import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/serverAuth";

export async function GET() {
  const auth = await requireUser();
  if (!auth.user) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const documents = await prisma.userDocument.findMany({ where: { userId: auth.user.id }, orderBy: { uploadedAt: "desc" } });
  return NextResponse.json({ documents });
}