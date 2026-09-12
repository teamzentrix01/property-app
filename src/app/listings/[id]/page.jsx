import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { currentUser, isScopedAreaAdmin } from "@/lib/serverAuth";
import { formatPrice } from "@/lib/formatters";
import PropertyActions from "@/components/PropertyActions";
import PropertyGallery from "@/components/PropertyGallery";
import PropertyCard from "@/components/PropertyCard";
import Link from "next/link";
import {
  BadgeCheck,
  MapPin,
  Building2,
  Maximize2,
  Compass,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ChevronRight,
  Home,
  Award,
  FileText,
  Layers,
  Tag,
  Bed,
  Bath,
  Sparkles,
  Phone,
  MessageCircle,
  Edit3,
  LayoutDashboard,
  ArrowRight,
  Calculator,
  Percent,
  Car,
  HelpCircle,
  Lock,
} from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import { serializeForClient } from "@/lib/formatters";

const LABELS = {
  sizeValue: "Area",
  sizeUnit: "Area unit",
  plotLength: "Plot length",
  plotWidth: "Plot width",
  facing: "Facing",
  roadWidthFt: "Front road width",
  isCornerPlot: "Corner property",
  bedrooms: "Bedrooms",
  bathrooms: "Bathrooms",
  floorNumber: "Floor",
  totalFloors: "Total floors",
  furnishing: "Furnishing",
  propertyAgeYears: "Property age",
  possession: "Possession",
  ownershipType: "Ownership",
  reraNumber: "RERA number",
  authorityApproved: "Authority approved",
  nearbyLandmark: "Nearby landmark",
  negotiable: "Price negotiable",
  loanAvailable: "Loan available",
};

const DETAIL_ICONS = {
  bedrooms: Bed,
  bathrooms: Bath,
  sizeValue: Maximize2,
  sizeUnit: Maximize2,
  plotLength: Maximize2,
  plotWidth: Maximize2,
  facing: Compass,
  roadWidthFt: Compass,
  isCornerPlot: Building2,
  floorNumber: Layers,
  totalFloors: Layers,
  furnishing: Home,
  propertyAgeYears: Clock,
  possession: Calendar,
  ownershipType: FileText,
  reraNumber: Award,
  authorityApproved: CheckCircle2,
  nearbyLandmark: MapPin,
  negotiable: Tag,
  loanAvailable: ShieldCheck,
};

export default async function ListingDetail({ params }) {
  const { id } = await params;
  let listing;
  try {
    listing = await prisma.listing.findUnique({
      where: { id },
      include: {
        photos: true,
        owner: {
          select: {
            name: true,
            phone: true,
            role: true,
            brokerAgency: true,
            verified: true,
          },
        },
      },
    });
  } catch {
    listing = null;
  }
  if (!listing) return notFound();

  const viewer = await currentUser();
  if (listing.status !== "APPROVED") {
    const canView =
      viewer &&
      (viewer.id === listing.ownerId ||
        viewer.role === "SUPER_ADMIN" ||
        (isScopedAreaAdmin(viewer) && viewer.adminArea === listing.city));
    if (!canView) return notFound();
  }

  const details = Object.entries(LABELS).filter(
    ([k]) =>
      listing[k] !== null && listing[k] !== undefined && listing[k] !== "",
  );
  const phone = listing.owner?.phone || listing.contactNumber;
  const isOwner = viewer?.id === listing.ownerId;
  const unitPrice = listing.sizeValue ? Number(listing.price) / listing.sizeValue : null;

  const priceNum = Number(listing.price) || 0;
  const isRent = listing.purpose === "RENT";
  const principal = priceNum * 0.8;
  const monthlyRate = 0.085 / 12;
  const tenureMonths = 240;
  const estimatedEmi =
    priceNum > 0 && !isRent
      ? Math.round(
          (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
            (Math.pow(1 + monthlyRate, tenureMonths) - 1),
        )
      : null;

  const recommendationBaseWhere = { status: "APPROVED", id: { not: listing.id } };
  let recommendedListings = [];
  try {
    const includeRecommendationData = {
      photos: true,
      owner: { select: { verified: true } },
    };
    const [closestMatches, cityMatches, typeAndPurposeMatches, otherMatches] = await Promise.all([
      prisma.listing.findMany({
        where: { ...recommendationBaseWhere, city: listing.city, propertyType: listing.propertyType, purpose: listing.purpose },
        include: includeRecommendationData,
        orderBy: { createdAt: "desc" },
        take: 4,
      }),
      prisma.listing.findMany({
        where: { ...recommendationBaseWhere, city: listing.city },
        include: includeRecommendationData,
        orderBy: { createdAt: "desc" },
        take: 4,
      }),
      prisma.listing.findMany({
        where: { ...recommendationBaseWhere, propertyType: listing.propertyType, purpose: listing.purpose },
        include: includeRecommendationData,
        orderBy: { createdAt: "desc" },
        take: 4,
      }),
      prisma.listing.findMany({
        where: recommendationBaseWhere,
        include: includeRecommendationData,
        orderBy: { createdAt: "desc" },
        take: 4,
      }),
    ]);
    recommendedListings = Array.from(
      new Map(
        [...closestMatches, ...cityMatches, ...typeAndPurposeMatches, ...otherMatches].map((item) => [item.id, item]),
      ).values(),
    ).slice(0, 4);
  } catch {
    recommendedListings = [];
  }

  // Highlights list
  const highlights = [
    {
      label: "Property Type",
      value: listing.propertyType?.replaceAll("_", " "),
      icon: Building2,
    },
    {
      label: "Super Area",
      value: listing.sizeValue
        ? `${listing.sizeValue} ${listing.sizeUnit || "sq ft"}`
        : "On Request",
      icon: Maximize2,
    },
    ...(listing.bedrooms
      ? [{ label: "Bedrooms", value: `${listing.bedrooms} BHK`, icon: Bed }]
      : []),
    ...(listing.bathrooms
      ? [{ label: "Bathrooms", value: `${listing.bathrooms} Bath${listing.bathrooms > 1 ? "s" : ""}`, icon: Bath }]
      : []),
    {
      label: "Facing",
      value: listing.facing || "East / Standard",
      icon: Compass,
    },
    {
      label: listing.propertyType === "PLOT" ? "Front Road" : "Possession Status",
      value:
        listing.propertyType === "PLOT"
          ? listing.roadWidthFt
            ? `${listing.roadWidthFt} ft wide`
            : "Available"
          : listing.possession?.replaceAll("_", " ") || "Ready to Move",
      icon: Calendar,
    },
  ];

  const formattedWhatsappMessage = `Hi, I am interested in ${listing.title} (${listing.area}, ${listing.city}). Please schedule a site visit.`;

  return (
    <main className="min-h-screen flex-1 bg-[#f8f9fa] pb-28 md:pb-20 text-[#180e0f]">
      {/* ── TOP BREADCRUMB & CONTEXT BAR ── */}
      <section className="border-b border-gray-200/70 bg-white shadow-2xs">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 flex flex-wrap items-center justify-between gap-3">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-gray-500">
            <Link href="/" className="hover:text-[#c41920] transition flex items-center gap-1">
              <Home className="h-3.5 w-3.5" />
              <span>Home</span>
            </Link>
            <ChevronRight className="h-3 w-3 text-gray-400" />
            <Link href={`/properties?city=${encodeURIComponent(listing.city)}`} className="hover:text-[#c41920] transition">
              {listing.city}
            </Link>
            <ChevronRight className="h-3 w-3 text-gray-400" />
            <span className="text-gray-800 font-medium truncate max-w-[200px] sm:max-w-xs">
              {listing.area}
            </span>
          </nav>

          <div className="flex items-center gap-2">
            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-600">
              ID: #{listing.id.slice(-6).toUpperCase()}
            </span>
            <span className="rounded-full bg-[#fff1f2] border border-[#fecdd3] px-3 py-1 text-[11px] font-bold text-[#c41920] uppercase tracking-wider">
              For {listing.purpose === "RENT" ? "Rent" : "Sale"}
            </span>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* ── PHOTO GALLERY ── */}
        <div className="mb-8">
          <PropertyGallery
            photos={listing.photos.map((photo) => ({ id: photo.id, url: photo.url }))}
            title={listing.title}
          />
        </div>

        {/* ── MAIN CONTENT GRID ── */}
        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          {/* LEFT COLUMN: Property Overview & Specs */}
          <section className="space-y-8 min-w-0">
            {/* Header / Badges / Price Header Card */}
            <div className="rounded-3xl border border-gray-200/80 bg-white p-6 sm:p-8 shadow-sm">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
                {listing.status === "APPROVED" && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    Verified Listing
                  </span>
                )}
                {listing.reraNumber && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800">
                    <Award className="h-3.5 w-3.5 text-amber-600" />
                    RERA: {listing.reraNumber}
                  </span>
                )}
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                  {listing.postedBy === "BROKER" ? "Listed by Verified Agent" : "Direct from Owner"}
                </span>
              </div>

              {/* Title & Location */}
              <div className="mt-4">
                <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[#180e0f] leading-tight">
                  {listing.title}
                </h1>
                <div className="mt-2.5 flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4 shrink-0 text-[#c41920]" />
                  <span className="font-medium text-gray-800">
                    {listing.area}, {listing.city}
                  </span>
                  {listing.nearbyLandmark && (
                    <span className="hidden sm:inline text-xs text-gray-400">
                      • Near {listing.nearbyLandmark}
                    </span>
                  )}
                </div>
              </div>

              {/* Price Banner */}
              <div className="mt-6 flex flex-wrap items-baseline justify-between gap-4 border-t border-gray-100 pt-6">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Expected Price
                  </p>
                  <div className="mt-1 flex items-baseline gap-3">
                    <span className="font-display text-3xl sm:text-4xl font-extrabold text-[#8e1016]">
                      {formatPrice(listing.price, listing.purpose)}
                    </span>
                    <span className="rounded-md bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                      {listing.negotiable ? "Negotiable" : "Quoted Price"}
                    </span>
                  </div>
                </div>

                {unitPrice && (
                  <div className="text-right sm:text-left">
                    <p className="text-xs font-medium text-gray-400">Estimated Unit Rate</p>
                    <p className="mt-1 text-sm font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100 inline-block">
                      ₹{Math.round(unitPrice).toLocaleString("en-IN")} / {listing.sizeUnit || "sq ft"}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* ── KEY HIGHLIGHTS CARDS ── */}
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3.5 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#c41920]" />
                Key Property Highlights
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {highlights.map((h) => {
                  const Icon = h.icon;
                  return (
                    <div
                      key={h.label}
                      className="group flex items-start gap-3.5 rounded-2xl border border-gray-200/80 bg-white p-4 shadow-xs transition hover:border-[#c41920]/40 hover:shadow-md"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fff1f2] text-[#c41920] transition group-hover:bg-[#c41920] group-hover:text-white">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400 truncate">
                          {h.label}
                        </p>
                        <p className="mt-0.5 text-sm font-bold text-[#180e0f] capitalize truncate">
                          {h.value}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── DETAILED SPECIFICATIONS ── */}
            <div className="rounded-3xl border border-gray-200/80 bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
                <div>
                  <h2 className="font-display text-xl sm:text-2xl font-bold text-[#180e0f]">
                    Property Specifications
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Verified dimensional and regulatory attributes
                  </p>
                </div>
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-600">
                  {details.length} Details
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {details.map(([k, label]) => {
                  const Icon = DETAIL_ICONS[k] || FileText;
                  const rawVal = listing[k];
                  const formattedVal =
                    typeof rawVal === "boolean"
                      ? rawVal
                        ? "Yes"
                        : "No"
                      : String(rawVal).replaceAll("_", " ") +
                        (["plotLength", "plotWidth", "roadWidthFt"].includes(k) ? " ft" : "");

                  return (
                    <div
                      key={k}
                      className="flex items-center justify-between rounded-xl border border-gray-100 bg-[#fafafa] p-3.5 transition hover:bg-white hover:border-gray-200"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className="h-4 w-4 shrink-0 text-gray-400" />
                        <span className="text-xs font-medium text-gray-600 truncate">{label}</span>
                      </div>
                      <span className="text-xs font-bold text-[#180e0f] capitalize ml-2 shrink-0">
                        {formattedVal}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── DESCRIPTION / ABOUT ── */}
            {listing.description && (
              <div className="rounded-3xl border border-gray-200/80 bg-white p-6 sm:p-8 shadow-sm">
                <h2 className="font-display text-xl sm:text-2xl font-bold text-[#180e0f] mb-4">
                  About This Property
                </h2>
                <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed whitespace-pre-line border-l-2 border-[#c41920] pl-4">
                  {listing.description}
                </div>
              </div>
            )}

            {/* ── LOCATION & LOCALITY ── */}
            <div className="rounded-3xl border border-gray-200/80 bg-white p-6 sm:p-8 shadow-sm">
              <h2 className="font-display text-xl sm:text-2xl font-bold text-[#180e0f] mb-4">
                Location & Neighbourhood
              </h2>
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1c1c1c] to-[#111111] p-6 text-white shadow-inner">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#c41920] text-white shadow-md">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {listing.area}, {listing.city}
                    </h3>
                    <p className="mt-1 text-xs text-white/60 leading-relaxed max-w-xl">
                      Prominent locality with nearby access to highways, transit stations, schools, and markets.
                      Exact site survey and building address are provided upon scheduling a visit.
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-white/10 pt-4 text-xs text-white/70">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span>Verified Pin Code</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span>Physical Verification Available</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span>Clear Title Deed</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* RIGHT COLUMN: Rich, Balanced Sidebar that Covers the Space */}
          <aside className="space-y-6">
            {/* 1. Main Action / Contact Card */}
            <div className="rounded-3xl border border-gray-200/80 bg-white p-6 sm:p-7 shadow-xl shadow-gray-200/50">
              {isOwner ? (
                <div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#fff1f2] text-[#c41920]">
                      <Edit3 className="h-4 w-4" />
                    </span>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#c41920]">
                      Owner Workspace
                    </p>
                  </div>

                  <h2 className="mt-3 font-display text-2xl font-bold text-[#180e0f]">
                    Manage Your Listing
                  </h2>

                  <div className="mt-5 rounded-2xl bg-gray-50 p-4 border border-gray-100">
                    <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
                      Listing Status
                    </p>
                    <div className="mt-2">
                      <StatusBadge status={listing.status} />
                    </div>
                    {listing.rejectionReason && (
                      <p className="mt-2 text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-100">
                        <strong>Reason:</strong> {listing.rejectionReason}
                      </p>
                    )}
                  </div>

                  <div className="mt-5 space-y-2.5">
                    <Link
                      href={`/listings/${listing.id}/edit`}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#c41920] py-3.5 text-center text-sm font-bold text-white transition hover:bg-[#a51319] shadow-sm"
                    >
                      <Edit3 className="h-4 w-4" />
                      Edit Property Details
                    </Link>
                    <Link
                      href="/dashboard"
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-3.5 text-center text-sm font-semibold text-gray-800 transition hover:bg-gray-50"
                    >
                      <LayoutDashboard className="h-4 w-4 text-gray-500" />
                      View Dashboard & Inquiries
                    </Link>
                  </div>

                  <p className="mt-4 text-center text-xs text-gray-400 leading-normal">
                    Keep property specifications updated for higher buyer interest.
                  </p>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-[#fff1f2] px-3 py-1 text-[11px] font-bold text-[#c41920] uppercase tracking-wider">
                      Direct Contact
                    </span>
                    <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700">
                      <BadgeCheck className="h-4 w-4" />
                      Verified
                    </span>
                  </div>

                  <h2 className="mt-3 font-display text-2xl font-bold text-[#180e0f]">
                    Contact {listing.owner?.role === "BROKER" ? "Property Advisor" : "Owner"}
                  </h2>

                  {/* Owner/Broker Profile Box */}
                  <div className="mt-5 flex items-center gap-3.5 rounded-2xl bg-gray-50 p-4 border border-gray-100">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#8e1016] to-[#c41920] font-bold text-white shadow-sm text-base">
                      {listing.owner?.name ? listing.owner.name.charAt(0).toUpperCase() : "B"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-sm text-[#180e0f] truncate">
                        {listing.owner?.name || "Bhoomi Certified Advisor"}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {listing.owner?.brokerAgency || (listing.owner?.role === "BROKER" ? "Certified Real Estate Broker" : "Property Owner")}
                      </p>
                    </div>
                  </div>

                  {/* Actions (WhatsApp, Call, Enquire Modal) */}
                  <div className="mt-5">
                    <PropertyActions
                      listing={{
                        id: listing.id,
                        title: listing.title,
                        area: listing.area,
                        city: listing.city,
                        phone,
                      }}
                    />
                  </div>

                  {/* Trust Signals */}
                  <div className="mt-6 space-y-2.5 border-t border-gray-100 pt-5 text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-emerald-600" />
                      <span>Zero brokerage on direct seller properties</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>Free site visit assistance & price advisory</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Home Loan & EMI Estimator / Rental Calculator Card */}
            <div className="rounded-3xl border border-gray-200/80 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                    <Calculator className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-[#180e0f]">
                      {isRent ? "Rental Financial Overview" : "Home Loan & EMI Estimator"}
                    </h3>
                    <p className="text-[11px] text-gray-400">
                      {isRent ? "Monthly rent & security guidance" : "Indicative monthly calculation"}
                    </p>
                  </div>
                </div>
                <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 uppercase">
                  {isRent ? "Rental" : "8.5% p.a."}
                </span>
              </div>

              {!isRent && estimatedEmi ? (
                <div className="mt-5 space-y-3">
                  <div className="rounded-2xl bg-[#fafafa] p-4 border border-gray-100 text-center">
                    <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
                      Estimated Monthly EMI
                    </p>
                    <p className="mt-1 text-2xl sm:text-3xl font-extrabold text-[#8e1016]">
                      ₹{estimatedEmi.toLocaleString("en-IN")}
                      <span className="text-xs font-normal text-gray-500"> / month</span>
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-xl border border-gray-100 bg-[#fafafa] p-3">
                      <p className="text-gray-400 text-[10px] uppercase">Down Payment (20%)</p>
                      <p className="mt-0.5 font-bold text-[#180e0f]">
                        ₹{Math.round(priceNum * 0.2).toLocaleString("en-IN")}
                      </p>
                    </div>
                    <div className="rounded-xl border border-gray-100 bg-[#fafafa] p-3">
                      <p className="text-gray-400 text-[10px] uppercase">Loan Amount (80%)</p>
                      <p className="mt-0.5 font-bold text-[#180e0f]">
                        ₹{Math.round(principal).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/contact-us"
                    className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border border-emerald-600/30 bg-emerald-50 py-2.5 text-center text-xs font-bold text-emerald-800 transition hover:bg-emerald-100"
                  >
                    <Percent className="h-3.5 w-3.5" />
                    <span>Check Pre-Approved Loan Offers</span>
                  </Link>
                </div>
              ) : (
                <div className="mt-5 space-y-3 text-xs">
                  <div className="rounded-xl border border-gray-100 bg-[#fafafa] p-3.5 flex justify-between items-center">
                    <span className="text-gray-500">Monthly Rent:</span>
                    <span className="font-bold text-[#180e0f]">
                      {formatPrice(listing.price, listing.purpose)}
                    </span>
                  </div>
                  <div className="rounded-xl border border-gray-100 bg-[#fafafa] p-3.5 flex justify-between items-center">
                    <span className="text-gray-500">Security Deposit:</span>
                    <span className="font-bold text-[#180e0f]">
                      ₹{Math.round(priceNum * 2).toLocaleString("en-IN")} (Approx 2 Mo.)
                    </span>
                  </div>
                  <div className="rounded-xl border border-gray-100 bg-[#fafafa] p-3.5 flex justify-between items-center">
                    <span className="text-gray-500">Standard Agreement:</span>
                    <span className="font-bold text-[#180e0f]">11 Months Registered</span>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Schedule a Free Site Visit Card */}
            <div className="rounded-3xl border border-gray-200/80 bg-gradient-to-br from-white to-[#fff8f8] p-6 shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#fff1f2] text-[#c41920]">
                  <Car className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#180e0f]">
                    Schedule a Site Visit
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    Guided on-ground visit at your convenience
                  </p>
                </div>
              </div>

              <p className="mt-3.5 text-xs leading-5 text-gray-600">
                Want to inspect <strong>{listing.title}</strong> in person? Our area manager can arrange physical site entry, document review, and builder meetings.
              </p>

              <div className="mt-4 space-y-2">
                <a
                  href={`https://wa.me/91${String(phone || "").replace(/\D/g, "").slice(-10)}?text=${encodeURIComponent(formattedWhatsappMessage)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-center text-xs font-bold text-white transition hover:bg-emerald-700 shadow-xs"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Book Visit via WhatsApp</span>
                </a>
                <a
                  href="tel:+918500900100"
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-2.5 text-center text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  <Phone className="h-3.5 w-3.5 text-[#c41920]" />
                  <span>Call Helpline: +91 8500 900 100</span>
                </a>
              </div>
            </div>

            {/* 4. Bhoomi Buyer Safety & Assurance Box */}
            <div className="rounded-3xl border border-gray-200/80 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                <ShieldCheck className="h-5 w-5 text-[#c41920]" />
                <h3 className="font-bold text-sm text-[#180e0f]">
                  Bhoomi Buyer Assurance
                </h3>
              </div>

              <ul className="mt-4 space-y-3 text-xs text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                  <span>
                    <strong>100% Genuine Listing:</strong> Verified against land registries and builder master plans.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                  <span>
                    <strong>Zero Spam Policy:</strong> Your contact details are never shared with unauthorized telemarketers.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                  <span>
                    <strong>Legal Support:</strong> Access to certified advocates for sale deed drafting and title searches.
                  </span>
                </li>
              </ul>

              <div className="mt-5 rounded-xl bg-gray-50 p-3 text-[11px] text-gray-500 flex items-center justify-between">
                <span>Need legal help?</span>
                <Link href="/contact-us" className="font-bold text-[#c41920] hover:underline">
                  Talk to Expert →
                </Link>
              </div>
            </div>
          </aside>
        </div>

        {/* ── RECOMMENDED PROPERTIES ── */}
        {recommendedListings.length > 0 && (
          <section className="mt-16 border-t border-gray-200/80 pt-12">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#c41920]">
                  Similar Options
                </p>
                <h2 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-[#180e0f]">
                  Recommended Properties in {listing.city}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Handpicked verified properties matching this property type and locality.
                </p>
              </div>
              <Link
                href={`/properties?city=${encodeURIComponent(listing.city)}`}
                className="inline-flex items-center gap-1.5 text-sm font-bold text-[#c41920] hover:underline"
              >
                <span>View all in {listing.city}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {serializeForClient(recommendedListings).map((recommendedListing) => (
                <PropertyCard key={recommendedListing.id} listing={recommendedListing} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ── MOBILE STICKY BOTTOM BAR ── */}
      {isOwner ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 p-3.5 backdrop-blur-md md:hidden shadow-lg">
          <Link
            href={`/listings/${listing.id}/edit`}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#c41920] py-3 text-center text-sm font-bold text-white shadow-sm"
          >
            <Edit3 className="h-4 w-4" />
            Edit Property Details
          </Link>
        </div>
      ) : (
        <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 gap-2.5 border-t border-gray-200 bg-white/95 p-3 backdrop-blur-md md:hidden shadow-lg">
          <a
            href={`tel:${phone}`}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-gray-300 py-3 text-center text-sm font-bold text-gray-800 transition active:bg-gray-100"
          >
            <Phone className="h-4 w-4 text-[#c41920]" />
            Call Now
          </a>
          <a
            href={`https://wa.me/91${String(phone || "").replace(/\D/g, "").slice(-10)}`}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-3 text-center text-sm font-bold text-white shadow-sm transition active:bg-emerald-700"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </a>
        </div>
      )}
    </main>
  );
}

function Block({ title, children }) {
  return (
    <section className="mt-9">
      <h2 className="mb-4 font-display text-2xl font-bold text-[#180e0f]">{title}</h2>
      {children}
    </section>
  );
}

function StatusTimeline({ status, rejectionReason }) {
  const steps =
    status === "DRAFT"
      ? ["Draft"]
      : status === "REJECTED"
      ? ["Submitted", "Pending", "Under Review", "Rejected"]
      : status === "INACTIVE"
      ? ["Submitted", "Pending", "Under Review", "Approved", "Active", "Inactive"]
      : ["Submitted", "Pending", "Under Review", "Approved", "Active"];
  const statusIndex =
    { DRAFT: 0, PENDING: 1, UNDER_REVIEW: 2, APPROVED: 3, ACTIVE: 4, REJECTED: 3, INACTIVE: 5 }[status] ?? 0;
  return (
    <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-2xl">Listing status</h2>
        <StatusBadge status={status} />
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-2">
        {steps.map((step, index) => (
          <div key={step} className="flex items-center gap-2">
            <span
              className={`rounded-full px-3 py-2 text-xs font-semibold ${
                index === statusIndex
                  ? "bg-ink text-white"
                  : index < statusIndex
                  ? "bg-moss/10 text-moss-deep"
                  : "bg-paper-dim text-ink-soft"
              }`}
            >
              {step}
            </span>
            {index < steps.length - 1 && <span className="text-ink-soft">↓</span>}
          </div>
        ))}
      </div>
      {status === "REJECTED" && rejectionReason && (
        <p className="mt-4 text-sm text-red-700">Reason for rejection: {rejectionReason}</p>
      )}
    </section>
  );
}
