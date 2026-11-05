import { prisma } from "./prisma.js";
import { serializeForClient } from "./formatters.js";
import {
  parseLocationString,
  getNearbyCities,
  getDistanceKm,
  INDIAN_CITIES,
} from "./indianLocations.js";

const DEFAULT_INCLUDE = {
  photos: true,
  owner: { select: { verified: true, name: true, role: true } },
};

/**
 * Fetch smart personalized property recommendations based on user's preferred location.
 * Implements 5-tier intelligent prioritization:
 *  1. Exact Locality / Sector
 *  2. Other Localities in same City
 *  3. Nearby Areas / Cities within 5-50km
 *  4. Surrounding Regional Cities
 *  5. Graceful fallback of active approved properties (so no empty experience)
 */
export async function getUserLocationRecommendations(preferredLocationInput, options = {}) {
  const { limit = 16, excludeIds = [] } = options;

  if (!process.env.DATABASE_URL) {
    return {
      searchedLocation: "",
      city: "",
      exactProperties: [],
      nearbyProperties: [],
      surroundingCityProperties: [],
      allRecommendations: [],
      isFallback: false,
    };
  }

  const locationInfo =
    typeof preferredLocationInput === "object" && preferredLocationInput !== null
      ? {
          city: preferredLocationInput.preferredCity || preferredLocationInput.city,
          locality: preferredLocationInput.preferredLocation || preferredLocationInput.locality,
          lat: preferredLocationInput.preferredLat || preferredLocationInput.lat,
          lng: preferredLocationInput.preferredLng || preferredLocationInput.lng,
        }
      : parseLocationString(String(preferredLocationInput || ""));

  const targetCity = (locationInfo.city || "").trim();
  const targetLocality = (locationInfo.locality || "").trim();

  // If no location preference provided, return top approved listings
  if (!targetCity && !targetLocality) {
    const fallbackListings = await prisma.listing.findMany({
      where: {
        status: { in: ["APPROVED", "ACTIVE"] },
        id: { notIn: excludeIds },
      },
      include: DEFAULT_INCLUDE,
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    const serialized = serializeForClient(fallbackListings);
    return {
      searchedLocation: "All Locations",
      city: "",
      exactProperties: serialized,
      nearbyProperties: [],
      surroundingCityProperties: [],
      allRecommendations: serialized,
      isFallback: false,
    };
  }

  const seenIds = new Set(excludeIds);
  const exactProperties = [];
  const nearbyProperties = [];
  const surroundingCityProperties = [];

  // Helper to add listing safely without duplicates
  function addListing(listing, targetBucket, badge = null) {
    if (!listing || !listing.id || seenIds.has(listing.id)) return false;
    seenIds.add(listing.id);
    const item = { ...listing };
    if (badge) item.locationBadge = badge;
    targetBucket.push(item);
    return true;
  }

  // Tier 1: Exact Locality/Sector matches (if locality exists)
  if (targetLocality && targetCity) {
    try {
      const tier1 = await prisma.listing.findMany({
        where: {
          status: { in: ["APPROVED", "ACTIVE"] },
          city: { equals: targetCity, mode: "insensitive" },
          area: { contains: targetLocality, mode: "insensitive" },
          id: { notIn: Array.from(seenIds) },
        },
        include: DEFAULT_INCLUDE,
        orderBy: { createdAt: "desc" },
        take: limit,
      });

      tier1.forEach((l) => addListing(l, exactProperties, `${l.area}, ${l.city}`));
    } catch (e) {
      console.warn("Tier 1 location query error:", e.message);
    }
  }

  // Tier 2: Same City matches
  if (targetCity && exactProperties.length < limit) {
    try {
      const tier2 = await prisma.listing.findMany({
        where: {
          status: { in: ["APPROVED", "ACTIVE"] },
          city: { equals: targetCity, mode: "insensitive" },
          id: { notIn: Array.from(seenIds) },
        },
        include: DEFAULT_INCLUDE,
        orderBy: { createdAt: "desc" },
        take: limit - exactProperties.length,
      });

      tier2.forEach((l) => addListing(l, exactProperties, `${l.area}, ${l.city}`));
    } catch (e) {
      console.warn("Tier 2 city query error:", e.message);
    }
  }

  // Tier 3: Nearby / Adjacent Cities (e.g. For Delhi -> Noida, Greater Noida, Ghaziabad, Gurugram, Faridabad)
  const nearbyCityList = getNearbyCities(targetCity, 70);
  if (nearbyCityList.length > 0) {
    try {
      const tier3 = await prisma.listing.findMany({
        where: {
          status: { in: ["APPROVED", "ACTIVE"] },
          city: { in: nearbyCityList, mode: "insensitive" },
          id: { notIn: Array.from(seenIds) },
        },
        include: DEFAULT_INCLUDE,
        orderBy: { createdAt: "desc" },
        take: limit,
      });

      // Sort Tier 3 by geographic proximity if coordinates are available
      const referenceCityObj = INDIAN_CITIES.find(
        (c) => c.city.toLowerCase() === targetCity.toLowerCase()
      );

      tier3.sort((a, b) => {
        if (!referenceCityObj?.lat || !referenceCityObj?.lng) return 0;
        const distA = a.mapLat && a.mapLng ? getDistanceKm(referenceCityObj.lat, referenceCityObj.lng, a.mapLat, a.mapLng) : 999;
        const distB = b.mapLat && b.mapLng ? getDistanceKm(referenceCityObj.lat, referenceCityObj.lng, b.mapLat, b.mapLng) : 999;
        return (distA || 999) - (distB || 999);
      });

      tier3.forEach((l) => {
        const badge = `Nearby in ${l.city}`;
        addListing(l, nearbyProperties, badge);
      });
    } catch (e) {
      console.warn("Tier 3 nearby city query error:", e.message);
    }
  }

  // Tier 4: Broad fallback of other approved active listings if total count is still low
  const totalFound = exactProperties.length + nearbyProperties.length;
  if (totalFound < 6) {
    try {
      const tier4 = await prisma.listing.findMany({
        where: {
          status: { in: ["APPROVED", "ACTIVE"] },
          id: { notIn: Array.from(seenIds) },
        },
        include: DEFAULT_INCLUDE,
        orderBy: { createdAt: "desc" },
        take: limit - totalFound,
      });

      tier4.forEach((l) => {
        addListing(l, surroundingCityProperties, `Available in ${l.city}`);
      });
    } catch (e) {
      console.warn("Tier 4 broad fallback query error:", e.message);
    }
  }

  const allRecommendations = [
    ...exactProperties,
    ...nearbyProperties,
    ...surroundingCityProperties,
  ];

  return {
    searchedLocation: targetLocality ? `${targetLocality}, ${targetCity}` : targetCity,
    city: targetCity,
    locality: targetLocality,
    exactProperties: serializeForClient(exactProperties),
    nearbyProperties: serializeForClient(nearbyProperties),
    surroundingCityProperties: serializeForClient(surroundingCityProperties),
    allRecommendations: serializeForClient(allRecommendations),
    isFallback: exactProperties.length === 0 && allRecommendations.length > 0,
    hasExactMatches: exactProperties.length > 0,
  };
}

/**
 * Smart location search with automatic nearby property recommendations
 * Used for /properties and /listings search filters.
 */
export async function searchPropertiesWithSmartFallback(searchParams, userPreferredLocation = null) {
  const city = (searchParams.city || "").trim();
  const area = (searchParams.area || "").trim();
  const search = (searchParams.search || "").trim();

  const locationQuery = area || city || search || (userPreferredLocation?.preferredCity || "");

  // If no location was queried at all, return normal search
  if (!locationQuery) {
    return null;
  }

  return await getUserLocationRecommendations(locationQuery, { limit: 24 });
}

