import { prisma } from "./prisma";
import { serializeForClient } from "./formatters";

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
