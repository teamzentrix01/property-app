import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/serverAuth";

export async function GET() {
  const auth = await requireUser();
  if (!auth.user) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const saved = await prisma.savedListing.findMany({ where: { userId: auth.user.id }, include: { listing: { include: { photos: true } } }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ listings: saved.map((item) => item.listing), ids: saved.map((item) => item.listingId) });
}

export async function POST(req) {
  const auth = await requireUser();
  if (!auth.user) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const body = await req.json().catch(() => null);
  if (!body?.listingId) return NextResponse.json({ error: "Listing is required" }, { status: 400 });
  const listing = await prisma.listing.findFirst({ where: { id: body.listingId, status: { in: ["APPROVED", "ACTIVE"] }, blocked: false }, select: { id: true } });
  if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  await prisma.savedListing.upsert({ where: { userId_listingId: { userId: auth.user.id, listingId: listing.id } }, update: {}, create: { userId: auth.user.id, listingId: listing.id } });
  return NextResponse.json({ saved: true });
}

export async function DELETE(req) {
  const auth = await requireUser();
  if (!auth.user) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const listingId = new URL(req.url).searchParams.get("listingId");
  if (!listingId) return NextResponse.json({ error: "Listing is required" }, { status: 400 });
  await prisma.savedListing.deleteMany({ where: { userId: auth.user.id, listingId } });
  return NextResponse.json({ saved: false });
}
