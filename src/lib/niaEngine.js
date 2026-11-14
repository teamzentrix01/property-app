import { prisma } from "@/lib/prisma";
import { serializeForClient } from "@/lib/formatters";

/**
 * Knowledge Base for Bhoomi FAQs, Policies, and Site Navigation
 */
export const BHOOMI_KNOWLEDGE = {
  about:
    "Bhoomi is India's premium real estate platform providing 100% verified listings, direct-from-owner and broker options, DMA/MDA approval badges, and zero hidden fees across Moradabad, Meerut, Rampur, Noida, Gurugram, Delhi NCR and all major Indian cities.",
  services: [
    "Residential properties: Plots, Independent Houses, Apartments, Villas, Builder Floors",
    "Commercial properties: Shops, Showrooms, Godowns, Offices, Commercial SCO Plots",
    "Co-living & Rental properties: PG and Rental flats",
    "Verified Listings: Properties inspected and verified with DMA/MDA/RERA approvals",
    "Dealer & Owner Inquiries: Direct connection with verified property dealers & owners",
  ],
  postingGuide:
    "To post a property on Bhoomi, click on 'Post Property' in the navbar or visit /post-property. If you don't have an account, sign up or log in. Verified owners and brokers can list plots, flats, houses, shops, and offices with photos, pricing, and exact locations.",
  verificationInfo:
    "Bhoomi displays 'Verified Listing' for admin-checked properties and '✓ MDA Approved' / '✓ DMA Approved' badges for government development authority approvals. RERA numbers are prominently displayed when registered.",
  contactSupport:
    "You can reach Bhoomi Support via email at bhoomiproperty7@gmail.com, or submit an inquiry directly through Nia to connect with our regional property dealers.",
};

// Available Cities for quick suggestions
export const RECOMMENDED_CITIES = [
  "Moradabad",
  "Meerut",
  "Rampur",
  "Delhi",
  "Noida",
  "Greater Noida",
  "Ghaziabad",
  "Lucknow",
];

// Budget options definitions
export const BUY_BUDGET_OPTIONS = [
  { label: "Under ₹20 Lakhs", min: 0, max: 2000000 },
  { label: "₹20–40 Lakhs", min: 2000000, max: 4000000 },
  { label: "₹40–60 Lakhs", min: 4000000, max: 6000000 },
  { label: "₹60–80 Lakhs", min: 6000000, max: 8000000 },
  { label: "₹80 Lakhs–1 Crore", min: 8000000, max: 10000000 },
  { label: "₹1–2 Crore", min: 10000000, max: 20000000 },
  { label: "Above ₹2 Crore", min: 20000000, max: 1000000000 },
  { label: "Flexible / Not Decided", min: 0, max: 0 },
];

export const RENT_BUDGET_OPTIONS = [
  { label: "Under ₹5,000", min: 0, max: 5000 },
  { label: "₹5,000–₹10,000", min: 5000, max: 10000 },
  { label: "₹10,000–₹20,000", min: 10000, max: 20000 },
  { label: "₹20,000–₹30,000", min: 20000, max: 30000 },
  { label: "₹30,000–₹50,000", min: 30000, max: 50000 },
  { label: "Above ₹50,000", min: 50000, max: 500000 },
  { label: "Flexible", min: 0, max: 0 },
];

export const PROPERTY_TYPE_OPTIONS = [
  { label: "Flat / Apartment", value: "FLAT" },
  { label: "Independent House", value: "HOUSE" },
  { label: "Plot / Land", value: "PLOT" },
  { label: "Office Space", value: "OFFICE" },
  { label: "Shop / Commercial", value: "SHOP" },
  { label: "PG / Co-living", value: "PG" },
];

export const BHK_OPTIONS = [
  { label: "1 BHK", value: 1 },
  { label: "2 BHK", value: 2 },
  { label: "3 BHK", value: 3 },
  { label: "4 BHK", value: 4 },
  { label: "5+ BHK", value: 5 },
  { label: "No Preference", value: 0 },
];

export const FURNISHING_OPTIONS = [
  { label: "Furnished", value: "FULLY_FURNISHED" },
  { label: "Semi-Furnished", value: "SEMI_FURNISHED" },
  { label: "Unfurnished", value: "UNFURNISHED" },
  { label: "No Specific Preference", value: "ANY" },
];

// Additional Dealer Flow Options
export const RESIDENTIAL_PREF_OPTIONS = [
  { label: "Ready to Move", value: "READY_TO_MOVE" },
  { label: "Under Construction", value: "UNDER_CONSTRUCTION" },
  { label: "Furnished", value: "FULLY_FURNISHED" },
  { label: "Semi-Furnished", value: "SEMI_FURNISHED" },
  { label: "Unfurnished", value: "UNFURNISHED" },
  { label: "No Specific Preference", value: "NO_PREF" },
];

export const PLOT_SIZE_OPTIONS = [
  { label: "100–200 sq. yard (Gaj)", value: "100-200 sq. yard" },
  { label: "200–500 sq. yard (Gaj)", value: "200-500 sq. yard" },
  { label: "500+ sq. yard (Gaj)", value: "500+ sq. yard" },
  { label: "1–2 Bigha", value: "1-2 Bigha" },
  { label: "2+ Bigha / Agricultural", value: "2+ Bigha" },
  { label: "Flexible", value: "Flexible" },
];

export const COMMERCIAL_AREA_OPTIONS = [
  { label: "Under 500 sq. ft.", value: "Under 500 sq.ft." },
  { label: "500–1,000 sq. ft.", value: "500-1,000 sq.ft." },
  { label: "1,000–3,000 sq. ft.", value: "1,000-3,000 sq.ft." },
  { label: "3,000+ sq. ft.", value: "3,000+ sq.ft." },
  { label: "Flexible", value: "Flexible" },
];

export const COMMERCIAL_USAGE_OPTIONS = [
  { label: "Retail / Shop", value: "Retail / Shop" },
  { label: "Corporate Office", value: "Corporate Office" },
  { label: "Warehouse / Godown", value: "Warehouse / Godown" },
  { label: "Restaurant / Cafe", value: "Restaurant / Cafe" },
  { label: "General Commercial", value: "General Commercial" },
];

export const CONTACT_METHOD_OPTIONS = [
  { label: "WhatsApp", value: "WhatsApp" },
  { label: "Phone Call", value: "Call" },
  { label: "Either Call or WhatsApp", value: "Either" },
];

export const HOW_TO_CONTACT_OPTIONS = [
  { label: "I want to contact a dealer about a specific property", action: "contact_specific_property" },
  { label: "I want to contact a property owner", action: "contact_property_owner" },
  { label: "I want to find dealers in my preferred location", action: "find_dealers_by_location" },
  { label: "I need help connecting with a dealer", action: "dealer_connection_help" },
];

/**
 * Natural language intent parser that extracts any property details mentioned in text
 */
export function parseNaturalLanguageIntent(text = "") {
  const t = text.toLowerCase().trim();
  const extracted = {};

  // 1. Purpose
  if (/\b(rent|kiraya|lease|tenant|pg)\b/i.test(t)) {
    extracted.purpose = "RENT";
  } else if (/\b(buy|purchase|khareedna|kharidna|sale|invest)\b/i.test(t)) {
    extracted.purpose = "SALE";
  } else if (/\b(sell|bechna|post property|list property)\b/i.test(t)) {
    extracted.intent = "SELL";
  }

  // 2. Property Type
  if (/\b(plot|plots|land|zameen|bhoomi)\b/i.test(t)) extracted.propertyType = "PLOT";
  else if (/\b(flat|flats|apartment|apartments|condo)\b/i.test(t)) extracted.propertyType = "FLAT";
  else if (/\b(house|houses|villa|villas|kothi|banglow|bungalow|independent house|makan|ghar)\b/i.test(t)) extracted.propertyType = "HOUSE";
  else if (/\b(shop|shops|dukaan|commercial)\b/i.test(t)) extracted.propertyType = "SHOP";
  else if (/\b(showroom|showrooms)\b/i.test(t)) extracted.propertyType = "SHOWROOM";
  else if (/\b(office|offices|workspace)\b/i.test(t)) extracted.propertyType = "OFFICE";
  else if (/\b(godown|warehouse)\b/i.test(t)) extracted.propertyType = "GODOWN";
  else if (/\b(pg|hostel|co-living)\b/i.test(t)) extracted.propertyType = "PG";

  // 3. City
  const knownCities = [
    "moradabad", "meerut", "rampur", "noida", "greater noida",
    "ghaziabad", "gurugram", "gurgaon", "delhi", "lucknow",
    "bareilly", "bareily", "agra", "mathura", "aligarh", "dehradun",
    "haridwar", "jaipur", "chandigarh", "faridabad"
  ];
  for (const c of knownCities) {
    if (new RegExp(`\\b${c}\\b`, "i").test(t)) {
      if (c === "gurgaon") extracted.city = "Gurugram";
      else if (c === "bareily") extracted.city = "Bareilly";
      else extracted.city = c.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
      break;
    }
  }

  // 4. Locality / Sector
  const sectorMatch = t.match(/\b(sector\s*\d+|sec\s*\d+)\b/i);
  if (sectorMatch) extracted.locality = sectorMatch[1];

  // 5. BHK
  const bhkMatch = t.match(/(\d+)\s*(?:bhk|bedroom|bed)/i);
  if (bhkMatch) extracted.bedrooms = parseInt(bhkMatch[1], 10);

  // 6. Furnishing
  if (/\b(fully furnished|full furnished)\b/i.test(t)) extracted.furnishing = "FULLY_FURNISHED";
  else if (/\b(semi furnished|semi-furnished)\b/i.test(t)) extracted.furnishing = "SEMI_FURNISHED";
  else if (/\b(unfurnished|without furniture)\b/i.test(t)) extracted.furnishing = "UNFURNISHED";

  // 7. Budget (Lakhs, Crores, or Rent thousands)
  const croreMatch = t.match(/(\d+(?:\.\d+)?)\s*(?:cr|crore|crores)\b/i);
  if (croreMatch) {
    const val = parseFloat(croreMatch[1]) * 10000000;
    extracted.maxPrice = val;
    extracted.minPrice = 0;
    extracted.budgetLabel = `Up to ₹${croreMatch[1]} Cr`;
  }

  const lakhRangeMatch = t.match(/(\d+)\s*(?:to|-)\s*(\d+)\s*(?:lakh|lakhs|lacs|lac|l\b)/i);
  if (lakhRangeMatch) {
    extracted.minPrice = parseInt(lakhRangeMatch[1], 10) * 100000;
    extracted.maxPrice = parseInt(lakhRangeMatch[2], 10) * 100000;
    extracted.budgetLabel = `₹${lakhRangeMatch[1]}–${lakhRangeMatch[2]} Lakhs`;
  } else {
    const singleLakhMatch = t.match(/(?:under|below|upto|within|budget(?:\s*of)?)\s*(\d+)\s*(?:lakh|lakhs|lacs|lac|l\b)/i);
    if (singleLakhMatch) {
      extracted.maxPrice = parseInt(singleLakhMatch[1], 10) * 100000;
      extracted.minPrice = 0;
      extracted.budgetLabel = `Under ₹${singleLakhMatch[1]} Lakhs`;
    } else {
      const plainLakh = t.match(/(\d+)\s*(?:lakh|lakhs|lacs|lac|l\b)/i);
      if (plainLakh && !extracted.maxPrice) {
        const amt = parseInt(plainLakh[1], 10) * 100000;
        extracted.minPrice = Math.max(0, amt * 0.7);
        extracted.maxPrice = amt * 1.3;
        extracted.budgetLabel = `Around ₹${plainLakh[1]} Lakhs`;
      }
    }
  }

  // Rent thousands (e.g. "15000 rent", "under 20k", "10k to 20k")
  const rentKMatch = t.match(/(\d+)\s*(?:k|thousand)\s*(?:to|-)\s*(\d+)\s*(?:k|thousand)/i);
  if (rentKMatch) {
    extracted.minPrice = parseInt(rentKMatch[1], 10) * 1000;
    extracted.maxPrice = parseInt(rentKMatch[2], 10) * 1000;
    extracted.budgetLabel = `₹${rentKMatch[1]}k–₹${rentKMatch[2]}k`;
  } else {
    const singleRentMatch = t.match(/(?:rent|under|below|budget)\s*(?:of\s*)?(\d{4,6})\b/i);
    if (singleRentMatch) {
      extracted.maxPrice = parseInt(singleRentMatch[1], 10);
      extracted.minPrice = 0;
      extracted.budgetLabel = `Up to ₹${singleRentMatch[1]}`;
    }
  }

  // 8. General inquiry / dealer request / contact dealer
  extracted.wantsSubmitDealer = /(submit dealer request|dealer request|find dealer for me|request dealer)/i.test(t);
  extracted.wantsContactDealer = /(how to contact dealer|contact dealer|contact owner|talk to dealer|call dealer|dealer number|reach dealer|find dealer)/i.test(t);
  extracted.wantsInquiry = /(dealer|broker|agent|contact|call me|visit|callback|phone number|schedule visit|talk to|inquiry|enquiry)/i.test(t);

  // 9. Verified request
  extracted.wantsVerified = /(verified|mda|dma|rera|approved)/i.test(t);

  return extracted;
}

/**
 * Search real properties from Bhoomi DB with exact and smart fallbacks
 */
export async function searchPropertiesForNia(state, options = {}) {
  const { limit = 6, excludeId = null } = options;

  if (!process.env.DATABASE_URL) {
    return { properties: [], matchType: "none", count: 0 };
  }

  const baseWhere = {
    status: { in: ["APPROVED", "ACTIVE"] },
    ...(excludeId ? { id: { not: excludeId } } : {}),
  };

  if (state.selectedPurpose) {
    baseWhere.purpose = state.selectedPurpose;
  }

  if (state.selectedPropertyType) {
    baseWhere.propertyType = state.selectedPropertyType;
  }

  if (state.selectedBHK && state.selectedBHK > 0) {
    baseWhere.bedrooms = state.selectedBHK;
  }

  if (state.selectedFurnishing && state.selectedFurnishing !== "ANY") {
    baseWhere.furnishing = state.selectedFurnishing;
  }

  if (state.minPrice || state.maxPrice) {
    baseWhere.price = {};
    if (state.minPrice && state.minPrice > 0) baseWhere.price.gte = state.minPrice;
    if (state.maxPrice && state.maxPrice > 0) baseWhere.price.lte = state.maxPrice;
  }

  // 1. Exact match with City + Locality
  let exactWhere = { ...baseWhere };
  if (state.selectedLocation) {
    exactWhere.OR = [
      { city: { contains: state.selectedLocation, mode: "insensitive" } },
      { area: { contains: state.selectedLocation, mode: "insensitive" } },
    ];
  }

  let exactMatches = await prisma.listing.findMany({
    where: exactWhere,
    include: {
      photos: { take: 3 },
      owner: { select: { id: true, name: true, phone: true, verified: true, role: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  if (exactMatches.length > 0) {
    return {
      properties: serializeForClient(exactMatches),
      matchType: "exact",
      location: state.selectedLocation,
      count: exactMatches.length,
    };
  }

  // 2. Fallback: Relax price constraint in same location
  if ((state.minPrice || state.maxPrice) && state.selectedLocation) {
    const relaxedPriceWhere = { ...baseWhere };
    delete relaxedPriceWhere.price;
    relaxedPriceWhere.OR = [
      { city: { contains: state.selectedLocation, mode: "insensitive" } },
      { area: { contains: state.selectedLocation, mode: "insensitive" } },
    ];

    const priceRelaxedMatches = await prisma.listing.findMany({
      where: relaxedPriceWhere,
      include: {
        photos: { take: 3 },
        owner: { select: { id: true, name: true, phone: true, verified: true, role: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    if (priceRelaxedMatches.length > 0) {
      return {
        properties: serializeForClient(priceRelaxedMatches),
        matchType: "price_relaxed",
        location: state.selectedLocation,
        count: priceRelaxedMatches.length,
      };
    }
  }

  // 3. Fallback: Same property type in nearby/all locations
  const fallbackTypeWhere = {
    status: { in: ["APPROVED", "ACTIVE"] },
    ...(state.selectedPurpose ? { purpose: state.selectedPurpose } : {}),
    ...(state.selectedPropertyType ? { propertyType: state.selectedPropertyType } : {}),
  };

  const nearbyMatches = await prisma.listing.findMany({
    where: fallbackTypeWhere,
    include: {
      photos: { take: 3 },
      owner: { select: { id: true, name: true, phone: true, verified: true, role: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return {
    properties: serializeForClient(nearbyMatches),
    matchType: nearbyMatches.length > 0 ? "nearby_fallback" : "none",
    location: state.selectedLocation,
    count: nearbyMatches.length,
  };
}

/**
 * Find real registered brokers or verified area dealers for a location
 */
export async function findDealersForNia(location = "") {
  if (!process.env.DATABASE_URL) return [];

  const loc = String(location || "").trim();

  // 1. Search users with role = BROKER or AREA_ADMIN
  let where = {
    role: { in: ["BROKER", "AREA_ADMIN"] },
  };

  if (loc) {
    where.OR = [
      { adminArea: { contains: loc, mode: "insensitive" } },
      { preferredCity: { contains: loc, mode: "insensitive" } },
      { preferredLocation: { contains: loc, mode: "insensitive" } },
    ];
  }

  let dealers = await prisma.user.findMany({
    where,
    select: {
      id: true,
      name: true,
      role: true,
      verified: true,
      brokerAgency: true,
      brokerBio: true,
      preferredCity: true,
      adminArea: true,
      _count: {
        select: { listings: true },
      },
    },
    take: 5,
  });

  // 2. If no dedicated broker records in that specific city, look for verified sellers/owners with active listings in that city
  if (dealers.length === 0 && loc) {
    const verifiedOwners = await prisma.user.findMany({
      where: {
        verified: true,
        listings: {
          some: {
            city: { contains: loc, mode: "insensitive" },
            status: { in: ["APPROVED", "ACTIVE"] },
          },
        },
      },
      select: {
        id: true,
        name: true,
        role: true,
        verified: true,
        brokerAgency: true,
        brokerBio: true,
        preferredCity: true,
        adminArea: true,
        _count: {
          select: { listings: true },
        },
      },
      take: 4,
    });
    dealers = verifiedOwners;
  }

  // 3. Fallback: Any verified brokers or area admins across the platform
  if (dealers.length === 0) {
    dealers = await prisma.user.findMany({
      where: {
        role: { in: ["BROKER", "AREA_ADMIN"] },
      },
      select: {
        id: true,
        name: true,
        role: true,
        verified: true,
        brokerAgency: true,
        brokerBio: true,
        preferredCity: true,
        adminArea: true,
        _count: {
          select: { listings: true },
        },
      },
      take: 4,
    });
  }

  return dealers;
}
