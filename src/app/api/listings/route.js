import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/serverAuth";
import { enumValue, number, PURPOSES, PROPERTY_TYPES, text, validateListingRequiredFields } from "@/lib/validation";
import { notifyEmail } from "@/lib/mailer";
import { categoryFromSlug } from "@/lib/contentCategories";
import { listingFilters } from "@/lib/listingFilters";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const where = {};
  const ownerId = searchParams.get("ownerId");
  if (ownerId === "me") {
    const auth = await requireUser();
    if (!auth.user) return NextResponse.json({ error: auth.error }, { status: auth.status });
    where.ownerId = auth.user.id;
  } else where.status = "APPROVED";
  const categorySlug = searchParams.get("category");
  const { where: filters, error } = listingFilters(searchParams);
  if (error) return NextResponse.json({ error }, { status: 400 });
  Object.assign(where, filters);
  if (categorySlug) {
    const category = categoryFromSlug(categorySlug);
    if (!category) return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    where.categories = { some: { category: category.value } };
  }
  const listings = await prisma.listing.findMany({ where, include: { photos: true, categories: true }, orderBy: { createdAt: "desc" }, take: 60 });
  return NextResponse.json({ listings });
}

export async function POST(req) {
  const auth = await requireUser();
  if (!auth.user) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  const normalized = validateListingRequiredFields(body, { validatePhotoUrls: true });
  if (normalized.errors.length) return NextResponse.json({ error: normalized.errors[0], errors: normalized.errors }, { status: 400 });
  const { fields } = normalized;
  const { title, city, area, contactNumber, price, purpose, propertyType } = fields;
  const photos = [...new Set(fields.photos)];
  const allowedCategories = new Set(["CITIES", "APARTMENT", "LUXURY", "BRANDED", "VILLAS", "COMMERCIAL", "RENTAL"]);
  const categories = Array.isArray(body.categories)
    ? [...new Set(body.categories.map((category) => String(category).trim().toUpperCase()))]
    : [];
  if (categories.some((category) => !allowedCategories.has(category))) return NextResponse.json({ error: "One or more selected categories are invalid" }, { status: 400 });
  const optionalText = (key, max = 500) => text(body[key], { max });
  const optionalNumber = (key, options) => body[key] === undefined || body[key] === "" ? undefined : number(body[key], options);
  const data = {
    title, city, area, contactNumber, price, purpose, propertyType, postedBy: auth.user.role, ownerId: auth.user.id, status: "PENDING",
    sizeValue: optionalNumber("sizeValue", { min: 0, max: 10000000 }), plotLength: optionalNumber("plotLength", { min: 0, max: 100000 }), plotWidth: optionalNumber("plotWidth", { min: 0, max: 100000 }), roadWidthFt: optionalNumber("roadWidthFt", { min: 0, max: 10000 }), mapLat: optionalNumber("mapLat", { min: -90, max: 90 }), mapLng: optionalNumber("mapLng", { min: -180, max: 180 }),
    bedrooms: optionalNumber("bedrooms", { min: 0, max: 100, integer: true }), bathrooms: optionalNumber("bathrooms", { min: 0, max: 100, integer: true }), floorNumber: optionalNumber("floorNumber", { min: 0, max: 500, integer: true }), totalFloors: optionalNumber("totalFloors", { min: 0, max: 500, integer: true }), propertyAgeYears: optionalNumber("propertyAgeYears", { min: 0, max: 500, integer: true }),
    sizeUnit: optionalText("sizeUnit", 20), facing: optionalText("facing", 30), reraNumber: optionalText("reraNumber", 100), nearbyLandmark: optionalText("nearbyLandmark", 160), description: optionalText("description", 5000),
    amenities: Array.isArray(body.amenities) ? body.amenities.filter((item) => typeof item === "string").map((item) => item.trim()).filter(Boolean).slice(0, 20).map((item) => item.slice(0, 60)) : [],
    isCornerPlot: typeof body.isCornerPlot === "boolean" ? body.isCornerPlot : undefined, negotiable: typeof body.negotiable === "boolean" ? body.negotiable : undefined, loanAvailable: typeof body.loanAvailable === "boolean" ? body.loanAvailable : undefined, authorityApproved: typeof body.authorityApproved === "boolean" ? body.authorityApproved : undefined,
  };
  const enumFields = {
    furnishing: ["UNFURNISHED", "SEMI_FURNISHED", "FULLY_FURNISHED"],
    possession: ["READY_TO_MOVE", "UNDER_CONSTRUCTION"],
    ownershipType: ["FREEHOLD", "LEASEHOLD", "POWER_OF_ATTORNEY"],
  };
  for (const [key, choices] of Object.entries(enumFields)) {
    if (body[key]) data[key] = enumValue(body[key], choices);
  }
  if (Object.values(data).some((value) => value === null)) return NextResponse.json({ error: "One or more optional fields are invalid" }, { status: 400 });
  const listing = await prisma.listing.create({ data: { ...data, photos: { create: photos.map((url) => ({ url })) }, categories: { create: categories.map((category) => ({ category })) } }, include: { photos: true, categories: true } });
  const origin = new URL(req.url).origin;
  notifyEmail({ to: auth.user.email, subject: "Your property is under review", heading: "Listing submitted", message: `“${listing.title}” has been submitted for review. We will notify you when its status changes.`, action: { label: "View dashboard", url: `${origin}/dashboard` } });
  const reviewers = await prisma.user.findMany({ where: { OR: [{ role: "SUPER_ADMIN" }, { role: "AREA_ADMIN", adminArea: listing.city }] }, select: { email: true } });
  reviewers.forEach((reviewer) => notifyEmail({ to: reviewer.email, subject: "New listing awaiting review", heading: "A new property needs review", message: `“${listing.title}” was submitted in ${listing.city}.`, action: { label: "Review listing", url: `${origin}/dashboard` } }));
  return NextResponse.json({ listing }, { status: 201 });
}
