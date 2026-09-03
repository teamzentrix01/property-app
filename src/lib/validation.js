const ROLES = ["BUYER", "OWNER", "BROKER", "AREA_ADMIN", "SUPER_ADMIN"];
const PURPOSES = ["SALE", "RENT"];
const PROPERTY_TYPES = ["HOUSE", "PLOT", "FLAT", "SHOP", "SHOWROOM", "GODOWN", "OFFICE", "PG"];

export function text(value, { min = 0, max = 255, required = false } = {}) {
  if (typeof value !== "string") return required ? null : undefined;
  const trimmed = value.trim();
  if ((required && !trimmed) || trimmed.length < min || trimmed.length > max) return null;
  return trimmed;
}

export function personName(value) {
  const normalized = text(value, { min: 2, max: 80, required: true });
  return normalized && /^[A-Za-z]+(?: [A-Za-z]+)*$/.test(normalized) ? normalized : null;
}

export function email(value) {
  const normalized = text(value, { min: 3, max: 254, required: true })?.toLowerCase();
  return normalized && /^[a-z0-9][a-z0-9._%+-]{0,63}@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/.test(normalized) ? normalized : null;
}

export function phone(value) {
  return typeof value === "string" && /^[6-9]\d{9}$/.test(value) ? value : null;
}

export function number(value, { min = 0, max = Number.MAX_SAFE_INTEGER, integer = false } = {}) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) && parsed >= min && parsed <= max && (!integer || Number.isInteger(parsed)) ? parsed : null;
}

export function enumValue(value, choices) {
  return choices.includes(value) ? value : null;
}

export function normalizeListingRequiredFields(input = {}) {
  const digits = String(input.contactNumber ?? "").replace(/\D/g, "");
  const contactNumber = digits.length === 12 && digits.startsWith("91") ? digits.slice(2) : digits;
  const parsedPrice = typeof input.price === "number" ? input.price : Number(input.price);
  return {
    title: typeof input.title === "string" ? input.title.trim() : "",
    city: typeof input.city === "string" ? input.city.trim() : "",
    area: typeof input.area === "string" ? input.area.trim() : "",
    price: Number.isFinite(parsedPrice) ? parsedPrice : null,
    contactNumber,
    propertyType: typeof input.propertyType === "string" ? input.propertyType.trim() : "",
    purpose: typeof input.purpose === "string" ? input.purpose.trim() : "",
    photos: Array.isArray(input.photos) ? input.photos : [],
  };
}

export function validateListingRequiredFields(input, { validatePhotoUrls = false } = {}) {
  const fields = normalizeListingRequiredFields(input);
  const errors = [];
  if (fields.title.length < 5) errors.push("Title must be at least 5 characters");
  else if (fields.title.length > 160) errors.push("Title must be 160 characters or less");
  if (fields.city.length < 2) errors.push("City is required");
  else if (fields.city.length > 80) errors.push("City must be 80 characters or less");
  if (fields.area.length < 2) errors.push("Locality is required");
  else if (fields.area.length > 80) errors.push("Locality must be 80 characters or less");
  if (fields.price === null || fields.price < 1 || fields.price > 100000000000) errors.push("Enter a valid price");
  if (!/^[6-9]\d{9}$/.test(fields.contactNumber)) errors.push("Enter a valid 10-digit Indian mobile number");
  if (!PURPOSES.includes(fields.purpose)) errors.push("Purpose is required");
  if (!PROPERTY_TYPES.includes(fields.propertyType)) errors.push("Property type is required");
  if (fields.photos.length < 1) errors.push("Please upload at least 1 property photo");
  else if (fields.photos.length > 12) errors.push("You can upload a maximum of 12 property photos");
  else if (validatePhotoUrls && fields.photos.some((url) => typeof url !== "string" || !url.startsWith("https://res.cloudinary.com/dwvfedqrb/image/upload/"))) errors.push("One or more property photos are invalid");
  return { fields, errors };
}

export { ROLES, PURPOSES, PROPERTY_TYPES };
