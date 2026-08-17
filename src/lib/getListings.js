import { prisma } from "./prisma";

export async function getApprovedListings(where = {}) {
  const listings = await prisma.listing.findMany({
    where: { status: "APPROVED", ...where },
    include: { photos: true },
    orderBy: { createdAt: "desc" },
    take: 24,
  });
  return { listings, demo: false };
}
