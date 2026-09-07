import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/serverAuth";

const statuses = ["DRAFT", "PENDING", "UNDER_REVIEW", "APPROVED", "ACTIVE", "REJECTED", "INACTIVE"];

export async function GET(req, { params }) {
  const auth = await requireAdmin();
  if (!auth.user) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const listing = await prisma.listing.findUnique({ where: { id: (await params).id }, include: { owner: { select: { id: true, name: true, email: true, phone: true, verificationStatus: true, createdAt: true } }, photos: true, documents: true, categories: true } });
  if (!listing) return NextResponse.json({ error: "Property not found" }, { status: 404 });
  return NextResponse.json({ listing });
}

export async function PATCH(req, { params }) {
  const auth = await requireAdmin();
  if (!auth.user) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!statuses.includes(body?.status)) return NextResponse.json({ error: "Invalid property status" }, { status: 400 });
  if (body.status === "ACTIVE") {
    const current = await prisma.listing.findUnique({ where: { id }, select: { status: true } });
    if (!current) return NextResponse.json({ error: "Property not found" }, { status: 404 });
    if (current.status !== "APPROVED" && current.status !== "ACTIVE") return NextResponse.json({ error: "Only approved properties can be activated" }, { status: 400 });
  }
  const now = new Date();
  const data = { status: body.status, rejectionReason: body.status === "REJECTED" ? String(body.reason || "Property was rejected during review.").slice(0, 500) : null, ...(body.status === "APPROVED" ? { approvedAt: now, approvedBy: auth.user.id } : {}), ...(body.status === "ACTIVE" ? { activatedAt: now, activatedBy: auth.user.id } : {}), ...(body.status === "REJECTED" ? { rejectedAt: now, rejectedBy: auth.user.id } : {}) };
  const listing = await prisma.listing.update({ where: { id }, data });
  await prisma.adminAudit.create({ data: { adminId: auth.user.id, action: `ADMIN_PROPERTY_${body.status}`, targetType: "LISTING", targetId: id, metadata: { reason: body.reason || null } } });
  return NextResponse.json({ listing });
}
