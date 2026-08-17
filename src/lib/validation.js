const ROLES = ["BUYER", "OWNER", "BROKER", "AREA_ADMIN", "SUPER_ADMIN"];
const PURPOSES = ["SALE", "RENT"];
const PROPERTY_TYPES = ["HOUSE", "PLOT", "FLAT", "SHOP", "SHOWROOM", "GODOWN", "OFFICE", "PG"];

export function text(value, { min = 0, max = 255, required = false } = {}) {
  if (typeof value !== "string") return required ? null : undefined;
  const trimmed = value.trim();
  if ((required && !trimmed) || trimmed.length < min || trimmed.length > max) return null;
  return trimmed;
}

export function email(value) {
  const normalized = text(value, { min: 3, max: 254, required: true })?.toLowerCase();
  return normalized && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized) ? normalized : null;
}

export function phone(value) {
  const normalized = typeof value === "string" ? value.replace(/[\s-]/g, "") : "";
  return /^\+?[1-9]\d{7,14}$/.test(normalized) ? normalized : null;
}

export function number(value, { min = 0, max = Number.MAX_SAFE_INTEGER, integer = false } = {}) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) && parsed >= min && parsed <= max && (!integer || Number.isInteger(parsed)) ? parsed : null;
}

export function enumValue(value, choices) {
  return choices.includes(value) ? value : null;
}

export { ROLES, PURPOSES, PROPERTY_TYPES };
