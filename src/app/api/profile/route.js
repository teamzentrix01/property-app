import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/serverAuth";
import { personName, phone, text } from "@/lib/validation";

const select = { id: true, name: true, email: true, phone: true, role: true, createdAt: true, verificationStatus: true, rejectionReason: true, rejectedAt: true, preferredCity: true, preferredLocation: true, preferredPropertyType: true, budgetRange: true, preferredBhk: true, searchPurpose: true };

export async function GET() {
  const auth = await requireUser();
  if (!auth.user) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const [user, savedCount, postedCount, documentCount] = await Promise.all([
    prisma.user.findUnique({ where: { id: auth.user.id }, select }),
    prisma.savedListing.count({ where: { userId: auth.user.id } }),
    prisma.listing.count({ where: { ownerId: auth.user.id } }),
    prisma.userDocument.count({ where: { userId: auth.user.id } }),
  ]);
  return NextResponse.json({ user, counts: { saved: savedCount, posted: postedCount, documents: documentCount } });
}

export async function PUT(request) {
  const auth = await requireUser();
  if (!auth.user) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Invalid profile data" }, { status: 400 });
  const name = personName(body.name);
  const mobile = phone(String(body.phone || "").replace(/\D/g, "").replace(/^91(?=\d{10}$)/, ""));
  if (!name || !mobile) return NextResponse.json({ error: "Enter a valid full name and 10-digit mobile number" }, { status: 400 });
  const optional = (key, max = 100) => body[key] === undefined ? undefined : text(body[key], { max });
  const values = ["preferredCity", "preferredLocation", "preferredPropertyType", "budgetRange", "preferredBhk"];
  const data = { name, phone: mobile };
  for (const key of values) { const value = optional(key); if (value === null) return NextResponse.json({ error: `Invalid ${key}` }, { status: 400 }); data[key] = value || null; }
  if (body.searchPurpose !== undefined) {
    if (body.searchPurpose && !["SALE", "RENT"].includes(body.searchPurpose)) return NextResponse.json({ error: "Invalid search purpose" }, { status: 400 });
    data.searchPurpose = body.searchPurpose || null;
  }
  try {
    const user = await prisma.user.update({ where: { id: auth.user.id }, data, select });
    return NextResponse.json({ user });
  } catch (error) {
    if (error?.code === "P2002") return NextResponse.json({ error: "That mobile number is already in use" }, { status: 409 });
    throw error;
  }
}
