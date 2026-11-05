import React from "react";
import {
  Maximize2,
  Compass,
  Building2,
  Layers,
  Home,
  Clock,
  Calendar,
  FileText,
  Award,
  CheckCircle2,
  MapPin,
  Tag,
  ShieldCheck,
  Bed,
  Bath,
  Ruler,
  Check,
  X,
  Sparkles,
} from "lucide-react";
import { MEASUREMENT_UNITS, normalizeUnitKey } from "@/lib/unitConversions";

// Map each spec key to its appropriate icon
const SPEC_ICONS = {
  areaCombined: Maximize2,
  plotLength: Ruler,
  plotWidth: Ruler,
  facing: Compass,
  roadWidthFt: Compass,
  isCornerPlot: Building2,
  ownershipType: FileText,
  nearbyLandmark: MapPin,
  negotiable: Tag,
  bedrooms: Bed,
  bathrooms: Bath,
  floorNumber: Layers,
  totalFloors: Layers,
  furnishing: Home,
  propertyAgeYears: Clock,
  possession: Calendar,
  reraNumber: Award,
  authorityApproved: CheckCircle2,
  loanAvailable: ShieldCheck,
};

// Formats the area unit display string nicely (e.g. "sqft" -> "Sqft", "bigha" -> "Bigha")
function formatAreaUnitLabel(unitKey) {
  if (!unitKey) return "Sqft";
  const norm = normalizeUnitKey(unitKey);
  const found = MEASUREMENT_UNITS.find((u) => u.value === norm);
  if (found) {
    // Capitalize short label (e.g. "sq ft" -> "Sq Ft", "bigha" -> "Bigha")
    return found.shortLabel
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }
  return String(unitKey).toUpperCase();
}

export default function PropertySpecifications({ listing }) {
  if (!listing) return null;

  // Build the specifications list dynamically
  const specs = [];

  // 1. Combine Area + Area Unit into a single specification
  if (listing.sizeValue !== null && listing.sizeValue !== undefined && listing.sizeValue !== "") {
    const unitLabel = formatAreaUnitLabel(listing.sizeUnit);
    specs.push({
      key: "areaCombined",
      label: "Area",
      value: `${Number(listing.sizeValue).toLocaleString("en-IN")} ${unitLabel}`,
      icon: SPEC_ICONS.areaCombined,
      isPrimary: true,
    });
  }

  // 2. Plot dimensions
  if (listing.plotLength) {
    specs.push({
      key: "plotLength",
      label: "Plot Length",
      value: `${listing.plotLength} ft`,
      icon: SPEC_ICONS.plotLength,
    });
  }

  if (listing.plotWidth) {
    specs.push({
      key: "plotWidth",
      label: "Plot Width",
      value: `${listing.plotWidth} ft`,
      icon: SPEC_ICONS.plotWidth,
    });
  }

  // 3. Facing & Road
  if (listing.facing) {
    specs.push({
      key: "facing",
      label: "Facing",
      value: String(listing.facing).replaceAll("_", " "),
      icon: SPEC_ICONS.facing,
    });
  }

  if (listing.roadWidthFt) {
    specs.push({
      key: "roadWidthFt",
      label: "Front Road Width",
      value: `${listing.roadWidthFt} ft`,
      icon: SPEC_ICONS.roadWidthFt,
    });
  }

  // 4. Corner Property
  if (listing.isCornerPlot !== null && listing.isCornerPlot !== undefined && listing.isCornerPlot !== "") {
    specs.push({
      key: "isCornerPlot",
      label: "Corner Property",
      value: listing.isCornerPlot ? "Yes (Corner Plot)" : "No",
      icon: SPEC_ICONS.isCornerPlot,
    });
  }

  // 5. Ownership
  if (listing.ownershipType) {
    specs.push({
      key: "ownershipType",
      label: "Ownership",
      value: String(listing.ownershipType).replaceAll("_", " "),
      icon: SPEC_ICONS.ownershipType,
    });
  }

  // 6. Nearby Landmark
  if (listing.nearbyLandmark) {
    specs.push({
      key: "nearbyLandmark",
      label: "Nearby Landmark",
      value: listing.nearbyLandmark,
      icon: SPEC_ICONS.nearbyLandmark,
    });
  }

  // 7. Price Negotiable
  if (listing.negotiable !== null && listing.negotiable !== undefined && listing.negotiable !== "") {
    specs.push({
      key: "negotiable",
      label: "Price Negotiable",
      value: listing.negotiable ? "Yes (Negotiable)" : "Fixed Price",
      icon: SPEC_ICONS.negotiable,
    });
  }

  // 8. Rooms & Structure (Bedrooms, Bathrooms, Floors)
  if (listing.bedrooms) {
    specs.push({
      key: "bedrooms",
      label: "Bedrooms",
      value: `${listing.bedrooms} BHK`,
      icon: SPEC_ICONS.bedrooms,
    });
  }

  if (listing.bathrooms) {
    specs.push({
      key: "bathrooms",
      label: "Bathrooms",
      value: `${listing.bathrooms} Baths`,
      icon: SPEC_ICONS.bathrooms,
    });
  }

  if (listing.floorNumber !== null && listing.floorNumber !== undefined && listing.floorNumber !== "") {
    specs.push({
      key: "floorNumber",
      label: "Floor",
      value: String(listing.floorNumber),
      icon: SPEC_ICONS.floorNumber,
    });
  }

  if (listing.totalFloors) {
    specs.push({
      key: "totalFloors",
      label: "Total Floors",
      value: `${listing.totalFloors} Floors`,
      icon: SPEC_ICONS.totalFloors,
    });
  }

  if (listing.furnishing) {
    specs.push({
      key: "furnishing",
      label: "Furnishing",
      value: String(listing.furnishing).replaceAll("_", " "),
      icon: SPEC_ICONS.furnishing,
    });
  }

  if (listing.possession) {
    specs.push({
      key: "possession",
      label: "Possession Status",
      value: String(listing.possession).replaceAll("_", " "),
      icon: SPEC_ICONS.possession,
    });
  }

  if (listing.propertyAgeYears !== null && listing.propertyAgeYears !== undefined && listing.propertyAgeYears !== "") {
    specs.push({
      key: "propertyAgeYears",
      label: "Property Age",
      value: `${listing.propertyAgeYears} ${Number(listing.propertyAgeYears) === 1 ? "Year" : "Years"}`,
      icon: SPEC_ICONS.propertyAgeYears,
    });
  }

  if (listing.authorityApproved !== null && listing.authorityApproved !== undefined && listing.authorityApproved !== "") {
    specs.push({
      key: "authorityApproved",
      label: "Authority Approved",
      value: listing.authorityApproved ? "Yes (Approved)" : "No",
      icon: SPEC_ICONS.authorityApproved,
    });
  }

  if (listing.reraNumber) {
    specs.push({
      key: "reraNumber",
      label: "RERA Number",
      value: listing.reraNumber,
      icon: SPEC_ICONS.reraNumber,
    });
  }

  if (listing.loanAvailable !== null && listing.loanAvailable !== undefined && listing.loanAvailable !== "") {
    specs.push({
      key: "loanAvailable",
      label: "Bank Loan Available",
      value: listing.loanAvailable ? "Available" : "Not Available",
      icon: SPEC_ICONS.loanAvailable,
    });
  }

  if (specs.length === 0) {
    return null;
  }

  return (
    <div className="rounded-3xl border border-gray-200/90 bg-white p-6 sm:p-8 shadow-sm transition-all duration-300">
      {/* SECTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-100 pb-5 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#fff1f2] to-[#ffe4e6] text-[#c41920] shadow-xs">
            <Ruler className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-xl sm:text-2xl font-bold text-[#180e0f] tracking-tight">
                Property Specifications
              </h2>
            </div>
            <p className="text-xs text-gray-700 font-medium mt-0.5">
              Verified dimensional, structural & legal attributes
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50/80 px-3 py-1 text-xs font-semibold text-gray-700">
            <span className="h-1.5 w-1.5 rounded-full bg-[#c41920]" />
            {specs.length} Verified Details
          </span>
        </div>
      </div>

      {/* SPECIFICATIONS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {specs.map((item) => {
          const Icon = item.icon || FileText;
          return (
            <div
              key={item.key}
              className={`group relative flex items-center gap-3.5 rounded-2xl border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                item.isPrimary
                  ? "border-[#c41920]/25 bg-gradient-to-br from-white via-white to-[#fff8f8] hover:border-[#c41920]/60 hover:shadow-[#c41920]/5"
                  : "border-gray-200/80 bg-white hover:border-[#c41920]/30 hover:bg-[#fafafa]/80"
              }`}
            >
              {/* Icon Container */}
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition duration-200 ${
                  item.isPrimary
                    ? "bg-[#fff1f2] text-[#c41920] group-hover:bg-[#c41920] group-hover:text-white"
                    : "bg-gray-100/90 text-gray-600 group-hover:bg-[#fff1f2] group-hover:text-[#c41920]"
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>

              {/* Label & Value */}
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-medium uppercase tracking-wider text-gray-600 font-semibold group-hover:text-gray-700 font-medium transition truncate">
                  {item.label}
                </p>
                <p
                  className={`mt-0.5 text-sm font-bold truncate capitalize transition ${
                    item.isPrimary
                      ? "text-[#8e1016] group-hover:text-[#c41920]"
                      : "text-gray-900 group-hover:text-black"
                  }`}
                  title={item.value}
                >
                  {item.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

