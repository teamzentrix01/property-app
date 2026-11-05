import { prisma } from "@/lib/prisma";
import { serializeForClient } from "@/lib/formatters";
import { INDIAN_CITIES, parseLocationString } from "@/lib/indianLocations";

/**
 * Knowledge Base for Bhoomi FAQs, Policies, and Site Navigation
 */
export const BHOOMI_KNOWLEDGE = {
  about: "Bhoomi is India's premium real estate platform providing 100% verified listings, direct-from-owner and broker options, DMA/MDA approval badges, and zero hidden fees across Moradabad, Meerut, Rampur, Noida, Gurugram, Delhi NCR and all major Indian cities.",
  services: [
    "Residential properties: Plots, Independent Houses, Apartments, Villas, Builder Floors",
    "Commercial properties: Shops, Showrooms, Godowns, Offices, Commercial SCO Plots",
    "Co-living & Rental properties: PG and Rental flats",
    "Verified Listings: Properties inspected and verified with DMA/MDA/RERA approvals",
    "Dealer & Owner Inquiries: Direct connection with verified property dealers & owners",
  ],
  postingGuide: "To post a property on Bhoomi, click on 'Post Property' in the navbar or visit /post-property. If you don't have an account, sign up or log in. Verified owners and brokers can list plots, flats, houses, shops, and offices with photos, pricing, and exact locations.",
  verificationInfo: "Bhoomi displays 'Verified Listing' for admin-checked properties and '✓ MDA Approved' / '✓ DMA Approved' badges for government development authority approvals. RERA numbers are prominently displayed when registered.",
  contactSupport: "You can reach Bhoomi Support via email at bhoomiproperty7@gmail.com, or submit an inquiry directly through Nia to connect with our regional property dealers.",
};

/**
 * Extract search intent, filters, budget, property type from natural language input
 */
export function extractPropertySearchCriteria(text = "", conversationHistory = []) {
  const combined = [
    ...conversationHistory.map((m) => m.content || ""),
    text,
  ].join(" ").toLowerCase();

  const current = text.toLowerCase();

  // 1. Property Type detection
  let propertyType = null;
  if (/(plot|land|zameen|bhoomi)/i.test(combined)) propertyType = "PLOT";
  else if (/(flat|apartment|bhk|condo)/i.test(combined)) propertyType = "FLAT";
  else if (/(house|villa|kothi|banglow|independent house|makan|ghar)/i.test(combined)) propertyType = "HOUSE";
  else if (/(shop|dukaan)/i.test(combined)) propertyType = "SHOP";
  else if (/(showroom)/i.test(combined)) propertyType = "SHOWROOM";
  else if (/(office|workspace)/i.test(combined)) propertyType = "OFFICE";
  else if (/(godown|warehouse)/i.test(combined)) propertyType = "GODOWN";
  else if (/(pg|hostel|co-living)/i.test(combined)) propertyType = "PG";

  // 2. Purpose (Buy / Rent)
  let purpose = null;
  if (/(rent|kiraya|lease|tenant|pg)/i.test(combined)) purpose = "RENT";
  else if (/(buy|purchase|khareedna|sale|invest)/i.test(combined)) purpose = "SALE";

  // 3. City & Location detection from Indian cities list & keywords
  let detectedCity = null;
  const knownCities = [
    "moradabad", "meerut", "rampur", "noida", "greater noida",
    "ghaziabad", "gurugram", "gurgaon", "delhi", "lucknow",
    "bareilly", "bareily", "agra", "mathura", "aligarh", "dehradun",
    "haridwar", "jaipur", "chandigarh", "faridabad"
  ];

  for (const c of knownCities) {
    if (combined.includes(c)) {
      if (c === "gurgaon") detectedCity = "Gurugram";
      else if (c === "bareily") detectedCity = "Bareilly";
      else detectedCity = c.charAt(0).toUpperCase() + c.slice(1);
      break;
    }
  }

  // 4. Locality / Sector detection (e.g. "sector 12", "golf course road", "durga chauk", "near kia showroom")
  let detectedLocality = null;
  const sectorMatch = combined.match(/(sector\s*\d+|sec\s*\d+)/i);
  if (sectorMatch) {
    detectedLocality = sectorMatch[1];
  }

  // 5. Budget extraction (e.g. "50 lakh", "50-70 lakhs", "1.5 cr", "30000 rent", "under 40 l")
  let minPrice = null;
  let maxPrice = null;

  // Lakh patterns
  const croreMatch = combined.match(/(\d+(?:\.\d+)?)\s*(?:cr|crore|crores)/i);
  if (croreMatch) {
    const val = parseFloat(croreMatch[1]) * 10000000;
    maxPrice = val;
  }

  const lakhRangeMatch = combined.match(/(\d+)\s*(?:to|-)\s*(\d+)\s*(?:lakh|lakhs|lacs|lac|l\b)/i);
  if (lakhRangeMatch) {
    minPrice = parseInt(lakhRangeMatch[1], 10) * 100000;
    maxPrice = parseInt(lakhRangeMatch[2], 10) * 100000;
  } else {
    const singleLakhMatch = combined.match(/(?:under|below|upto|within|budget(?:\s*of)?)\s*(\d+)\s*(?:lakh|lakhs|lacs|lac|l\b)/i);
    if (singleLakhMatch) {
      maxPrice = parseInt(singleLakhMatch[1], 10) * 100000;
    } else {
      const plainLakh = combined.match(/(\d+)\s*(?:lakh|lakhs|lacs|lac|l\b)/i);
      if (plainLakh) {
        maxPrice = parseInt(plainLakh[1], 10) * 100000 * 1.25; // 25% tolerance
        minPrice = parseInt(plainLakh[1], 10) * 100000 * 0.75;
      }
    }
  }

  // 6. BHK detection
  let bedrooms = null;
  const bhkMatch = combined.match(/(\d+)\s*(?:bhk|bedroom|bed)/i);
  if (bhkMatch) {
    bedrooms = parseInt(bhkMatch[1], 10);
  }

  return {
    propertyType,
    purpose,
    city: detectedCity,
    locality: detectedLocality,
    minPrice,
    maxPrice,
    bedrooms,
    wantsInquiry: /(dealer|broker|agent|contact|call me|visit|callback|phone number|schedule visit|talk to|inquiry|enquiry)/i.test(current),
  };
}

/**
 * Query real properties from Bhoomi's PostgreSQL database with exact & smart fallback
 */
export async function searchPropertiesForNia(criteria, options = {}) {
  const { limit = 4, excludeId = null } = options;

  if (!process.env.DATABASE_URL) {
    return { exactCount: 0, properties: [], matchType: "none" };
  }

  const baseWhere = {
    status: { in: ["APPROVED", "ACTIVE"] },
    ...(excludeId ? { id: { not: excludeId } } : {}),
  };

  if (criteria.purpose) {
    baseWhere.purpose = criteria.purpose;
  }

  if (criteria.propertyType) {
    baseWhere.propertyType = criteria.propertyType;
  }

  if (criteria.bedrooms) {
    baseWhere.bedrooms = criteria.bedrooms;
  }

  if (criteria.minPrice || criteria.maxPrice) {
    baseWhere.price = {};
    if (criteria.minPrice) baseWhere.price.gte = criteria.minPrice;
    if (criteria.maxPrice) baseWhere.price.lte = criteria.maxPrice;
  }

  // Try exact location first
  let exactWhere = { ...baseWhere };
  if (criteria.city) {
    exactWhere.city = { contains: criteria.city, mode: "insensitive" };
  }
  if (criteria.locality) {
    exactWhere.area = { contains: criteria.locality, mode: "insensitive" };
  }

  let exactMatches = await prisma.listing.findMany({
    where: exactWhere,
    include: {
      photos: { take: 3 },
      owner: { select: { id: true, name: true, verified: true, role: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  if (exactMatches.length > 0) {
    return {
      properties: serializeForClient(exactMatches),
      matchType: "exact",
      city: criteria.city,
      count: exactMatches.length,
    };
  }

  // Fallback 1: City match if locality was too strict
  if (criteria.city && criteria.locality) {
    const cityMatches = await prisma.listing.findMany({
      where: {
        ...baseWhere,
        city: { contains: criteria.city, mode: "insensitive" },
      },
      include: {
        photos: { take: 3 },
        owner: { select: { id: true, name: true, verified: true, role: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    if (cityMatches.length > 0) {
      return {
        properties: serializeForClient(cityMatches),
        matchType: "same_city",
        city: criteria.city,
        count: cityMatches.length,
      };
    }
  }

  // Fallback 2: Nearby cities or properties in the same category
  const fallbackMatches = await prisma.listing.findMany({
    where: {
      status: { in: ["APPROVED", "ACTIVE"] },
      ...(criteria.propertyType ? { propertyType: criteria.propertyType } : {}),
      ...(criteria.purpose ? { purpose: criteria.purpose } : {}),
    },
    include: {
      photos: { take: 3 },
      owner: { select: { id: true, name: true, verified: true, role: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return {
    properties: serializeForClient(fallbackMatches),
    matchType: fallbackMatches.length > 0 ? "nearby_fallback" : "none",
    city: criteria.city,
    count: fallbackMatches.length,
  };
}

