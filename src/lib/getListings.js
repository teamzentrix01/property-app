import { prisma } from "./prisma.js";
import { serializeForClient } from "./formatters.js";

export async function getApprovedListings(where = {}) {
  if (!process.env.DATABASE_URL) {
    return { listings: [], demo: true };
  }

  const listings = await prisma.listing.findMany({
    where: { status: { in: ["APPROVED", "ACTIVE"] }, ...where },
    include: { photos: true, owner: { select: { verified: true } } },
    orderBy: { createdAt: "desc" },
    take: 24,
  });
  return { listings: serializeForClient(listings), demo: false };
}

export async function getRecommendedListings() {
  if (!process.env.DATABASE_URL) {
    return { listings: [], demo: true };
  }

  // 1. Fetch listings curated by Super Admin in Recommendation blocks (Homepage Control)
  let curatedListings = [];
  try {
    const sections = await prisma.homepageSection.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: {
        items: {
          orderBy: { sortOrder: "asc" },
          include: {
            listing: {
              include: {
                photos: true,
                owner: { select: { verified: true } },
              },
            },
          },
        },
      },
    });

    for (const sec of sections) {
      for (const item of sec.items || []) {
        if (item.listing && ["APPROVED", "ACTIVE"].includes(item.listing.status)) {
          curatedListings.push(item.listing);
        }
      }
    }
  } catch (e) {
    console.warn("Could not query homepage recommendation sections:", e.message);
  }

  // 2. Fetch listings posted directly by an Admin or Super Admin
  let adminPostedListings = [];
  try {
    adminPostedListings = await prisma.listing.findMany({
      where: {
        status: { in: ["APPROVED", "ACTIVE"] },
        OR: [
          { owner: { role: { in: ["AREA_ADMIN", "SUPER_ADMIN"] } } },
          { postedBy: { in: ["AREA_ADMIN", "SUPER_ADMIN"] } },
        ],
      },
      include: { photos: true, owner: { select: { verified: true } } },
      orderBy: { createdAt: "desc" },
      take: 24,
    });
  } catch (e) {
    console.warn("Could not query admin posted listings:", e.message);
  }

  // Deduplicate preserving super-admin curated order first
  const seen = new Set();
  const combined = [];
  for (const l of [...curatedListings, ...adminPostedListings]) {
    if (l && l.id && !seen.has(l.id)) {
      seen.add(l.id);
      combined.push(l);
    }
  }

  return { listings: serializeForClient(combined), demo: false };
}

export async function getAllApprovedListings(where = {}) {
  if (!process.env.DATABASE_URL) {
    return { listings: [], demo: true };
  }

  const listings = await prisma.listing.findMany({
    // The common properties page is intentionally limited to approved listings.
    where: { ...where, status: "APPROVED" },
    include: { photos: true, owner: { select: { verified: true } } },
    orderBy: { createdAt: "desc" },
  });
  return { listings: serializeForClient(listings), demo: false };
}

export async function getHomepageSections() {
  if (!process.env.DATABASE_URL) {
    return { sections: [], fallbackListings: [] };
  }

  // The generated Prisma client may temporarily predate this model after a
  // schema change. Keep the public homepage available until it is regenerated.
  const sectionQuery = prisma.homepageSection
    ? prisma.homepageSection.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        include: {
          items: {
            orderBy: { sortOrder: "asc" },
            include: {
              listing: {
                include: {
                  photos: true,
                  owner: { select: { verified: true } },
                },
              },
            },
          },
        },
      })
    : Promise.resolve([]);

  const [sections, fallbackListings] = await Promise.all([
    sectionQuery,
    prisma.listing.findMany({
      where: { status: { in: ["APPROVED", "ACTIVE"] } },
      include: { photos: true, owner: { select: { verified: true } } },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  const normalized = sections.map((section) => ({
    ...section,
    items: (section.items || []).map((item) => ({
      ...item,
      listing: serializeForClient(item.listing),
    })),
  }));

  return {
    sections: serializeForClient(normalized),
    fallbackListings: serializeForClient(fallbackListings),
  };
}
