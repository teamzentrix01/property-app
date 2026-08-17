import Link from "next/link";

const TYPE_LABEL = {
  HOUSE: "House", PLOT: "Plot", FLAT: "Flat", SHOP: "Shop",
  SHOWROOM: "Showroom", GODOWN: "Godown", OFFICE: "Office", PG: "PG",
};

function formatPrice(price, purpose) {
  const n = Number(price);
  const val = n >= 10000000
    ? `₹${(n / 10000000).toFixed(2)} Cr`
    : n >= 100000
    ? `₹${(n / 100000).toFixed(2)} L`
    : `₹${n.toLocaleString("en-IN")}`;
  return purpose === "RENT" ? `${val}/mo` : val;
}

export default function PropertyCard({ listing }) {
  const photo = listing.photos?.[0]?.url;
  return (
    <Link
      href={`/listings/${listing.id}`}
      className="group block rounded-2xl overflow-hidden bg-paper text-ink hover:-translate-y-1 transition-transform duration-300"
    >
      <div className="relative h-44 bg-paper-dim overflow-hidden">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center font-data text-xs text-ink-soft">NO PHOTO</div>
        )}
        <span className="absolute top-3 left-3 text-[11px] font-data uppercase tracking-wide bg-ink text-paper px-2 py-1 rounded-full">
          {listing.purpose === "SALE" ? "For Sale" : "For Rent"}
        </span>
        {listing.postedBy === "BROKER" && (
          <span className="absolute top-3 right-3 text-[11px] font-data uppercase tracking-wide bg-gold text-ink px-2 py-1 rounded-full">
            Broker
          </span>
        )}
      </div>
      <div className="p-4">
        <p className="font-data text-[11px] uppercase tracking-wide text-moss-deep mb-1">
          {TYPE_LABEL[listing.propertyType]} · {listing.area}, {listing.city}
        </p>
        <h3 className="font-display text-lg leading-snug mb-2">{listing.title}</h3>
        <p className="font-data text-base font-medium">{formatPrice(listing.price, listing.purpose)}</p>
      </div>
    </Link>
  );
}
