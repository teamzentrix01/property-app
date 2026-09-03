import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/serverAuth";
import { toSlug } from "@/lib/contentCategories";
import { updateCategoryPost, deleteCategoryPost } from "@/lib/categoryPosts";

export async function PATCH(req, { params }) {
  const auth = await requireUser(["SUPER_ADMIN"]);
  if (!auth.user) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const body = await req.json().catch(() => null);
  const data = {};
  ["title", "excerpt", "description", "imageUrl", "location", "priceLabel"].forEach((key) => {
    if (body && key in body) data[key] = String(body[key] || "").trim() || null;
  });
  if (body?.slug !== undefined) data.slug = toSlug(body.slug);
  if (body?.category) data.category = String(body.category).toUpperCase();
  if (body?.featured !== undefined) data.featured = Boolean(body.featured);
  if (body?.isActive !== undefined) data.isActive = Boolean(body.isActive);
  if (body?.sortOrder !== undefined) data.sortOrder = Number(body.sortOrder) || 0;
  try {
    const post = await updateCategoryPost(params.id, data);
    return NextResponse.json({ post });
  } catch (error) {
    if (error.code === "P2002") return NextResponse.json({ error: "That slug already exists in this category" }, { status: 409 });
    return NextResponse.json({ error: "Post not found or could not be updated" }, { status: 404 });
  }
}

export async function DELETE(req, { params }) {
  const auth = await requireUser(["SUPER_ADMIN"]);
  if (!auth.user) return NextResponse.json({ error: auth.error }, { status: auth.status });
  await deleteCategoryPost(params.id).catch(() => null);
  return NextResponse.json({ ok: true });
}
