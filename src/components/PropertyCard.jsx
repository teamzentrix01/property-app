"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, BadgeCheck, MapPin, Ruler, BedDouble, Bath } from "lucide-react";
import SaveListingButton from "@/components/SaveListingButton";
import StatusBadge from "@/components/StatusBadge";
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

export default function PropertyCard({ listing, property, variant, badge, children }) {
  const item = property || listing || {};
  const photo =
    item.photos?.[0]?.url ||
    item.images?.[0]?.url ||
    (typeof item.images?.[0] === "string" ? item.images[0] : null) ||
    (typeof item.photos?.[0] === "string" ? item.photos[0] : null) ||
    item.imageUrl ||
    item.image;
  const [failedPhoto, setFailedPhoto] = useState(null);
  const label = badge || (variant === "trending" ? "Trending" : null);
  const detailUrl = `/properties/${item.id || ""}`;

  return (
    <article className="property-card group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:border-green-300 hover:shadow-lg">
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <Link href={detailUrl} className="block h-full" aria-label={`View ${item.title || "property"}`}>
          {photo && photo !== failedPhoto ? (
            <img
              src={photo}
              alt={item.title || "Property"}
              onError={() => setFailedPhoto(photo)}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="grid h-full place-items-center text-sm font-medium text-gray-400">
              Photo coming soon
            </div>
          )}
        </Link>

        {/* Top Badges */}
        <div className="pointer-events-none absolute left-3 top-3 flex flex-wrap gap-1.5 pr-12">
          {label && (
            <span className="rounded-md bg-red-600 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-white shadow-sm">
              {label}
            </span>
          )}
          <span
            className={`rounded-md px-2.5 py-1 text-[10px] font-bold ${
              item.purpose === "RENT"
                ? "bg-red-50 text-red-700 border border-red-200/60"
                : "bg-green-50 text-green-800 border border-green-200/60"
            }`}
          >
            {item.purpose === "RENT" ? "For rent" : "For sale"}
          </span>
        </div>

        {/* Favorite Button */}
        {item.id && (
          <SaveListingButton
            listingId={item.id}
            className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full border border-gray-100 bg-white/95 shadow-sm transition duration-150 hover:scale-105 hover:bg-red-50"
            iconClassName="h-4 w-4"
          />
        )}

        {item.reraNumber?.trim() && (
          <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-md bg-white/95 px-2 py-0.5 text-[10px] font-bold text-green-700 shadow-sm backdrop-blur-sm">
            <BadgeCheck size={13} className="text-green-700" />
            RERA
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        {/* Verification / Status Badge */}
        <div className="mb-2.5">
          {item.status === "APPROVED" ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#DCFCE7] px-2.5 py-0.5 text-[11px] font-bold text-[#15803D]">
              <BadgeCheck size={14} className="text-[#15803D]" />
              ✓ Approved by Admin
            </span>
          ) : (
            <StatusBadge status={item.status} />
          )}
        </div>

        {/* Price & Title */}
        <p className="text-xl font-extrabold tracking-tight text-[#111827]">
          {formatPrice(item.price, item.purpose)}
        </p>

        <Link
          href={detailUrl}
          className="mt-1 line-clamp-1 text-base font-bold text-[#111827] transition hover:text-[#15803D]"
        >
          {item.title}
        </Link>

        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-[#6B7280]">
          <MapPin size={15} className="shrink-0 text-[#DC2626]" />
          <span className="truncate">{[item.area, item.city].filter(Boolean).join(", ")}</span>
        </p>

        {/* Details Specs */}
        <div className="my-3.5 space-y-1.5 border-y border-gray-100 py-2.5 text-xs">
          <div className="flex justify-between gap-3">
            <span className="text-[#6B7280]">Property type</span>
            <span className="text-right font-semibold text-gray-800">
              {TYPES[item.propertyType] || item.propertyType || "Residential"}
            </span>
          </div>

          <div className="flex justify-between gap-3">
            <span className="inline-flex items-center gap-1 text-[#6B7280]">
              <Ruler size={13} className="text-gray-400" />
              Area
            </span>
            <span className="font-semibold text-gray-800">
              {item.sizeValue ? `${item.sizeValue} ${item.sizeUnit || "sqft"}` : "On request"}
            </span>
          </div>

          {(item.bedrooms || item.bathrooms) ? (
            <div className="flex gap-4 pt-0.5 text-gray-500">
              {item.bedrooms ? (
                <span className="inline-flex items-center gap-1">
                  <BedDouble size={13} className="text-gray-400" />
                  {item.bedrooms} beds
                </span>
              ) : null}
              {item.bathrooms ? (
                <span className="inline-flex items-center gap-1">
                  <Bath size={13} className="text-gray-400" />
                  {item.bathrooms} baths
                </span>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* View Details Primary Button */}
        <Link href={detailUrl} className="btn btn-primary mt-auto w-full">
          <span>View Details</span>
          <ArrowRight size={15} />
        </Link>

        {/* Alternative Secondary Actions */}
        {!variant && !children && (
          <div className="mt-2 grid grid-cols-2 gap-2">
            <a
              href={`tel:${item.contactNumber || ""}`}
              className="btn btn-secondary text-xs"
            >
              Call
            </a>
            <a
              href={`https://wa.me/91${String(item.contactNumber || "").replace(/\D/g, "").slice(-10)}`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-tertiary text-xs"
            >
              WhatsApp
            </a>
          </div>
        )}

        {children && <div className="mt-3 flex flex-wrap gap-2">{children}</div>}
      </div>
    </article>
  );
}
