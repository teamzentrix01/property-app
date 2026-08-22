import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/serverAuth";

export async function GET(req) {
  const auth = await requireUser(["SUPER_ADMIN"]);
  if (!auth.user) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const sp = new URL(req.url).searchParams;
  const page = Math.max(1, Number(sp.get("page")) || 1);
  const take = 50;
  const [roleGroups, statusGroups, totalUsers, totalListings, totalInquiries, users, listings, audits] = await Promise.all([
    prisma.user.groupBy({ by: ["role"], _count: { _all: true } }),
    prisma.listing.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.user.count(), prisma.listing.count(), prisma.inquiry.count(),
    prisma.user.findMany({ select: { id: true, name: true, email: true, phone: true, role: true, verified: true, createdAt: true, updatedAt: true, _count: { select: { listings: true, inquiries: true, savedListings: true } } }, orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.listing.findMany({ include: { photos: { select: { id: true, url: true } }, owner: { select: { id: true, name: true, email: true, phone: true, role: true, verified: true } }, _count: { select: { inquiries: true, savedBy: true, reports: true } } }, orderBy: { createdAt: "desc" }, skip: (page - 1) * take, take }),
    prisma.adminAudit.findMany({ include: { admin: { select: { name: true, email: true } } }, orderBy: { createdAt: "desc" }, take: 100 }),
  ]);
  const roles = Object.fromEntries(roleGroups.map((row) => [row.role, row._count._all]));
  const statuses = Object.fromEntries(statusGroups.map((row) => [row.status, row._count._all]));
  return NextResponse.json({ metrics: { totalUsers, buyers: roles.BUYER || 0, owners: roles.OWNER || 0, brokers: roles.BROKER || 0, admins: (roles.AREA_ADMIN || 0) + (roles.SUPER_ADMIN || 0), totalListings, activeListings: statuses.APPROVED || 0, pendingListings: statuses.PENDING || 0, rejectedListings: statuses.REJECTED || 0, totalInquiries }, users, listings, audits, pagination: { page, take, total: totalListings, pages: Math.max(1, Math.ceil(totalListings / take)) } });
}
