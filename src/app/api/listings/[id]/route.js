import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, isScopedAreaAdmin } from "@/lib/serverAuth";
import { notifyEmail } from "@/lib/mailer";
import { number, text, validateListingRequiredFields } from "@/lib/validation";
import { CONTENT_CATEGORIES } from "@/lib/contentCategories";

const include = { photos: true, categories: true, owner: { select: { name: true, phone: true, role: true, brokerAgency: true, verified: true } } };

export async function GET(req, { params }) {
  const { id } = await params;
  const listing = await prisma.listing.findUnique({ where: { id }, include });
  if (!listing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!['APPROVED', 'ACTIVE'].includes(listing.status)) {
    const auth = await requireUser();
    const canView = auth.user && (auth.user.id === listing.ownerId || auth.user.role === "SUPER_ADMIN" || (isScopedAreaAdmin(auth.user) && auth.user.adminArea === listing.city));
    if (!canView) return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ listing });
}

export async function PATCH(req, { params }) {
  const auth = await requireUser();
  if (!auth.user) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const { id } = await params;
  const listing = await prisma.listing.findUnique({ where: { id }, include: { owner: { select: { email: true } } } });
  if (!listing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const body = await req.json().catch(() => null);
  const statusOptions = ["PENDING", "UNDER_REVIEW", "APPROVED", "REJECTED", "ACTIVE", "INACTIVE"];
  if (body?.status && !body.action) {
    if (!statusOptions.includes(body.status)) return NextResponse.json({ error: "Invalid listing status" }, { status: 400 });
    const isOwner = listing.ownerId === auth.user.id;
    const isAdmin = ["AREA_ADMIN", "SUPER_ADMIN"].includes(auth.user.role);
    if (!isOwner && !isAdmin) return NextResponse.json({ error: "You do not have permission to change this listing status" }, { status: 403 });
    const rejectionReason = body.status === "REJECTED"
      ? String(body.rejectionReason || "Property details could not be verified. Please correct the listing and resubmit.").slice(0, 500)
      : body.status === "PENDING" ? null : listing.rejectionReason;
    const updated = await prisma.listing.update({ where: { id }, data: { status: body.status, rejectionReason } });
    return NextResponse.json({ listing: updated });
  }
  if (body?.action === "UPDATE") {
    if (listing.ownerId !== auth.user.id) return NextResponse.json({ error: "Only the listing owner can edit it" }, { status: 403 });
    const normalized = validateListingRequiredFields(body, { validatePhotoUrls: true });
    if (normalized.errors.length) return NextResponse.json({ error: normalized.errors[0], errors: normalized.errors }, { status: 400 });
    const { title, city, area, contactNumber, price } = normalized.fields;
    const allowedCategories = new Set(CONTENT_CATEGORIES.map(({ value }) => value));
    const categories = Array.isArray(body.categories)
      ? [...new Set(body.categories.map((category) => String(category).trim().toUpperCase()))]
      : [];
    if (categories.some((category) => !allowedCategories.has(category))) return NextResponse.json({ error: "One or more selected categories are invalid" }, { status: 400 });
    if (!title || !city || !area || !contactNumber || price === null) return NextResponse.json({ error: "Add a valid title, location, price and phone number" }, { status: 400 });
    const optionalNumber = (key, options) => body[key] === undefined || body[key] === "" ? undefined : number(body[key], options);
    const data = {
      title, city, area, contactNumber, price,
      sizeValue: optionalNumber("sizeValue", { min: 0, max: 10000000 }),
      plotLength: optionalNumber("plotLength", { min: 0, max: 100000 }),
      plotWidth: optionalNumber("plotWidth", { min: 0, max: 100000 }),
      roadWidthFt: optionalNumber("roadWidthFt", { min: 0, max: 10000 }),
      bedrooms: optionalNumber("bedrooms", { min: 0, max: 100, integer: true }),
      bathrooms: optionalNumber("bathrooms", { min: 0, max: 100, integer: true }),
      facing: text(body.facing, { max: 30 }), sizeUnit: text(body.sizeUnit, { max: 20 }),
      nearbyLandmark: text(body.nearbyLandmark, { max: 160 }), description: text(body.description, { max: 5000 }),
      negotiable: typeof body.negotiable === "boolean" ? body.negotiable : undefined,
      isCornerPlot: typeof body.isCornerPlot === "boolean" ? body.isCornerPlot : undefined,
      status: "PENDING", rejectionReason: null,
      categories: { deleteMany: {}, create: categories.map((category) => ({ category })) },
    };
    if (Array.isArray(body.photos)) {
      const photos = [...new Set(body.photos)].filter((url) => typeof url === "string" && url.startsWith("https://res.cloudinary.com/dwvfedqrb/image/upload/"));
      if (!photos.length || photos.length > 12 || photos.length !== body.photos.length) return NextResponse.json({ error: "Keep between 1 and 12 valid property photos" }, { status: 400 });
      data.photos = { deleteMany: {}, create: photos.map((url) => ({ url })) };
    }
    const invalidFields = Object.entries(data)
      .filter(([key, value]) => value === null && key !== "rejectionReason")
      .map(([key]) => key);
    if (invalidFields.length) return NextResponse.json({ error: `Invalid property field: ${invalidFields[0]}`, fields: invalidFields }, { status: 400 });
    const updated = await prisma.listing.update({ where: { id }, data });
    return NextResponse.json({ listing: updated });
  }
  if (body?.status === "PENDING") {
    if (listing.ownerId !== auth.user.id || listing.status !== "REJECTED") return NextResponse.json({ error: "Only a rejected listing can be resubmitted by its owner" }, { status: 403 });
    const updated = await prisma.listing.update({ where: { id }, data: { status: "PENDING", rejectionReason: null } });
    return NextResponse.json({ listing: updated });
  }
  if (!["AREA_ADMIN", "SUPER_ADMIN"].includes(auth.user.role)) return NextResponse.json({ error: "Admin permission required" }, { status: 403 });
  if (auth.user.role === "AREA_ADMIN" && !isScopedAreaAdmin(auth.user)) return NextResponse.json({ error: "Admin area assignment is required" }, { status: 403 });
  if (isScopedAreaAdmin(auth.user) && auth.user.adminArea !== listing.city) return NextResponse.json({ error: "This listing is outside your assigned area" }, { status: 403 });
  const adminStatuses = ["PENDING", "UNDER_REVIEW", "APPROVED", "ACTIVE", "REJECTED", "INACTIVE"];
  if (!body || !adminStatuses.includes(body.status)) return NextResponse.json({ error: `Status must be one of: ${adminStatuses.join(", ")}` }, { status: 400 });
  const rejectionReason = body.status === "REJECTED"
    ? String(body.rejectionReason || "Property details could not be verified. Please correct the listing and resubmit.").slice(0, 500)
    : body.status === "PENDING" ? null : listing.rejectionReason;
  const allowedCategories = new Set(CONTENT_CATEGORIES.map(({ value }) => value));
  const categories = Array.isArray(body.categories)
    ? [...new Set(body.categories.map((category) => String(category).trim().toUpperCase()))]
    : [];
  if (categories.some((category) => !allowedCategories.has(category))) {
    return NextResponse.json({ error: "One or more selected categories are invalid" }, { status: 400 });
  }
  const updated = await prisma.listing.update({
    where: { id },
    data: {
      status: body.status,
      rejectionReason,
      ...(["APPROVED", "ACTIVE"].includes(body.status) ? { categories: { deleteMany: {}, create: categories.map((category) => ({ category })) } } : {}),
    },
  });
  await prisma.adminAudit.create({ data: { adminId: auth.user.id, action: `LISTING_${body.status}`, targetType: "LISTING", targetId: listing.id, metadata: { title: listing.title, city: listing.city, rejectionReason, categories } } });
  notifyEmail({ to: listing.owner?.email, subject: `Listing ${body.status.toLowerCase()}`, heading: `Your listing is ${body.status.toLowerCase().replace("_", " ")}`, message: `“${listing.title}” is now ${body.status.toLowerCase().replace("_", " ")}.`, action: { label: ["APPROVED", "ACTIVE"].includes(body.status) ? "View listing" : "Open dashboard", url: `${new URL(req.url).origin}${["APPROVED", "ACTIVE"].includes(body.status) ? `/listings/${listing.id}` : "/dashboard"}` } });
  return NextResponse.json({ listing: updated });
}

export async function DELETE(req, { params }) {
  const auth = await requireUser();
  if (!auth.user) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const { id } = await params;
  const listing = await prisma.listing.findUnique({ where: { id } });
  if (!listing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const mayDelete = listing.ownerId === auth.user.id || auth.user.role === "SUPER_ADMIN" || (isScopedAreaAdmin(auth.user) && auth.user.adminArea === listing.city);
  if (!mayDelete) return NextResponse.json({ error: "You do not have permission to delete this listing" }, { status: 403 });
  await prisma.listing.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
