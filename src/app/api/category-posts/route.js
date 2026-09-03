import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/serverAuth";
import { CONTENT_CATEGORIES, toSlug } from "@/lib/contentCategories";
import { findCategoryPosts, createCategoryPost } from "@/lib/categoryPosts";

const categoryValues = CONTENT_CATEGORIES.map((item) => item.value);

function bodyData(body) {
  const title = String(body?.title || "").trim();
  const category = String(body?.category || "").trim().toUpperCase();
  if (!title || !categoryValues.includes(category)) return { error: "A valid category and title are required" };
  return {
    data: {
      category,
      title,
      slug: toSlug(body.slug || title),
      excerpt: String(body.excerpt || "").trim() || null,
      description: String(body.description || "").trim() || null,
      imageUrl: String(body.imageUrl || "").trim() || null,
      location: String(body.location || "").trim() || null,
      priceLabel: String(body.priceLabel || "").trim() || null,
      featured: Boolean(body.featured),
      isActive: body.isActive !== false,
      sortOrder: Number.isFinite(Number(body.sortOrder)) ? Number(body.sortOrder) : 0,
    },
  };
}

export async function GET(req) {
  const url = new URL(req.url);
  const category = url.searchParams.get("category")?.toUpperCase();
  const admin = url.searchParams.get("admin") === "1";
  if (admin) {
    const auth = await requireUser(["SUPER_ADMIN"]);
    if (!auth.user) return NextResponse.json({ error: auth.error }, { status: auth.status });
  }
  const posts = await findCategoryPosts({ category, admin });
  return NextResponse.json({ posts });
}

export async function POST(req) {
  const auth = await requireUser(["SUPER_ADMIN"]);
  if (!auth.user) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const parsed = bodyData(await req.json().catch(() => null));
  if (parsed.error) return NextResponse.json({ error: parsed.error }, { status: 400 });
  try {
    const post = await createCategoryPost(parsed.data);
    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    if (error.code === "P2002") return NextResponse.json({ error: "That slug already exists in this category" }, { status: 409 });
    return NextResponse.json({ error: "Could not create post" }, { status: 500 });
  }
}
