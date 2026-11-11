import Link from "next/link";
import { MapPin, Compass, Sparkles } from "lucide-react";
import PropertyCard from "@/components/PropertyCard";
import { getApprovedListings } from "@/lib/getListings";
import { PURPOSES, PROPERTY_TYPES_BY_PURPOSE } from "@/lib/listingFields";
import { listingFilters } from "@/lib/listingFilters";
import { getUserLocationRecommendations } from "@/lib/locationIntelligence";
const allTypes = [
  ...new Map(
    Object.values(PROPERTY_TYPES_BY_PURPOSE)
      .flat()
      .map((x) => [x.value, x]),
  ).values(),
];
export default async function ListingsPage({ searchParams }) {
  const sp = await searchParams;
  const { where, error } = listingFilters(sp);
  const { listings } = error ? { listings: [] } : await getApprovedListings(where);

  let fallbackLocationData = null;
  const searchedLoc = sp.city || sp.area || sp.search;
  if (!listings.length && searchedLoc) {
    try {
      fallbackLocationData = await getUserLocationRecommendations(searchedLoc, { limit: 12 });
    } catch (e) {
      console.warn("Fallback location error:", e.message);
    }
  }
  return (
    <main className="min-h-screen flex-1 bg-slate-50 pb-24 md:pb-16">
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          <p className="text-xs text-gray-500">
            <Link href="/" className="hover:text-green-700">Home</Link> / Properties
          </p>
          <h1 className="mt-2 font-display text-3xl font-extrabold text-gray-950">
            Properties{sp.purpose ? ` for ${String(sp.purpose).toUpperCase() === "RENT" ? "Rent" : "Sale"}` : ""}
            {sp.area ? ` in ${sp.area}` : " in India"}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            <span className="font-bold text-green-700">{listings.length}</span> verified options found
          </p>
          <form className="mt-5 flex gap-2">
            <label className="flex min-w-0 flex-1 items-center rounded-xl border border-gray-200 bg-white px-4 shadow-sm transition focus-within:border-green-600 focus-within:ring-2 focus-within:ring-green-100">
              <MapPin className="mr-2 h-4 w-4 shrink-0 text-red-600" />
              <input
                name="search"
                defaultValue={sp.search || ""}
                placeholder="Property, locality, city or keyword"
                className="w-full py-3 text-sm font-medium text-gray-800 outline-none placeholder:text-gray-400"
              />
            </label>
            <button className="rounded-xl bg-green-700 px-6 text-sm font-bold text-white shadow-sm transition hover:bg-green-800">
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
                className="shrink-0 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:border-green-600 hover:text-green-700"
              >
                {x}
                {x !== "Verified" && " ▾"}
              </button>
            ))}
          </div>
        </div>
      </section>
      {/* Two Independent Scrollable Columns Container */}
      <div className="mx-auto grid max-w-7xl items-start gap-7 px-4 py-6 sm:px-6 lg:h-[calc(100vh-2.5rem)] lg:overflow-hidden lg:grid-cols-[322px_minmax(0,1fr)]">
        {/* Left Side: Independent Scrollable Filter Panel */}
        <aside className="hidden lg:block h-full overflow-y-auto overscroll-contain rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-semibold">Filters</h2>
            <Link href="/listings" className="text-xs font-semibold text-red-600">
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
            <Filter label="Bedrooms / BHK"><input name="bedrooms" type="number" min="0" defaultValue={sp.bedrooms || ""} placeholder="Any" /></Filter>
            <Filter label="Bathrooms"><input name="bathrooms" type="number" min="0" defaultValue={sp.bathrooms || ""} placeholder="Any" /></Filter>
            <Filter label="Furnishing"><select name="furnishing" defaultValue={sp.furnishing || ""}><option value="">Any furnishing</option><option value="UNFURNISHED">Unfurnished</option><option value="SEMI_FURNISHED">Semi furnished</option><option value="FULLY_FURNISHED">Fully furnished</option></select></Filter>
            <Filter label="Area"><div className="grid grid-cols-2 gap-2"><input name="minArea" type="number" min="0" defaultValue={sp.minArea || ""} placeholder="Min sq ft" /><input name="maxArea" type="number" min="0" defaultValue={sp.maxArea || ""} placeholder="Max sq ft" /></div></Filter>
            <Filter label="Posted by"><select name="postedBy" defaultValue={sp.postedBy || ""}><option value="">Anyone</option><option value="OWNER">Owner</option><option value="BROKER">Broker</option></select></Filter>
            <button className="w-full rounded-xl bg-green-700 py-3 text-sm font-bold text-white">
              Apply filters
            </button>
          </form>
        </aside>
        {/* Right Side: Independent Scrollable Properties Section */}
        <section className="h-full overflow-y-auto overscroll-contain pr-1 sm:pr-2 scrollbar-thin">
          {error && <p className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}
          <div className="mb-5 flex items-center justify-between">
            <div className="flex gap-2">
              <span className="rounded-full border border-green-200 bg-[#DCFCE7] px-3 py-1 text-xs font-bold text-[#15803D]">
                All verified properties
              </span>
            </div>
            <select className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100">
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
          ) : fallbackLocationData && fallbackLocationData.allRecommendations.length > 0 ? (
            <div className="space-y-6">
              <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-5 shadow-2xs">
                <div className="flex items-start gap-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
                    <Compass className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-display text-xl sm:text-2xl font-bold text-gray-950">
                      No properties found in {fallbackLocationData.searchedLocation}
                    </h2>
                    <p className="mt-1 text-xs sm:text-sm font-medium text-blue-900">
                      But don&apos;t worry! Explore properties available nearby.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-display text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#c41920]" />
                  Recommended Properties Near {fallbackLocationData.searchedLocation}
                </h3>
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {fallbackLocationData.allRecommendations.map((l) => (
                    <PropertyCard key={l.id} listing={l} badge={l.locationBadge} />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-gray-200 bg-white py-20 text-center">
              <div className="text-4xl text-green-700">⌕</div>
              <h2 className="mt-4 font-display text-2xl font-bold text-gray-900">
                No properties found for your selected filters.
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                Try widening your locality or budget.
              </p>
              <Link
                href="/listings"
                className="mt-5 inline-block rounded-xl bg-green-700 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-green-800"
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
      <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-600">{label}</span>
      <div className="[&_input]:w-full [&_input]:rounded-xl [&_input]:border [&_input]:border-gray-200 [&_input]:px-3 [&_input]:py-2.5 [&_input]:text-sm [&_input]:outline-none [&_input:focus]:border-green-700 [&_input:focus]:ring-2 [&_input:focus]:ring-green-100 [&_select]:w-full [&_select]:rounded-xl [&_select]:border [&_select]:border-gray-200 [&_select]:bg-white [&_select]:px-3 [&_select]:py-2.5 [&_select]:text-sm [&_select]:outline-none [&_select:focus]:border-green-700 [&_select:focus]:ring-2 [&_select:focus]:ring-green-100">
        {children}
      </div>
    </label>
  );
}
