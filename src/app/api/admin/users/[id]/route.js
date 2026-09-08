import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/serverAuth";

export async function GET(request, { params }) {
  const auth = await requireAdmin();
  if (!auth.user) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const { id } = await params;
  const user = await prisma.user.findUnique({ where: { id }, select: { id: true, name: true, email: true, phone: true, role: true, verified: true, verificationStatus: true, createdAt: true, listings: { include: { photos: { take: 1 } }, orderBy: { createdAt: "desc" } }, savedListings: { include: { listing: { select: { id: true, title: true, city: true, area: true } } }, orderBy: { createdAt: "desc" } }, documents: { orderBy: { uploadedAt: "desc" } } } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  return NextResponse.json({ user });
}
