import Link from "next/link";
import PropertyCard from "@/components/PropertyCard";
import { getAllApprovedListings } from "@/lib/getListings";
import { PURPOSES, PROPERTY_TYPES_BY_PURPOSE } from "@/lib/listingFields";
import { listingFilters } from "@/lib/listingFilters";

const allTypes = [
  ...new Map(
    Object.values(PROPERTY_TYPES_BY_PURPOSE)
      .flat()
      .map((x) => [x.value, x]),
  ).values(),
];

export const dynamic = "force-dynamic";

export default async function PropertiesPage({ searchParams }) {
  const sp = await searchParams;
  const { where, error } = listingFilters(sp);
  // Fetch every approved property from the backend, without a city restriction.
  const { listings } = error ? { listings: [] } : await getAllApprovedListings(where);

  return (
    <main className="min-h-screen flex-1 bg-[#f7f7f3] pb-24 md:pb-16">
      <section className="border-b border-ink/8 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          <p className="text-xs text-ink-soft">
            <Link href="/">Home</Link> / Properties
          </p>
          <h1 className="mt-2 font-display text-3xl">
            Properties{sp.purpose ? ` for ${String(sp.purpose).toUpperCase() === "RENT" ? "rent" : "sale"}` : ""}
            {sp.city ? ` in ${sp.city}` : sp.area ? ` in ${sp.area}` : " Across India"}
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            {listings.length} verified options found
          </p>
          <form className="mt-5 flex gap-2">
            <label className="flex min-w-0 flex-1 items-center rounded-xl border border-ink/15 bg-white px-4">
              <span className="mr-2 text-moss">⌖</span>
              <input
                name="search"
                defaultValue={sp.search || ""}
                placeholder="Property, locality, city or keyword"
                className="w-full py-3 text-sm outline-none"
              />
            </label>
            <button className="rounded-xl bg-moss px-6 text-sm font-bold text-white transition hover:bg-moss-deep">
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
            <Link href="/properties" className="text-xs font-semibold text-moss hover:underline">
              Reset all
            </Link>
          </div>
          <form className="space-y-6">
            <Filter label="Search">
              <input name="search" defaultValue={sp.search || ""} placeholder="Property or project name" />
            </Filter>
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
                placeholder="e.g. Gurugram, Moradabad, Meerut"
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
            <Filter label="Bedrooms / BHK">
              <input name="bedrooms" type="number" min="0" defaultValue={sp.bedrooms || ""} placeholder="Any" />
            </Filter>
            <Filter label="Bathrooms">
              <input name="bathrooms" type="number" min="0" defaultValue={sp.bathrooms || ""} placeholder="Any" />
            </Filter>
            <Filter label="Furnishing">
              <select name="furnishing" defaultValue={sp.furnishing || ""}>
                <option value="">Any furnishing</option>
                <option value="UNFURNISHED">Unfurnished</option>
                <option value="SEMI_FURNISHED">Semi furnished</option>
                <option value="FULLY_FURNISHED">Fully furnished</option>
              </select>
            </Filter>
            <Filter label="Area">
              <div className="grid grid-cols-2 gap-2">
                <input name="minArea" type="number" min="0" defaultValue={sp.minArea || ""} placeholder="Min sq ft" />
                <input name="maxArea" type="number" min="0" defaultValue={sp.maxArea || ""} placeholder="Max sq ft" />
              </div>
            </Filter>
            <Filter label="Posted by">
              <select name="postedBy" defaultValue={sp.postedBy || ""}>
                <option value="">Anyone</option>
                <option value="OWNER">Owner</option>
                <option value="BROKER">Broker</option>
              </select>
            </Filter>
            <button className="w-full rounded-xl bg-ink py-3 text-sm font-bold text-white transition hover:bg-moss-deep">
              Apply filters
            </button>
          </form>
        </aside>

        <section>
          {error && <p className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
          <div className="mb-5 flex items-center justify-between">
            <div className="flex gap-2">
              <span className="rounded-full bg-moss/10 px-3 py-2 text-xs font-semibold text-moss-deep">
                All approved properties
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
                No properties available right now.
              </h2>
              <p className="mt-2 text-sm text-ink-soft">
                {sp.city || sp.search || sp.propertyType || sp.minPrice || sp.maxPrice
                  ? "Try widening your search or clearing filters to see all properties."
                  : "Check back soon for newly approved properties."}
              </p>
              {(sp.city || sp.search || sp.propertyType || sp.minPrice || sp.maxPrice) && (
                <Link
                  href="/properties"
                  className="mt-5 inline-block rounded-full bg-moss px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-moss-deep"
                >
                  Clear filters
                </Link>
              )}
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
