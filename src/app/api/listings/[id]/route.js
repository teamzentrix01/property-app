import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, isScopedAreaAdmin } from "@/lib/serverAuth";
import { notifyEmail } from "@/lib/mailer";
import { number, phone, text } from "@/lib/validation";

const include = { photos: true, owner: { select: { name: true, phone: true, role: true, brokerAgency: true, verified: true } } };

export async function GET(req, { params }) {
  const { id } = await params;
  const listing = await prisma.listing.findUnique({ where: { id }, include });
  if (!listing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (listing.status !== "APPROVED") {
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
  if (body?.action === "UPDATE") {
    if (listing.ownerId !== auth.user.id) return NextResponse.json({ error: "Only the listing owner can edit it" }, { status: 403 });
    const title = text(body.title, { min: 5, max: 160, required: true });
    const city = text(body.city, { min: 2, max: 80, required: true });
    const area = text(body.area, { min: 2, max: 80, required: true });
    const contactNumber = phone(body.contactNumber);
    const price = number(body.price, { min: 1, max: 100000000000 });
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
    };
    if (Object.values(data).some((value) => value === null)) return NextResponse.json({ error: "One or more property details are invalid" }, { status: 400 });
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
  if (!body || !["APPROVED", "REJECTED"].includes(body.status)) return NextResponse.json({ error: "Status must be APPROVED or REJECTED" }, { status: 400 });
  const rejectionReason = body.status === "REJECTED" ? String(body.rejectionReason || "Property details could not be verified. Please correct the listing and resubmit.").slice(0, 500) : null;
  const updated = await prisma.listing.update({ where: { id }, data: { status: body.status, rejectionReason } });
  notifyEmail({ to: listing.owner?.email, subject: `Listing ${body.status.toLowerCase()}`, heading: body.status === "APPROVED" ? "Your listing is now live" : "Your listing was not approved", message: `“${listing.title}” is now ${body.status.toLowerCase()}.`, action: { label: body.status === "APPROVED" ? "View listing" : "Open dashboard", url: `${new URL(req.url).origin}${body.status === "APPROVED" ? `/listings/${listing.id}` : "/dashboard"}` } });
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
