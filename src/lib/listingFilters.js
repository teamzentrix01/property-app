import { PROPERTY_TYPES, PURPOSES, enumValue, number, text } from "@/lib/validation";

const PROPERTY_TYPE_ALIASES = {
  APARTMENT: ["FLAT"],
  VILLA: ["HOUSE"],
  VILLAS: ["HOUSE"],
  "INDEPENDENT HOUSE": ["HOUSE"],
  COMMERCIAL: ["SHOP", "SHOWROOM", "GODOWN", "OFFICE"],
};

function read(params, key) {
  return typeof params?.get === "function" ? params.get(key) : params?.[key];
}

function optionalNumber(params, key, options) {
  const value = read(params, key);
  if (value === null || value === undefined || value === "") return undefined;
  return number(value, options);
}

export function listingFilters(params) {
  const where = {};
  const city = text(read(params, "city"), { max: 80 });
  const area = text(read(params, "area"), { max: 80 });
  const search = text(read(params, "search"), { max: 100 });
  const rawPurpose = String(read(params, "purpose") || "").toUpperCase();
  const purpose = rawPurpose === "BUY" ? "SALE" : rawPurpose;
  const rawPropertyType = String(read(params, "propertyType") || "").trim().toUpperCase();
  const propertyTypes = PROPERTY_TYPE_ALIASES[rawPropertyType] || (PROPERTY_TYPES.includes(rawPropertyType) ? [rawPropertyType] : []);
  const bedrooms = optionalNumber(params, "bedrooms", { min: 0, max: 100, integer: true });
  const bathrooms = optionalNumber(params, "bathrooms", { min: 0, max: 100, integer: true });
  const minPrice = optionalNumber(params, "minPrice", { min: 0, max: 100000000000 });
  const maxPrice = optionalNumber(params, "maxPrice", { min: 0, max: 100000000000 });
  const minArea = optionalNumber(params, "minArea", { min: 0, max: 10000000 });
  const maxArea = optionalNumber(params, "maxArea", { min: 0, max: 10000000 });
  const furnishing = read(params, "furnishing");
  const postedBy = read(params, "postedBy");

  if (read(params, "purpose") && !enumValue(purpose, PURPOSES)) return { error: "Invalid buy/rent filter." };
  if (read(params, "propertyType") && !propertyTypes.length) return { error: "Invalid property type filter." };
  if ([bedrooms, bathrooms, minPrice, maxPrice, minArea, maxArea].some((value) => value === null)) return { error: "One or more numeric filters are invalid." };
  if ((minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) || (minArea !== undefined && maxArea !== undefined && minArea > maxArea)) return { error: "Minimum values cannot be greater than maximum values." };
  if (furnishing && !["UNFURNISHED", "SEMI_FURNISHED", "FULLY_FURNISHED"].includes(furnishing)) return { error: "Invalid furnishing filter." };
  if (postedBy && !["BUYER", "OWNER", "BROKER"].includes(postedBy)) return { error: "Invalid posted-by filter." };

  if (city) where.city = { contains: city, mode: "insensitive" };
  if (area) where.area = { contains: area, mode: "insensitive" };
  if (purpose) where.purpose = purpose;
  if (propertyTypes.length) where.propertyType = propertyTypes.length === 1 ? propertyTypes[0] : { in: propertyTypes };
  if (bedrooms !== undefined) where.bedrooms = bedrooms;
  if (bathrooms !== undefined) where.bathrooms = bathrooms;
  if (furnishing) where.furnishing = furnishing;
  if (postedBy) where.postedBy = postedBy;
  if (minPrice !== undefined || maxPrice !== undefined) where.price = { ...(minPrice !== undefined ? { gte: minPrice } : {}), ...(maxPrice !== undefined ? { lte: maxPrice } : {}) };
  if (minArea !== undefined || maxArea !== undefined) where.sizeValue = { ...(minArea !== undefined ? { gte: minArea } : {}), ...(maxArea !== undefined ? { lte: maxArea } : {}) };
  if (search) {
    const clauses = ["title", "city", "area", "nearbyLandmark", "description"].map((field) => ({ [field]: { contains: search, mode: "insensitive" } }));
    const bhk = search.match(/^(\d+)\s*bhk$/i);
    if (bhk) clauses.push({ bedrooms: Number(bhk[1]) });
    const searchTypes = PROPERTY_TYPE_ALIASES[search.toUpperCase()] || (PROPERTY_TYPES.includes(search.toUpperCase()) ? [search.toUpperCase()] : []);
    if (searchTypes.length) clauses.push({ propertyType: searchTypes.length === 1 ? searchTypes[0] : { in: searchTypes } });
    where.OR = clauses;
  }
  return { where, error: null };
}
