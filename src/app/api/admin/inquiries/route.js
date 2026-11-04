import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/serverAuth";

export const runtime = "nodejs";

export async function GET(req) {
  const auth = await requireAdmin();
  if (!auth.user) return NextResponse.json({ error: auth.error }, { status: auth.status ?? 401 });

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const limit = 20;
  const skip = (page - 1) * limit;
  const search = searchParams.get("search")?.trim() || "";

  const where = search ? {
    OR: [
      { sender: { name: { contains: search, mode: "insensitive" } } },
      { sender: { email: { contains: search, mode: "insensitive" } } },
      { listing: { title: { contains: search, mode: "insensitive" } } },
      { message: { contains: search, mode: "insensitive" } },
    ]
  } : {};

  const [inquiries, total] = await Promise.all([
    prisma.inquiry.findMany({
      where,
      include: {
        listing: { select: { id: true, title: true, area: true, city: true } },
        sender: { select: { id: true, name: true, email: true, phone: true } },
        recipient: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.inquiry.count({ where }),
  ]);

  return NextResponse.json({ inquiries, total, page, totalPages: Math.ceil(total / limit) });
}
