import { notFound } from "next/navigation";
import Link from "next/link";
import { categoryFromSlug } from "@/lib/contentCategories";
import { findCategoryPosts } from "@/lib/categoryPosts";

export default async function CategoryPostPage({ params }) {
  const { category: categorySlug, slug } = await params;
  const category = categoryFromSlug(categorySlug);
  if (!category) notFound();
  const post = process.env.DATABASE_URL ? (await findCategoryPosts({ category: category.value }).catch(() => [])).find((item) => item.slug === slug) : null;
  if (!post) notFound();
  return <main className="flex-1"><article className="mx-auto max-w-4xl px-5 py-12 sm:px-8"><Link href={`/categories/${categorySlug}`} className="text-sm font-semibold text-moss-deep">← Back to {category.label}</Link>{post.imageUrl && <img src={post.imageUrl} alt="" className="mt-8 h-72 w-full rounded-3xl object-cover sm:h-[28rem]" />}<p className="mt-8 font-data text-xs uppercase tracking-[.2em] text-gold">{post.location || category.label}</p><h1 className="mt-3 font-display text-4xl sm:text-6xl">{post.title}</h1>{post.priceLabel && <p className="mt-4 font-data text-sm text-moss-deep">{post.priceLabel}</p>}<p className="mt-8 whitespace-pre-line text-base leading-8 text-ink-soft">{post.description || post.excerpt}</p></article></main>;
}
