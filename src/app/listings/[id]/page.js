import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { currentUser, isScopedAreaAdmin } from "@/lib/serverAuth";

const LABELS = {
  sizeValue: "Size", facing: "Facing", bedrooms: "Bedrooms", bathrooms: "Bathrooms",
  floorNumber: "Floor", totalFloors: "Total floors", furnishing: "Furnishing",
  propertyAgeYears: "Age (years)", possession: "Possession", ownershipType: "Ownership",
  reraNumber: "RERA no.", roadWidthFt: "Road width (ft)", nearbyLandmark: "Landmark",
};

export default async function ListingDetail({ params }) {
  const { id } = await params;
  let listing;
  try {
    listing = await prisma.listing.findUnique({
      where: { id },
      include: { photos: true, owner: { select: { name: true, phone: true, role: true, brokerAgency: true } } },
    });
  } catch {
    listing = null;
  }
  if (!listing) return notFound();
  if (listing.status !== "APPROVED") {
    const user = await currentUser();
    const canView = user && (user.id === listing.ownerId || user.role === "SUPER_ADMIN" || (isScopedAreaAdmin(user) && user.adminArea === listing.city));
    if (!canView) return notFound();
  }

  const details = Object.entries(LABELS).filter(([key]) => listing[key] !== null && listing[key] !== undefined && listing[key] !== "");

  return (
    <main className="flex-1 max-w-4xl mx-auto px-6 py-12 w-full">
      <p className="font-data text-xs uppercase tracking-wide text-gold mb-2">
        {listing.purpose === "SALE" ? "For Sale" : "For Rent"} · {listing.propertyType}
      </p>
      <h1 className="font-display text-4xl mb-2">{listing.title}</h1>
      <p className="text-ink-soft mb-8">{listing.area}, {listing.city}</p>

      <div className="grid sm:grid-cols-2 gap-6 mb-10">
        {listing.photos.map((p) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={p.id} src={p.url} alt={listing.title} className="rounded-2xl w-full h-64 object-cover" />
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-10">
        <div>
          <h2 className="font-display text-xl mb-4">Details</h2>
          <dl className="grid grid-cols-2 gap-y-2 font-data text-sm">
            {details.map(([key, label]) => (
              <div key={key} className="contents">
                <dt className="text-ink-soft">{label}</dt>
                <dd>{String(listing[key])}</dd>
              </div>
            ))}
          </dl>
          {listing.description && <p className="mt-6 text-paper/90">{listing.description}</p>}
        </div>
        <div className="bg-paper text-ink rounded-2xl p-6 h-fit">
          <p className="font-data text-xs uppercase text-ink-soft mb-1">
            {listing.purpose === "RENT" ? "Rent" : "Price"}
          </p>
          <p className="font-display text-3xl mb-4">₹{Number(listing.price).toLocaleString("en-IN")}</p>
          <p className="font-medium mb-1">{listing.owner?.name}</p>
          <p className="text-sm text-ink/70 mb-4">{listing.owner?.role === "BROKER" ? listing.owner?.brokerAgency || "Broker" : "Owner"}</p>
          <a href={`tel:${listing.owner?.phone}`} className="block text-center bg-ink text-paper rounded-full py-3 font-medium hover:bg-moss-deep transition">
            Call {listing.owner?.phone}
          </a>
        </div>
      </div>
    </main>
  );
}
