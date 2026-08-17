import PropertyCard from "@/components/PropertyCard";
import { getApprovedListings } from "@/lib/getListings";
import { PURPOSES, PROPERTY_TYPES_BY_PURPOSE } from "@/lib/listingFields";

export default async function ListingsPage({ searchParams }) {
  const sp = await searchParams;
  const where = {};
  if (sp.city) where.city = { contains: sp.city, mode: "insensitive" };
  if (sp.area) where.area = { contains: sp.area, mode: "insensitive" };
  if (sp.purpose) where.purpose = sp.purpose;
  if (sp.propertyType) where.propertyType = sp.propertyType;
  const { listings } = await getApprovedListings(where);
  const types = sp.purpose ? PROPERTY_TYPES_BY_PURPOSE[sp.purpose] : [];
  return <main className="flex-1 mx-auto max-w-6xl w-full px-6 py-12"><h1 className="mb-8 font-display text-3xl">Browse properties</h1><form className="mb-10 grid gap-3 rounded-2xl bg-paper-dim p-4 text-ink sm:grid-cols-4"><input name="area" defaultValue={sp.area || ""} placeholder="Locality e.g. Buddhi Vihar" className="rounded-lg border border-ink/10 bg-paper px-3 py-2 sm:col-span-2" /><select name="purpose" defaultValue={sp.purpose || ""} className="rounded-lg border border-ink/10 bg-paper px-3 py-2"><option value="">Sale or Rent</option>{PURPOSES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}</select><select name="propertyType" defaultValue={sp.propertyType || ""} className="rounded-lg border border-ink/10 bg-paper px-3 py-2"><option value="">Any type</option>{types.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}</select><button className="rounded-lg bg-ink py-2 font-medium text-paper transition hover:bg-moss-deep sm:col-span-4">Filter</button></form>{listings.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{listings.map((listing) => <PropertyCard key={listing.id} listing={listing} />)}</div> : <div className="rounded-2xl border border-dashed border-ink/20 bg-paper-dim py-14 text-center text-ink-soft">No approved properties match these filters yet.</div>}</main>;
}
