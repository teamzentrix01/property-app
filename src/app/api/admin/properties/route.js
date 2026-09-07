import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/serverAuth";

export async function GET(req) {
  const auth = await requireAdmin();
  if (!auth.user) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const sp = new URL(req.url).searchParams;
  const status = sp.get("status");
  const query = sp.get("q")?.trim();
  const where = { ...(status && status !== "ALL" ? { status } : {}), ...(query ? { OR: [{ title: { contains: query, mode: "insensitive" } }, { city: { contains: query, mode: "insensitive" } }, { area: { contains: query, mode: "insensitive" } }, { owner: { name: { contains: query, mode: "insensitive" } } }, { owner: { email: { contains: query, mode: "insensitive" } } }] } : {}) };
  const [listings, grouped] = await Promise.all([
    prisma.listing.findMany({ where, orderBy: { createdAt: "desc" }, take: 100, include: { owner: { select: { id: true, name: true, email: true } }, photos: { take: 1 }, categories: true } }),
    prisma.listing.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);
  return NextResponse.json({ listings, counts: Object.fromEntries(grouped.map((item) => [item.status, item._count._all])) });
}
