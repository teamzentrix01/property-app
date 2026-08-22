import { prisma } from "./prisma";
import { serializeForClient } from "./formatters";

export async function getApprovedListings(where = {}) {
  const listings = await prisma.listing.findMany({
    where: { status: "APPROVED", ...where },
    include: { photos: true, owner: { select: { verified: true } } },
    orderBy: { createdAt: "desc" },
    take: 24,
  });
  return { listings: serializeForClient(listings), demo: false };
}
