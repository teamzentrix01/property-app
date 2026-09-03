import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/serverAuth";

function normalizeSection(section) {
  return {
    ...section,
    items: (section.items || []).map((item) => ({
      ...item,
      listing: item.listing ? {
        ...item.listing,
        photos: item.listing.photos || [],
      } : null,
    })),
  };
}

export async function GET() {
  const auth = await requireUser(["SUPER_ADMIN"]);
  if (!auth.user) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const [sections, listings] = await Promise.all([
    prisma.homepageSection.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: {
        items: {
          orderBy: { sortOrder: "asc" },
          include: {
            listing: {
              include: { photos: true },
            },
          },
        },
      },
    }),
    prisma.listing.findMany({
      where: { status: { in: ["APPROVED", "ACTIVE"] } },
      orderBy: { createdAt: "desc" },
      take: 200,
      select: {
        id: true,
        title: true,
        area: true,
        city: true,
        propertyType: true,
        purpose: true,
        price: true,
        photos: { take: 1 },
      },
    }),
  ]);

  return NextResponse.json({
    sections: sections.map(normalizeSection),
    listings,
  });
}

export async function POST(req) {
  const auth = await requireUser(["SUPER_ADMIN"]);
  if (!auth.user) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const title = String(body.title || "").trim();
  const subtitle = String(body.subtitle || "").trim();
  const listingIds = Array.isArray(body.listingIds)
    ? body.listingIds.map((id) => String(id).trim()).filter(Boolean)
    : String(body.listingIds || "")
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean);

  if (!title) {
    return NextResponse.json({ error: "Section title is required" }, { status: 400 });
  }
  if (!listingIds.length) {
    return NextResponse.json({ error: "At least one listing is required" }, { status: 400 });
  }

  const validListings = await prisma.listing.findMany({
    where: {
      id: { in: listingIds },
      status: { in: ["APPROVED", "ACTIVE"] },
    },
    select: { id: true },
  });

  if (validListings.length !== new Set(listingIds).size) {
    return NextResponse.json({ error: "Only approved listings can be added to homepage sections" }, { status: 400 });
  }

  const count = await prisma.homepageSection.count();

  const section = await prisma.homepageSection.create({
    data: {
      title,
      subtitle: subtitle || null,
      sortOrder: count,
      isActive: true,
      items: {
        create: validListings.map((listing, index) => ({
          listingId: listing.id,
          sortOrder: index,
        })),
      },
    },
    include: {
      items: {
        include: { listing: { include: { photos: true } } },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  return NextResponse.json({ section: normalizeSection(section) });
}

export async function DELETE(req) {
  const auth = await requireUser(["SUPER_ADMIN"]);
  if (!auth.user) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await req.json().catch(() => null);
  const sectionId = body?.sectionId ? String(body.sectionId).trim() : "";

  if (!sectionId) {
    return NextResponse.json({ error: "sectionId is required" }, { status: 400 });
  }

  await prisma.homepageSection.delete({ where: { id: sectionId } });
  return NextResponse.json({ ok: true });
}
