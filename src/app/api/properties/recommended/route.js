import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeForClient } from "@/lib/formatters";
import { getUserLocationRecommendations } from "@/lib/locationIntelligence";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const city = searchParams.get("city")?.trim() || "";

    if (!city) {
      // Fallback: Default recommended listings
      const defaultListings = await prisma.listing.findMany({
        where: { status: { in: ["APPROVED", "ACTIVE"] } },
        include: { photos: true, owner: { select: { verified: true } } },
        orderBy: { createdAt: "desc" },
        take: 24,
      });
      return NextResponse.json({
        listings: serializeForClient(defaultListings),
        city: "",
        hasLocationMatches: false,
      });
    }

    // Smart location-prioritized recommendations from database
    const locationData = await getUserLocationRecommendations(city, { limit: 24 });
    const allListings = locationData?.allRecommendations || [];

    if (allListings.length > 0) {
      return NextResponse.json({
        listings: serializeForClient(allListings),
        city,
        hasLocationMatches: locationData.hasExactMatches || false,
      });
    }

    // If nothing found nearby, fallback to all approved listings
    const fallbackListings = await prisma.listing.findMany({
      where: { status: { in: ["APPROVED", "ACTIVE"] } },
      include: { photos: true, owner: { select: { verified: true } } },
      orderBy: { createdAt: "desc" },
      take: 24,
    });

    return NextResponse.json({
      listings: serializeForClient(fallbackListings),
      city,
      hasLocationMatches: false,
    });
  } catch (error) {
    console.error("GET /api/properties/recommended error:", error);
    return NextResponse.json({ listings: [], error: error.message }, { status: 500 });
  }
}

