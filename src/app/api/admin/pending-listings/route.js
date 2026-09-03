import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isScopedAreaAdmin, requireUser } from "@/lib/serverAuth";

export async function GET() {
  const auth = await requireUser(["AREA_ADMIN", "SUPER_ADMIN"]);
  if (!auth.user) return NextResponse.json({ error: auth.error }, { status: auth.status });
  if (auth.user.role === "AREA_ADMIN" && !isScopedAreaAdmin(auth.user)) return NextResponse.json({ error: "Admin area assignment is required" }, { status: 403 });
  const where = { status: { in: ["PENDING", "UNDER_REVIEW", "APPROVED", "ACTIVE", "REJECTED", "INACTIVE"] }, ...(isScopedAreaAdmin(auth.user) ? { city: auth.user.adminArea } : {}) };
  const listings = await prisma.listing.findMany({ where, include: { photos: true, categories: true, owner: { select: { name: true, phone: true, role: true } } }, orderBy: { createdAt: "asc" }, take: 100 });
  return NextResponse.json({ listings });
}
