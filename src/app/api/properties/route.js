import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeCityName } from "@/constants/cities";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const rawCity = searchParams.get("city")?.trim() || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10) || 20));
    const offset = (page - 1) * limit;

    // Base WHERE conditions for active, approved properties
    const where = {
      status: { in: ["APPROVED", "ACTIVE"] },
    };

    // If city is provided, match case-insensitively using standard Prisma query
    if (rawCity) {
      const normalized = normalizeCityName(rawCity) || rawCity;
      where.city = {
        equals: normalized,
        mode: "insensitive",
      };
    }

    const [total, properties] = await Promise.all([
      prisma.listing.count({ where }),
      prisma.listing.findMany({
        where,
        include: {
          photos: {
            select: { id: true, url: true },
            take: 3,
          },
          owner: {
            select: {
              id: true,
              name: true,
              verified: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc", // Latest first
        },
        skip: offset,
        take: limit,
      }),
    ]);

    return NextResponse.json({
      properties,
      city: rawCity || null,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    });
  } catch (error) {
    console.error("GET /api/properties error:", error);
    return NextResponse.json(
      { error: "Failed to fetch properties by city." },
      { status: 500 }
    );
  }
}

