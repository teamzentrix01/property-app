import Link from "next/link";
import PlotBoundary from "@/components/PlotBoundary";
import PropertyCard from "@/components/PropertyCard";
import { getApprovedListings } from "@/lib/getListings";
import { PROPERTY_TYPES_BY_PURPOSE } from "@/lib/listingFields";

export default async function Home() {
  const { listings } = await getApprovedListings();
  return <main className="flex-1">
    <section className="relative overflow-hidden border-b border-ink/10 bg-paper-dim">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 pb-16 pt-20 md:grid-cols-[1.2fr_1fr]"><div>
        <p className="mb-5 font-data text-xs uppercase tracking-[.2em] text-gold">Owners · Brokers · Buyers, one map</p>
        <h1 className="mb-6 font-display text-5xl leading-[1.05] md:text-6xl">Every plot has a <span className="italic text-moss">boundary.</span><br />Find yours.</h1>
        <p className="mb-8 max-w-md text-lg text-ink-soft">Post a house, plot, shop or office in minutes. Buyers browse by locality. Brokers share exactly the properties a client asked for — nothing more.</p>
        <div className="flex flex-wrap gap-3"><Link href="/listings" className="rounded-full bg-moss px-6 py-3 font-medium text-paper shadow-lg shadow-moss/20 transition hover:bg-moss-deep">Browse listings</Link><Link href="/listings/new" className="rounded-full border border-ink/20 bg-paper/70 px-6 py-3 transition hover:bg-paper">Post your property</Link></div>
      </div><PlotBoundary className="mx-auto w-full max-w-sm" /></div>
    </section>
    <section className="mx-auto grid max-w-6xl gap-8 px-6 py-14 md:grid-cols-2">
      {[['For Sale', 'SALE'], ['For Rent', 'RENT']].map(([label, purpose]) => <div key={purpose} className="rounded-3xl border border-ink/10 bg-paper-dim p-7"><h2 className="mb-4 font-display text-2xl">{label}</h2><div className="flex flex-wrap gap-2">{PROPERTY_TYPES_BY_PURPOSE[purpose].map((type) => <Link key={type.value} href={`/listings?purpose=${purpose}&propertyType=${type.value}`} className="rounded-full border border-ink/15 bg-paper px-4 py-2 font-data text-sm transition hover:border-moss hover:text-moss-deep">{type.label}</Link>)}</div></div>)}
    </section>
    <section className="mx-auto max-w-6xl px-6 pb-24">
      <div className="mb-6 flex items-center justify-between rounded-2xl border border-ink/10 bg-paper-dim px-5 py-4"><div><p className="font-data text-[11px] uppercase tracking-[.16em] text-moss">Fresh on Bhoomi</p><h2 className="font-display text-2xl">Recently listed</h2></div><Link href="/listings" className="rounded-full border border-ink/15 bg-paper px-4 py-2 font-data text-sm text-moss-deep transition hover:border-moss">View all →</Link></div>
      {listings.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{listings.map((listing) => <PropertyCard key={listing.id} listing={listing} />)}</div> : <div className="rounded-2xl border border-dashed border-ink/20 bg-paper-dim px-6 py-12 text-center"><p className="font-display text-xl">New listings will appear here.</p><p className="mt-2 text-ink-soft">Be the first to post a verified property in your area.</p><Link href="/listings/new" className="mt-5 inline-block rounded-full bg-moss px-5 py-2.5 text-paper">Post property</Link></div>}
    </section>
  </main>;
}
