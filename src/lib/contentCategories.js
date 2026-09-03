export const CONTENT_CATEGORIES = [
  { value: "CITIES", label: "Cities", slug: "cities" },
  { value: "APARTMENT", label: "Apartments", slug: "apartment" },
  { value: "LUXURY", label: "Luxury", slug: "luxury" },
  { value: "BRANDED", label: "Branded residences", slug: "branded" },
  { value: "COMMERCIAL", label: "Commercial", slug: "commercial" },
  { value: "RENTAL", label: "Rental", slug: "rental" },
  { value: "VILLAS", label: "Villas", slug: "villas" },
];

export function categoryFromSlug(slug) {
  return CONTENT_CATEGORIES.find((category) => category.slug === slug);
}

export function toSlug(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || `post-${Date.now()}`;
}
