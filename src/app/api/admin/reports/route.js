import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/serverAuth";

function period(searchParams) {
  const preset = searchParams.get("period") || "30d";
  const end = new Date();
  let start;
  if (preset === "today") start = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  else if (preset === "7d") start = new Date(end.getTime() - 7 * 86400000);
  else if (preset === "year") start = new Date(end.getFullYear(), 0, 1);
  else if (preset === "custom") {
    const value = searchParams.get("from");
    start = value ? new Date(value) : new Date(end.getTime() - 30 * 86400000);
  } else start = new Date(end.getTime() - 30 * 86400000);
  return { start: Number.isNaN(start.getTime()) ? new Date(end.getTime() - 30 * 86400000) : start, end };
}

export async function GET(request) {
  const auth = await requireAdmin();
  if (!auth.user) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const { searchParams } = new URL(request.url);
  const { start, end } = period(searchParams);
  const within = { gte: start, lte: end };
  const [users, listings, documents, listingStatus, documentStatus, byType, byPurpose, byCity] = await Promise.all([
    prisma.user.count({ where: { createdAt: within } }),
    prisma.listing.count({ where: { createdAt: within } }),
    prisma.userDocument.count({ where: { uploadedAt: within } }),
    prisma.listing.groupBy({ by: ["status"], where: { createdAt: within }, _count: { _all: true } }),
    prisma.userDocument.groupBy({ by: ["verificationStatus"], where: { uploadedAt: within }, _count: { _all: true } }),
    prisma.listing.groupBy({ by: ["propertyType"], where: { createdAt: within }, _count: { _all: true } }),
    prisma.listing.groupBy({ by: ["purpose"], where: { createdAt: within }, _count: { _all: true } }),
    prisma.listing.groupBy({ by: ["city"], where: { createdAt: within }, _count: { _all: true }, orderBy: { _count: { city: "desc" } }, take: 10 }),
  ]);
  const rows = (items, key) => items.map((item) => ({ label: item[key], value: item._count._all }));
  return NextResponse.json({ period: { start, end }, totals: { users, listings, documents }, listingStatus: rows(listingStatus, "status"), documentStatus: rows(documentStatus, "verificationStatus"), byType: rows(byType, "propertyType"), byPurpose: rows(byPurpose, "purpose"), byCity: rows(byCity, "city") });
}
