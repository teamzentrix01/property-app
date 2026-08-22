import Link from "next/link";
import PropertyCard from "@/components/PropertyCard";
import { getApprovedListings } from "@/lib/getListings";
import { PURPOSES, PROPERTY_TYPES_BY_PURPOSE } from "@/lib/listingFields";
const allTypes = [
  ...new Map(
    Object.values(PROPERTY_TYPES_BY_PURPOSE)
      .flat()
      .map((x) => [x.value, x]),
  ).values(),
];
export default async function ListingsPage({ searchParams }) {
  const sp = await searchParams;
  const where = {};
  if (sp.city) where.city = { contains: sp.city, mode: "insensitive" };
  if (sp.area) where.area = { contains: sp.area, mode: "insensitive" };
  if (sp.purpose) where.purpose = sp.purpose;
  if (sp.propertyType) where.propertyType = sp.propertyType;
  if (sp.minPrice || sp.maxPrice)
    where.price = {
      ...(sp.minPrice ? { gte: Number(sp.minPrice) } : {}),
      ...(sp.maxPrice ? { lte: Number(sp.maxPrice) } : {}),
    };
  const { listings } = await getApprovedListings(where);
  return (
    <main className="min-h-screen flex-1 bg-[#f7f7f3] pb-24 md:pb-16">
      <section className="border-b border-ink/8 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          <p className="text-xs text-ink-soft">
            <Link href="/">Home</Link> / Properties
          </p>
          <h1 className="mt-2 font-display text-3xl">
            Properties for {sp.purpose === "RENT" ? "rent" : "sale"}
            {sp.area ? ` in ${sp.area}` : " in India"}
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            {listings.length} verified options found
          </p>
          <form className="mt-5 flex gap-2">
            <label className="flex min-w-0 flex-1 items-center rounded-xl border border-ink/15 bg-white px-4">
              <span className="mr-2 text-moss">⌖</span>
              <input
                name="area"
                defaultValue={sp.area || ""}
                placeholder="Locality, sector or city"
                className="w-full py-3 text-sm outline-none"
              />
            </label>
            <input type="hidden" name="purpose" value={sp.purpose || "SALE"} />
            <button className="rounded-xl bg-moss px-6 text-sm font-bold text-white">
              Search
            </button>
          </form>
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1 md:hidden">
            {[
              "Filters",
              "Budget",
              "Property type",
              "Verified",
              "Posted by",
            ].map((x) => (
              <button
                key={x}
                className="shrink-0 rounded-full border border-ink/15 bg-white px-4 py-2 text-xs font-semibold"
              >
                {x}
                {x !== "Verified" && " ▾"}
              </button>
            ))}
          </div>
        </div>
      </section>
      <div className="mx-auto grid max-w-7xl gap-7 px-4 py-7 sm:px-6 lg:grid-cols-[260px_1fr]">
        <aside className="hidden h-fit rounded-2xl border border-ink/8 bg-white p-5 lg:block">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-semibold">Filters</h2>
            <Link href="/listings" className="text-xs font-semibold text-moss">
              Reset all
            </Link>
          </div>
          <form className="space-y-6">
            <Filter label="Looking to">
              <select name="purpose" defaultValue={sp.purpose || ""}>
                <option value="">Buy or rent</option>
                {PURPOSES.map((x) => (
                  <option key={x.value} value={x.value}>
                    {x.label}
                  </option>
                ))}
              </select>
            </Filter>
            <Filter label="Property type">
              <select name="propertyType" defaultValue={sp.propertyType || ""}>
                <option value="">All types</option>
                {allTypes.map((x) => (
                  <option key={x.value} value={x.value}>
                    {x.label}
                  </option>
                ))}
              </select>
            </Filter>
            <Filter label="City">
              <input
                name="city"
                defaultValue={sp.city || ""}
                placeholder="e.g. Gurugram"
              />
            </Filter>
            <Filter label="Locality">
              <input
                name="area"
                defaultValue={sp.area || ""}
                placeholder="Sector or locality"
              />
            </Filter>
            <Filter label="Budget">
              <div className="grid grid-cols-2 gap-2">
                <input
                  name="minPrice"
                  type="number"
                  defaultValue={sp.minPrice || ""}
                  placeholder="Min ₹"
                />
                <input
                  name="maxPrice"
                  type="number"
                  defaultValue={sp.maxPrice || ""}
                  placeholder="Max ₹"
                />
              </div>
            </Filter>
            <div>
              <p className="mb-3 text-sm font-semibold">Posted by</p>
              {["Owner", "Broker", "Builder"].map((x) => (
                <label
                  key={x}
                  className="mb-2 flex items-center gap-2 text-sm text-ink-soft"
                >
                  <input type="checkbox" /> {x}
                </label>
              ))}
            </div>
            <button className="w-full rounded-xl bg-ink py-3 text-sm font-bold text-white">
              Apply filters
            </button>
          </form>
        </aside>
        <section>
          <div className="mb-5 flex items-center justify-between">
            <div className="flex gap-2">
              <span className="rounded-full bg-moss/10 px-3 py-2 text-xs font-semibold text-moss-deep">
                All properties
              </span>
            </div>
            <select className="rounded-xl border border-ink/10 bg-white px-3 py-2 text-xs">
              <option>Newest first</option>
              <option>Price: Low to high</option>
              <option>Price: High to low</option>
            </select>
          </div>
          {listings.length ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {listings.map((l) => (
                <PropertyCard key={l.id} listing={l} />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-ink/15 bg-white py-20 text-center">
              <div className="text-4xl">⌕</div>
              <h2 className="mt-4 font-display text-2xl">
                No exact matches yet
              </h2>
              <p className="mt-2 text-sm text-ink-soft">
                Try widening your locality or budget.
              </p>
              <Link
                href="/listings"
                className="mt-5 inline-block rounded-full bg-moss px-5 py-2.5 text-sm font-semibold text-white"
              >
                Clear filters
              </Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
function Filter({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold">{label}</span>
      <div className="[&_input]:w-full [&_input]:rounded-xl [&_input]:border [&_input]:border-ink/10 [&_input]:px-3 [&_input]:py-2.5 [&_select]:w-full [&_select]:rounded-xl [&_select]:border [&_select]:border-ink/10 [&_select]:bg-white [&_select]:px-3 [&_select]:py-2.5 [&_select]:text-sm">
        {children}
      </div>
    </label>
  );
}
