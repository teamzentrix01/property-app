import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { serializeForClient } from "@/lib/formatters";

// In-memory rate limiting map: IP -> array of timestamps
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_REQUESTS_PER_WINDOW = 30; // Max 30 requests per minute per IP

function isRateLimited(ip) {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) || [];
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

  if (recent.length >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }

  recent.push(now);
  rateLimitMap.set(ip, recent);

  // Periodic cleanup if map grows
  if (rateLimitMap.size > 2000) {
    for (const [key, list] of rateLimitMap.entries()) {
      const valid = list.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
      if (valid.length === 0) rateLimitMap.delete(key);
      else rateLimitMap.set(key, valid);
    }
  }

  return false;
}

export async function GET(req) {
  try {
    // 1. Client IP and Rate Limiting
    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : req.headers.get("x-real-ip") || "127.0.0.1";

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please slow down (rate limit exceeded)." },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(req.url);

    // 2. Validate query parameters
    const rawLat = searchParams.get("lat");
    const rawLng = searchParams.get("lng");
    const rawRadius = searchParams.get("radius");
    const rawPage = searchParams.get("page");
    const rawLimit = searchParams.get("limit");

    if (!rawLat || !rawLng) {
      return NextResponse.json(
        { error: "Latitude (lat) and Longitude (lng) query parameters are required." },
        { status: 400 }
      );
    }

    const lat = parseFloat(rawLat);
    const lng = parseFloat(rawLng);

    // Validation: Check valid numeric range
    if (isNaN(lat) || lat < -90 || lat > 90) {
      return NextResponse.json(
        { error: "Invalid latitude. Lat must be between -90 and 90." },
        { status: 400 }
      );
    }

    if (isNaN(lng) || lng < -180 || lng > 180) {
      return NextResponse.json(
        { error: "Invalid longitude. Lng must be between -180 and 180." },
        { status: 400 }
      );
    }

    // Radius validation: default 10 km, max 50 km, min 1 km
    let radius = parseFloat(rawRadius) || 10;
    if (isNaN(radius) || radius <= 0) radius = 10;
    if (radius > 50) radius = 50;

    // Pagination: default page 1, limit 20
    const page = Math.max(1, parseInt(rawPage || "1", 10) || 1);
    const limit = Math.min(20, Math.max(1, parseInt(rawLimit || "20", 10) || 20));
    const offset = (page - 1) * limit;

    // 3. Fast Bounding Box Pre-filter using mapLat/mapLng index
    const latDelta = radius / 111;
    const lngDelta = radius / (111 * Math.cos((lat * Math.PI) / 180));

    const minLat = lat - latDelta;
    const maxLat = lat + latDelta;
    const minLng = lng - lngDelta;
    const maxLng = lng + lngDelta;

    // 4. SQL Injection Free Parameterized Query with Haversine Formula
    const nearbyListings = await prisma.$queryRaw`
      SELECT 
        l.id,
        l.title,
        l.city,
        l.area,
        l.state,
        l.price,
        l.purpose,
        l."propertyType",
        l."postedBy",
        l.status,
        l."sizeValue",
        l."sizeUnit",
        l."roadWidthFt",
        l.bedrooms,
        l.bathrooms,
        l.facing,
        l."nearbyLandmark",
        l."mapLat",
        l."mapLng",
        l."createdAt",
        ROUND(
          (6371 * acos(
            least(1.0, greatest(-1.0,
              cos(radians(${lat})) * cos(radians(l."mapLat")) *
              cos(radians(l."mapLng") - radians(${lng})) +
              sin(radians(${lat})) * sin(radians(l."mapLat"))
            ))
          ))::numeric, 2
        ) AS distance_km
      FROM "Listing" l
      WHERE l.status IN ('APPROVED', 'ACTIVE')
        AND l.blocked = false
        AND l."mapLat" IS NOT NULL
        AND l."mapLng" IS NOT NULL
        AND l."mapLat" BETWEEN ${minLat} AND ${maxLat}
        AND l."mapLng" BETWEEN ${minLng} AND ${maxLng}
        AND (
          6371 * acos(
            least(1.0, greatest(-1.0,
              cos(radians(${lat})) * cos(radians(l."mapLat")) *
              cos(radians(l."mapLng") - radians(${lng})) +
              sin(radians(${lat})) * sin(radians(l."mapLat"))
            ))
          )
        ) <= ${radius}
      ORDER BY distance_km ASC, l."createdAt" DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    // Count total matching properties within radius for pagination
    const totalCountResult = await prisma.$queryRaw`
      SELECT COUNT(*)::int AS count
      FROM "Listing" l
      WHERE l.status IN ('APPROVED', 'ACTIVE')
        AND l.blocked = false
        AND l."mapLat" IS NOT NULL
        AND l."mapLng" IS NOT NULL
        AND l."mapLat" BETWEEN ${minLat} AND ${maxLat}
        AND l."mapLng" BETWEEN ${minLng} AND ${maxLng}
        AND (
          6371 * acos(
            least(1.0, greatest(-1.0,
              cos(radians(${lat})) * cos(radians(l."mapLat")) *
              cos(radians(l."mapLng") - radians(${lng})) +
              sin(radians(${lat})) * sin(radians(l."mapLat"))
            ))
          )
        ) <= ${radius}
    `;

    const total = totalCountResult[0]?.count || 0;

    // Attach photos
    const listingIds = nearbyListings.map((l) => l.id);
    let photosMap = {};
    if (listingIds.length > 0) {
      const photos = await prisma.photo.findMany({
        where: { listingId: { in: listingIds } },
        select: { id: true, url: true, listingId: true },
      });
      photos.forEach((p) => {
        if (!photosMap[p.listingId]) photosMap[p.listingId] = [];
        photosMap[p.listingId].push(p);
      });
    }

    const formattedListings = nearbyListings.map((item) => ({
      ...item,
      distance_km: item.distance_km !== null ? parseFloat(item.distance_km) : null,
      photos: photosMap[item.id] || [],
    }));

    return NextResponse.json({
      success: true,
      properties: serializeForClient(formattedListings),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      radius_km: radius,
    });
  } catch (error) {
    console.error("GET /api/properties/nearby error:", error);
    return NextResponse.json(
      { error: "Server error fetching nearby properties." },
      { status: 500 }
    );
  }
}
