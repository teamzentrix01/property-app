"use client";
import Link from "next/link";
import { MapPin, ArrowRight, BadgeCheck } from "lucide-react";
import SaveListingButton from "@/components/SaveListingButton";
import PropertyActions from "@/components/PropertyActions";
import { formatPrice } from "@/lib/formatters";
const TYPES = {
  HOUSE: "Independent House",
  PLOT: "Residential Plot",
  FLAT: "Apartment",
  SHOP: "Shop",
  SHOWROOM: "Showroom",
  GODOWN: "Warehouse",
  OFFICE: "Office Space",
  PG: "PG / Co-living",
};
export default function PropertyCard({ listing, variant }) {
  if (variant === "trending") return <TrendingCard listing={listing} />;
  const photo = listing.photos?.[0]?.url;
  const facts =
    listing.propertyType === "PLOT"
      ? [
          listing.sizeValue &&
            `${listing.sizeValue} ${listing.sizeUnit || "sq ft"}`,
          listing.roadWidthFt && `${listing.roadWidthFt} ft road`,
          listing.facing,
        ]
      : [
          listing.bedrooms && `${listing.bedrooms} BHK`,
          listing.sizeValue &&
            `${listing.sizeValue} ${listing.sizeUnit || "sq ft"}`,
          listing.possession?.replaceAll("_", " "),
        ];
  return (
    <article className="group overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-[0_8px_30px_rgba(22,48,43,.06)] transition hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(22,48,43,.12)]">
      <div className="relative aspect-[4/3] overflow-hidden bg-paper-dim">
        <Link href={`/listings/${listing.id}`} className="block h-full">
          {photo ? (
            <img
              src={photo}
              alt={listing.title}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="grid h-full place-items-center text-xs text-ink-soft">
              Photo coming soon
            </div>
          )}
        </Link>
        <div className="absolute left-3 top-3 flex gap-2">
          <span className="rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-moss-deep shadow-sm">
            {listing.owner?.verified ? "✓ Owner verified" : "✓ Listing reviewed"}
          </span>
          {listing.reraNumber && (
            <span className="rounded-full bg-moss px-2.5 py-1 text-[10px] font-bold text-white">
              RERA
            </span>
          )}
        </div>
        <div className="absolute right-3 top-3">
          <PropertyActions listing={listing} compact />
        </div>
        <span className="absolute bottom-3 right-3 rounded-full bg-black/65 px-2 py-1 text-[10px] text-white">
          {listing.photos?.length || 0} photos
        </span>
      </div>
      <div className="p-4">
        <div className="mb-2 flex items-start justify-between gap-3">
          <div>
            <p className="font-display text-xl font-semibold">
              {formatPrice(listing.price, listing.purpose)}
            </p>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-moss-deep">
              {TYPES[listing.propertyType]}
            </p>
          </div>
          <span className="rounded-full bg-paper-dim px-2.5 py-1 text-[10px] font-semibold">
            {listing.postedBy === "BROKER" ? "Agent" : "Owner"}
          </span>
        </div>
        <Link href={`/listings/${listing.id}`}>
          <h3 className="line-clamp-1 font-semibold text-ink group-hover:text-moss-deep">
            {listing.title}
          </h3>
        </Link>
        <p className="mt-1 line-clamp-1 text-sm text-ink-soft">
          {listing.area}, {listing.city}
        </p>
        {facts.filter(Boolean).length > 0 && (
          <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 border-y border-ink/8 py-2 text-xs text-ink-soft">
            {facts.filter(Boolean).map((f) => (
              <span key={f}>{f}</span>
            ))}
          </div>
        )}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <a
            href={`tel:${listing.contactNumber || ""}`}
            className="rounded-xl border border-moss/25 py-2 text-center text-xs font-semibold text-moss-deep"
          >
            Call
          </a>
          <a
            href={`https://wa.me/91${String(listing.contactNumber || "")
              .replace(/\D/g, "")
              .slice(-10)}`}
            className="rounded-xl bg-moss py-2 text-center text-xs font-semibold text-white"
          >
            WhatsApp
          </a>
        </div>
      </div>
    </article>
  );
}

function TrendingCard({ listing }) {
  const project = {
    id: listing.id,
    name: listing.title,
    location: [listing.area, listing.city].filter(Boolean).join(", "),
    price: formatPrice(listing.price, listing.purpose),
    type: listing.propertyType || "Residential",
    area: listing.sizeValue
      ? `${listing.sizeValue} ${listing.sizeUnit || "sq ft"}`
      : "Area on request",
    image:
      listing.photos?.[0]?.url,
    tag: "Trending",
  };

  return (
              <div
                className="card-red-hover group overflow-hidden rounded-xl border border-[#c41920] bg-white shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-all duration-300 hover:bg-[#c41920] hover:border-white hover:-translate-y-1 hover:shadow-[0_15px_35px_rgba(0,0,0,0.12)]"
              >
                {/* IMAGE */}
                <div className="relative h-[175px] overflow-hidden">
                  {project.image ? <img
                    src={project.image}
                    alt={project.name}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  /> : <div className="grid h-full place-items-center bg-paper-dim text-xs text-ink-soft">Photo coming soon</div>}

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-black/20" />

                  {/* Trending Tag */}
                  <div className="absolute left-4 top-4 rounded-md bg-[#b2873a] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-white">
                    {project.tag}
                  </div>

                  {/* RERA */}
                  {listing.reraNumber?.trim() && <div className="absolute right-4 top-4 flex items-center gap-1 rounded-md bg-white/95 px-2.5 py-1.5 text-[10px] font-bold text-green-700 shadow-sm">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    RERA
                  </div>}

                  {/* Heart */}
                  <SaveListingButton
                    listingId={project.id}
                    className="absolute bottom-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md transition hover:scale-110"
                  />

                  {/* Price */}
                  <div className="absolute bottom-4 left-4">
                    <p className="text-[10px] uppercase tracking-wide text-white/70">
                      Starting From
                    </p>

                    <p className="text-xl font-bold text-white">
                      {project.price}
                    </p>
                  </div>
                </div>

                {/* CONTENT */}
                <div className="p-4">
                  <Link href={`/listings/${project.id}`}>
                    <h3 className="line-clamp-1 text-lg font-bold text-[#171717] transition group-hover:text-[#b2873a]">
                      {project.name}
                    </h3>
                  </Link>

                  {/* Location */}
                  <div className="mt-2 flex items-center gap-2">
                    <MapPin className="h-4 w-4 shrink-0 text-[#b2873a]" />

                    <p className="line-clamp-1 text-xs text-gray-500">
                      {project.location}
                    </p>
                  </div>

                  {/* Divider */}
                  <div className="my-4 h-px bg-gray-100" />

                  {/* Details */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-400">
                        Property Type
                      </span>

                      <span className="text-xs font-semibold text-gray-700">
                        {project.type}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-xs text-gray-400">
                        Area
                      </span>

                      <span className="text-xs font-semibold text-gray-700">
                        {project.area}
                      </span>
                    </div>
                  </div>

                  {/* Button */}
                  <Link
                    href={`/listings/${project.id}`}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-[#c41920] py-2.5 text-sm font-semibold text-[#c41920] transition-all duration-300 hover:bg-[#c41920] hover:text-white"
                  >
                    View Details
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
  );
}
