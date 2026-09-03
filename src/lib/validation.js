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

export { ROLES, PURPOSES, PROPERTY_TYPES };
