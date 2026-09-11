import Link from "next/link";
import { ArrowRight } from "lucide-react";
import PropertyCard from "@/components/PropertyCard";
import SectionHeading from "@/components/SectionHeading";

export default function PropertySection({ title, eyebrow, description, listings = [], error = false, badge }) {
  return <section className="property-section border-b border-gray-100 bg-white py-12 sm:py-16">
    <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-10">
      <SectionHeading title={title} eyebrow={eyebrow} description={description} action={<Link href="/properties" className="btn btn-tertiary">View all properties <ArrowRight size={16}/></Link>}/>
      {error ? <p role="alert" className="rounded-xl border border-red-100 bg-red-50 p-5 text-sm text-red-700">Properties could not be loaded. Please try again shortly.</p> : listings.length ?
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{listings.map(listing => <PropertyCard key={listing.id} listing={listing} badge={badge} variant="showcase"/>)}</div> :
        <p className="rounded-xl border border-gray-200 bg-gray-50 p-5 text-sm text-gray-500">New properties will appear here when available.</p>}
    </div>
  </section>;
}
