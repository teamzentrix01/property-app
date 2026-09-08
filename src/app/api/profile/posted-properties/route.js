import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/serverAuth";

export async function GET() {
  const auth = await requireUser();
  if (!auth.user) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const listings = await prisma.listing.findMany({ where: { ownerId: auth.user.id }, include: { photos: true }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ listings });
}
