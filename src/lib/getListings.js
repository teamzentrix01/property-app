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

export async function getApprovedCities() {
  if (!process.env.DATABASE_URL) return [];
  try {
    // Fetch all distinct cities from APPROVED or ACTIVE properties
    const rows = await prisma.listing.findMany({
      where: {
        status: { in: ["APPROVED", "ACTIVE"] },
        city: { not: "" },
      },
      select: { city: true },
    });

    // Normalize: trim whitespace, deduplicate case-insensitively
    // Keep the first seen casing as the canonical display form
    const seen = new Map(); // lowercase -> canonical
    for (const row of rows) {
      const raw = row.city;
      if (!raw) continue;
      const trimmed = raw.trim();
      if (!trimmed) continue;
      const key = trimmed.toLowerCase();
      if (!seen.has(key)) seen.set(key, trimmed);
    }

    // Sort alphabetically (locale-aware for Hindi city names)
    return [...seen.values()].sort((a, b) =>
      a.localeCompare(b, ["hi", "en"], { sensitivity: "base" })
    );
  } catch (err) {
    console.warn("getApprovedCities error:", err?.message);
    return [];
  }
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


export async function getRotatingSectionsData() {
  if (!process.env.DATABASE_URL) {
    return {
      trending: {},
      newLaunch: {},
      branded: {},
      luxury: {},
    };
  }

  try {
    const listings = await prisma.listing.findMany({
      where: { status: { in: ["APPROVED", "ACTIVE"] } },
      include: {
        photos: true,
        categories: true,
        owner: { select: { verified: true, name: true, role: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const serialized = serializeForClient(listings);

    const trending = {};
    const newLaunch = {};
    const branded = {};
    const luxury = {};

    for (const item of serialized) {
      const city = item.city?.trim();
      if (!city) continue;

      // Group for trending
      if (!trending[city]) trending[city] = [];
      trending[city].push(item);

      // Group for newLaunch
      if (!newLaunch[city]) newLaunch[city] = [];
      newLaunch[city].push(item);

      // Group for branded
      const hasBranded = item.categories?.some((c) => c.category === "BRANDED");
      if (hasBranded) {
        if (!branded[city]) branded[city] = [];
        branded[city].push(item);
      }

      // Group for luxury
      const hasLuxury = item.categories?.some((c) => c.category === "LUXURY");
      if (hasLuxury) {
        if (!luxury[city]) luxury[city] = [];
        luxury[city].push(item);
      }
    }

    // If no city has branded/luxury tag yet, use cities with properties as fallback
    if (Object.keys(branded).length === 0) {
      Object.assign(branded, trending);
    }
    if (Object.keys(luxury).length === 0) {
      Object.assign(luxury, trending);
    }

    return { trending, newLaunch, branded, luxury };
  } catch (e) {
    console.warn("Could not query rotating sections data:", e.message);
    return { trending: {}, newLaunch: {}, branded: {}, luxury: {} };
  }
}
