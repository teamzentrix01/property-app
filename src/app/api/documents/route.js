import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/serverAuth";

export async function GET() {
  const auth = await requireUser();
  if (!auth.user) return NextResponse.json({ error: auth.error }, { status: auth.status });
  try {
    const documents = await prisma.userDocument.findMany({ where: { userId: auth.user.id }, orderBy: { uploadedAt: "desc" } });
    return NextResponse.json({ documents });
  } catch (error) {
    console.error("DOCUMENT LIST API ERROR", { message: error instanceof Error ? error.message : "Unknown error" });
    return NextResponse.json({ error: "Unable to load documents." }, { status: 500 });
  }
}
