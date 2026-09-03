import Link from "next/link";
import { findCategoryPosts } from "@/lib/categoryPosts";
import { categoryFromSlug } from "@/lib/contentCategories";
import { getApprovedListings } from "@/lib/getListings";
import PropertyCard from "@/components/PropertyCard";
import { prisma } from "@/lib/prisma";

export default async function CategoryLanding({ slug }) {
  const category = categoryFromSlug(slug);
  if (!category) return null;
  let posts = [];
  let listings = [];
  let pendingCount = 0;
  if (process.env.DATABASE_URL) {
    [posts, { listings }] = await Promise.all([
      findCategoryPosts({ category: category.value }).catch(() => []),
      getApprovedListings({ categories: { some: { category: category.value } } }).catch(() => ({ listings: [] })),
    ]);
    pendingCount = await prisma.listing.count({ where: { status: "PENDING", categories: { some: { category: category.value } } } }).catch(() => 0);
  }
  return (
    <main className="flex-1">
      <section className="bg-ink px-5 py-16 text-paper sm:px-8">
        <div className="mx-auto max-w-7xl">
          <p className="font-data text-xs uppercase tracking-[.2em] text-gold">Bhoomi property guide</p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl sm:text-6xl">{category.label} across India</h1>
          <p className="mt-5 max-w-2xl text-paper/70">Explore handpicked {category.label.toLowerCase()} opportunities, locations and market insights from the Bhoomi team.</p>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
        {listings.length > 0 && <div className="mb-12"><div className="mb-6 flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-moss">Live properties</p><h2 className="mt-1 font-display text-3xl">Browse {category.label.toLowerCase()}</h2></div><Link href={`/listings?category=${category.slug}`} className="text-sm font-semibold text-moss-deep">View all →</Link></div><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{listings.map((listing) => <PropertyCard key={listing.id} listing={listing} />)}</div></div>}
        {posts.length === 0 && listings.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-ink/20 bg-white px-6 py-16 text-center">
            <h2 className="font-display text-2xl">{pendingCount > 0 ? `${pendingCount} ${category.label.toLowerCase()} listing${pendingCount === 1 ? " is" : "s are"} awaiting approval` : `More ${category.label.toLowerCase()} are coming soon`}</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft">{pendingCount > 0 ? "The selected property will appear here after the admin approves it." : "Our editorial team is preparing verified guides and opportunities for this category."}</p>
            <Link href="/listings" className="mt-6 inline-block rounded-full bg-moss px-5 py-3 text-sm font-semibold text-white">Browse live properties</Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link href={`/categories/${slug}/${post.slug}`} key={post.id} className="group overflow-hidden rounded-3xl border border-ink/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                {post.imageUrl ? <img src={post.imageUrl} alt="" className="h-56 w-full object-cover transition duration-300 group-hover:scale-[1.03]" /> : <div className="h-56 bg-gradient-to-br from-moss to-ink" />}
                <div className="p-5">
                  <div className="flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-wide text-moss">
                    <span>{post.location || category.label}</span>{post.featured && <span className="text-gold">Featured</span>}
                  </div>
                  <h2 className="mt-3 font-display text-2xl">{post.title}</h2>
                  {post.excerpt && <p className="mt-2 line-clamp-3 text-sm leading-6 text-ink-soft">{post.excerpt}</p>}
                  {post.priceLabel && <p className="mt-4 font-data text-xs text-ink-soft">{post.priceLabel}</p>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
