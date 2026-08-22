import Link from "next/link";
import PropertyCard from "@/components/PropertyCard";
import { getApprovedListings } from "@/lib/getListings";
const categories = [
  { label: "Apartments", type: "FLAT", icon: "▦" },
  { label: "Plots & Land", type: "PLOT", icon: "◇" },
  { label: "Independent", type: "HOUSE", icon: "⌂" },
  { label: "Commercial", type: "OFFICE", icon: "▤" },
  { label: "Shops", type: "SHOP", icon: "▣" },
  { label: "PG / Co-live", type: "PG", icon: "◎" },
];
export default async function Home() {
  const { listings } = await getApprovedListings();
  return (
    <main className="flex-1 pb-24 md:pb-0">
      <section className="relative overflow-hidden bg-ink text-white">
        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_80%_20%,#c99328_0,transparent_30%),linear-gradient(120deg,transparent_45%,#2f7a59_100%)]" />
        <div className="relative mx-auto max-w-7xl px-4 pb-24 pt-14 sm:px-6 md:pb-32 md:pt-20">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[.2em] text-gold">
            Verified properties across India
          </p>
          <h1 className="max-w-3xl font-display text-4xl leading-tight sm:text-5xl md:text-6xl">
            Find a place that feels{" "}
            <span className="italic text-gold">right.</span>
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-white/70 sm:text-base">
            Search homes, plots and commercial spaces from verified owners and
            local property experts.
          </p>
          <form
            action="/listings"
            className="mt-8 max-w-5xl rounded-2xl bg-white p-2 text-ink shadow-2xl md:flex"
          >
            <div className="flex border-b border-ink/10 md:w-44 md:border-b-0 md:border-r">
              <select
                name="purpose"
                className="w-full bg-transparent px-4 py-3 text-sm font-semibold"
              >
                <option value="SALE">Buy</option>
                <option value="RENT">Rent</option>
              </select>
            </div>
            <label className="flex flex-1 items-center gap-3 px-4 py-3">
              <span className="text-moss">⌖</span>
              <input
                name="area"
                className="w-full bg-transparent text-sm outline-none"
                placeholder="Search locality, sector or city"
              />
            </label>
            <select
              name="propertyType"
              className="hidden border-l border-ink/10 bg-transparent px-5 text-sm md:block"
            >
              <option value="">All property types</option>
              <option value="FLAT">Apartment</option>
              <option value="PLOT">Plot</option>
              <option value="HOUSE">House</option>
              <option value="OFFICE">Commercial</option>
            </select>
            <button className="w-full rounded-xl bg-moss px-8 py-3 text-sm font-bold text-white md:w-auto">
              Search properties
            </button>
          </form>
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/60">
            <span>Popular:</span>
            {["Gurugram", "Noida", "Moradabad", "Delhi NCR"].map((x) => (
              <Link
                key={x}
                href={`/listings?area=${encodeURIComponent(x)}`}
                className="text-white/85 hover:text-gold"
              >
                {x}
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="relative mx-auto -mt-10 max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-3 gap-2 rounded-3xl border border-ink/8 bg-white p-3 shadow-xl shadow-ink/8 md:grid-cols-6 md:p-5">
          {categories.map((c) => (
            <Link
              key={c.label}
              href={`/listings?propertyType=${c.type}`}
              className="flex min-h-24 flex-col items-center justify-center rounded-2xl px-2 text-center transition hover:bg-paper-dim"
            >
              <span className="mb-2 grid h-10 w-10 place-items-center rounded-xl bg-moss/10 text-xl text-moss-deep">
                {c.icon}
              </span>
              <span className="text-xs font-semibold sm:text-sm">
                {c.label}
              </span>
            </Link>
          ))}
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-20">
        <div className="mb-7 flex items-end justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.18em] text-moss">
              Handpicked for you
            </p>
            <h2 className="mt-1 font-display text-3xl sm:text-4xl">
              Recommended properties
            </h2>
          </div>
          <Link
            href="/listings"
            className="hidden text-sm font-semibold text-moss-deep sm:block"
          >
            View all properties →
          </Link>
        </div>
        {listings.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {listings.slice(0, 8).map((l) => (
              <PropertyCard key={l.id} listing={l} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-ink/15 bg-white px-6 py-14 text-center">
            <p className="font-display text-2xl">
              Be the first in your locality.
            </p>
            <p className="mt-2 text-ink-soft">
              Verified properties will appear here after review.
            </p>
            <Link
              href="/listings/new"
              className="mt-5 inline-block rounded-full bg-moss px-6 py-3 font-semibold text-white"
            >
              Post property free
            </Link>
          </div>
        )}
      </section>
      <section className="bg-paper-dim/60">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 md:grid-cols-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gold">
              Why Bhoomi
            </p>
            <h2 className="mt-2 font-display text-3xl">
              Property decisions, with less guesswork.
            </h2>
          </div>
          {[
            {
              n: "01",
              t: "Locally verified",
              d: "Listings pass area-level review before going live.",
            },
            {
              n: "02",
              t: "India-specific details",
              d: "Road width, facing, ownership and plot dimensions—not generic fields.",
            },
            {
              n: "03",
              t: "Direct connection",
              d: "Call or WhatsApp the owner or property expert directly.",
            },
          ].map((x) => (
            <div key={x.n} className="rounded-2xl bg-white p-6">
              <span className="text-xs font-bold text-gold">{x.n}</span>
              <h3 className="mt-5 font-display text-xl">{x.t}</h3>
              <p className="mt-2 text-sm leading-6 text-ink-soft">{x.d}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
