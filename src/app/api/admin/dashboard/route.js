import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/serverAuth";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.user) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const [usersByVerification, documentStatuses, listingStatuses, totalUsers, totalListings, totalDocuments, recentUsers, recentListings, audits] = await Promise.all([
    prisma.user.groupBy({ by: ["verificationStatus"], _count: { _all: true } }),
    prisma.userDocument.groupBy({ by: ["verificationStatus"], _count: { _all: true } }),
    prisma.listing.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.user.count(),
    prisma.listing.count(),
    prisma.userDocument.count(),
    prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 8, select: { id: true, name: true, email: true, phone: true, verificationStatus: true, verified: true, createdAt: true } }),
    prisma.listing.findMany({ orderBy: { createdAt: "desc" }, take: 8, include: { owner: { select: { id: true, name: true } }, photos: { take: 1 } } }),
    prisma.adminAudit.findMany({ orderBy: { createdAt: "desc" }, take: 10, include: { admin: { select: { name: true } } } }),
  ]);
  const users = Object.fromEntries(usersByVerification.map((item) => [item.verificationStatus, item._count._all]));
  const documents = Object.fromEntries(documentStatuses.map((item) => [item.verificationStatus, item._count._all]));
  const properties = Object.fromEntries(listingStatuses.map((item) => [item.status, item._count._all]));
  return NextResponse.json({ stats: { totalUsers, pendingUsers: users.PENDING || 0, activeUsers: users.ACTIVE || 0, rejectedUsers: users.REJECTED || 0, totalDocuments, pendingDocuments: documents.PENDING || 0, verifiedDocuments: documents.VERIFIED || 0, rejectedDocuments: documents.REJECTED || 0, totalListings: totalListings, pendingListings: properties.PENDING || 0, approvedListings: properties.APPROVED || 0, activeListings: properties.ACTIVE || 0, rejectedListings: properties.REJECTED || 0 }, recentUsers, recentListings, audits });
}
