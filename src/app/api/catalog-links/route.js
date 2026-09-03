import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/serverAuth";

function makeSlug(title) {
  const base = (title || "collection").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return `${base}-${crypto.randomUUID().replaceAll("-", "").slice(0, 16)}`;
}

// GET — broker's own saved catalog links
export async function GET() {
  const auth = await requireUser(["BROKER"]);
  if (!auth.user) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const links = await prisma.catalogLink.findMany({
    where: { brokerId: auth.user.id },
    include: { listings: { include: { listing: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ links });
}

// POST — broker selects a subset of their own listings and generates a shareable link
export async function POST(req) {
  const auth = await requireUser(["BROKER"]);
  if (!auth.user) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const user = auth.user;

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  const { title, listingIds } = body;
  if (!Array.isArray(listingIds) || listingIds.length === 0) {
    return NextResponse.json({ error: "Select at least one listing" }, { status: 400 });
  }

  // Only allow linking the broker's own listings
  const owned = await prisma.listing.findMany({
    where: { id: { in: listingIds }, ownerId: user.id, status: { in: ["APPROVED", "ACTIVE"] } },
    select: { id: true },
  });
  if (owned.length !== listingIds.length) {
    return NextResponse.json({ error: "You can only share your own listings" }, { status: 403 });
  }

  const link = await prisma.catalogLink.create({
    data: {
      slug: makeSlug(title),
      title,
      brokerId: user.id,
      listings: { create: listingIds.map((listingId) => ({ listingId })) },
    },
  });

  return NextResponse.json({ link });
}
