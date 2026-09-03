import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/serverAuth";
import { text } from "@/lib/validation";
import { notifyEmail } from "@/lib/mailer";

export async function GET() {
  const auth = await requireUser();
  if (!auth.user) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const inquiries = await prisma.inquiry.findMany({ where: { OR: [{ senderId: auth.user.id }, { recipientId: auth.user.id }] }, include: { listing: { select: { id: true, title: true, area: true, city: true } }, sender: { select: { id: true, name: true, phone: true } }, recipient: { select: { id: true, name: true } } }, orderBy: { createdAt: "desc" }, take: 100 });
  return NextResponse.json({ inquiries });
}

export async function POST(req) {
  const auth = await requireUser();
  if (!auth.user) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const body = await req.json().catch(() => null);
  const message = text(body?.message, { min: 5, max: 1000, required: true });
  if (!message || !body?.listingId) return NextResponse.json({ error: "Add a valid message" }, { status: 400 });
  const listing = await prisma.listing.findFirst({ where: { id: body.listingId, status: { in: ["APPROVED", "ACTIVE"] }, blocked: false }, include: { owner: { select: { email: true } } } });
  if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  if (listing.ownerId === auth.user.id) return NextResponse.json({ error: "You cannot enquire on your own listing" }, { status: 400 });
  const inquiry = await prisma.inquiry.create({ data: { message, listingId: listing.id, senderId: auth.user.id, recipientId: listing.ownerId } });
  notifyEmail({ to: listing.owner.email, subject: "New property enquiry", heading: "A buyer is interested", message: `${auth.user.name} sent an enquiry for “${listing.title}”.`, action: { label: "View enquiry", url: `${new URL(req.url).origin}/dashboard` } });
  return NextResponse.json({ inquiry }, { status: 201 });
}
