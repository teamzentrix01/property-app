import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { currentUser, isScopedAreaAdmin } from "@/lib/serverAuth";
import { formatPrice } from "@/lib/formatters";
import PropertyActions from "@/components/PropertyActions";
import { ADMIN_CONTACT } from "@/lib/adminContact";
import PropertyGallery from "@/components/PropertyGallery";
import PropertyCard from "@/components/PropertyCard";
import EstimatedUnitRateSelector from "@/components/EstimatedUnitRateSelector";
import PropertySpecifications from "@/components/PropertySpecifications";
import BhoomiPropertySidebarCards from "@/components/BhoomiPropertySidebarCards";
import HomeLoanEstimator from "@/components/HomeLoanEstimator";
import RequestVisitButton from "@/components/RequestVisitButton";
import Link from "next/link";
import {
  Train,
  GraduationCap,
  HeartPulse,
  ShoppingBag,
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
  // Admin contact 7417499974 so owner number is private
  const phone = ADMIN_CONTACT.phone;
  const isOwner = viewer?.id === listing.ownerId;
  const unitPrice = listing.sizeValue ? Number(listing.price) / listing.sizeValue : null;

  const priceNum = Number(listing.price) || 0;

  const recommendationBaseWhere = { status: "APPROVED", id: { not: listing.id } };
  let recommendedListings = [];
  // When the owner views their own property, hide all recommendations & related listings
  if (!isOwner) {
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
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-gray-700 font-medium">
            <Link href="/" className="hover:text-[#c41920] transition flex items-center gap-1">
              <Home className="h-3.5 w-3.5" />
              <span>Home</span>
            </Link>
            <ChevronRight className="h-3 w-3 text-gray-600 font-semibold" />
            <Link href={`/properties?city=${encodeURIComponent(listing.city)}`} className="hover:text-[#c41920] transition">
              {listing.city}
            </Link>
            <ChevronRight className="h-3 w-3 text-gray-600 font-semibold" />
            <span className="text-gray-800 font-medium truncate max-w-[200px] sm:max-w-xs">
              {listing.area}
            </span>
          </nav>

          <div className="flex items-center gap-2">
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
            {/* Enhanced Premium Header Card */}
            <div className="relative overflow-hidden rounded-3xl border border-gray-200/90 bg-white p-6 sm:p-8 shadow-sm transition-all hover:shadow-md">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 via-[#c41920] to-amber-500" />

              {/* Badges Bar with Premium Styling */}
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-300 bg-gradient-to-r from-teal-50 to-emerald-50 px-3.5 py-1.5 text-xs font-extrabold text-teal-900 shadow-xs transition hover:scale-105">
                  <ShieldCheck className="h-4 w-4 text-teal-600 stroke-[2.5]" />
                  <span>✓ MDA Approved</span>
                </span>
                {listing.status === "APPROVED" && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-gradient-to-r from-emerald-50 to-teal-50 px-3.5 py-1.5 text-xs font-extrabold text-emerald-900 shadow-xs">
                    <BadgeCheck className="h-4 w-4 text-emerald-600 stroke-[2.5]" />
                    <span>Verified Listing</span>
                  </span>
                )}
                <span className="rounded-full bg-slate-100 border border-slate-200/80 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs">
                  {listing.postedBy === "BROKER" ? "Listed by Verified Agent" : "Direct from Owner"}
                </span>
                {listing.reraNumber && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-gradient-to-r from-amber-50 to-yellow-50 px-3.5 py-1.5 text-xs font-extrabold text-amber-900 shadow-xs">
                    <Award className="h-3.5 w-3.5 text-amber-600 stroke-[2.5]" />
                    <span>RERA: {listing.reraNumber}</span>
                  </span>
                )}
              </div>

              {/* Title & Location */}
              <div className="mt-5">
                <h1 className="font-display text-2xl sm:text-3xl lg:text-[34px] font-extrabold tracking-tight text-[#180e0f] leading-snug">
                  {listing.title}
                </h1>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-gray-600">
                  <div className="flex items-center gap-1.5 font-medium text-gray-800 bg-gray-50 border border-gray-200/80 rounded-xl px-3 py-1">
                    <MapPin className="h-4 w-4 shrink-0 text-[#c41920]" />
                    <span>{listing.area}, {listing.city}</span>
                  </div>
                  {listing.nearbyLandmark && (
                    <span className="inline-flex items-center gap-1 rounded-xl bg-red-50/70 border border-red-100 px-3 py-1 text-xs font-semibold text-[#c41920]">
                      📍 Near {listing.nearbyLandmark}
                    </span>
                  )}
                </div>
              </div>

              {/* Price & Unit Calculator Banner */}
              <div className="mt-6 flex flex-wrap items-center justify-between gap-5 rounded-2xl bg-gradient-to-br from-[#fcfbf9] to-[#f7f4ed] p-5 border border-amber-200/60 shadow-inner">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-700 font-medium">
                      Expected Price
                    </span>
                    <span className="rounded-md bg-[#8e1016]/10 px-2 py-0.5 text-[10px] font-extrabold text-[#8e1016]">
                      {listing.negotiable ? "Negotiable" : "Fixed Quoted"}
                    </span>
                  </div>
                  <div className="mt-1 flex items-baseline gap-3">
                    <span className="font-display text-3xl sm:text-4xl font-black text-[#8e1016] tracking-tight">
                      {formatPrice(listing.price, listing.purpose)}
                    </span>
                  </div>
                </div>

                {unitPrice && (
                  <div className="shrink-0">
                    <EstimatedUnitRateSelector
                      price={Number(listing.price)}
                      sizeValue={listing.sizeValue}
                      sizeUnit={listing.sizeUnit || "sqft"}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* ── KEY HIGHLIGHTS CARDS ── */}
            <div className="rounded-3xl border border-gray-200/90 bg-white p-6 sm:p-7 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-5">
                <h2 className="text-base font-extrabold text-[#180e0f] flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-100/80 text-[#c41920]">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <span>Key Property Highlights</span>
                </h2>
                <span className="text-xs font-semibold text-gray-600 font-semibold bg-gray-50 border border-gray-200/60 rounded-full px-2.5 py-0.5">
                  Verified Specs
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3">
                {highlights.map((h) => {
                  const Icon = h.icon;
                  return (
                    <div
                      key={h.label}
                      className="group flex items-center gap-3.5 rounded-2xl border border-gray-200/70 bg-gradient-to-br from-white to-gray-50/70 p-4 shadow-2xs transition-all duration-300 hover:-translate-y-0.5 hover:border-[#c41920]/40 hover:shadow-md"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-[#c41920] ring-4 ring-red-50/50 transition duration-300 group-hover:bg-[#c41920] group-hover:text-white group-hover:ring-red-100">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-gray-600 font-semibold truncate">
                          {h.label}
                        </p>
                        <p className="mt-0.5 text-[15px] font-extrabold text-[#180e0f] capitalize truncate">
                          {h.value}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── DETAILED SPECIFICATIONS ── */}
            <PropertySpecifications listing={listing} />

            {/* ── DESCRIPTION / ABOUT ── */}
            {listing.description && (
              <div className="rounded-3xl border border-gray-200/90 bg-white p-6 sm:p-8 shadow-sm">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#c41920]/10 text-[#c41920]">
                    <FileText className="h-4 w-4" />
                  </div>
                  <h2 className="font-display text-xl sm:text-2xl font-bold text-[#180e0f]">
                    About This Property
                  </h2>
                </div>
                <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-line border-l-3 border-[#c41920] bg-gray-50/60 p-4 sm:p-5 rounded-r-2xl border-y border-r border-gray-100">
                  {listing.description}
                </div>
              </div>
            )}

            {/* ── BHOOMI TRUST & VERIFIED GUARANTEE STRIP ── */}
            <div className="rounded-3xl border border-emerald-200/90 bg-gradient-to-r from-emerald-50/80 via-teal-50/50 to-white p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20">
                    <ShieldCheck className="h-6 w-6 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-emerald-950">
                      100% Bhoomi Verified Listing
                    </h3>
                    <p className="text-xs text-emerald-800/80 mt-0.5">
                      Ground verification checked • Direct price guarantee • Zero unauthorized brokerage
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="rounded-full bg-emerald-600/10 text-emerald-800 font-bold px-3 py-1 text-xs border border-emerald-300">
                    Inspected & Approved
                  </span>
                </div>
              </div>
            </div>

            {/* ── LOCATION & NEIGHBOURHOOD (ENHANCED & SPACIOUS) ── */}
            <div className="rounded-3xl border border-gray-200/90 bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-100/80 text-[#c41920]">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <h2 className="font-display text-xl sm:text-2xl font-bold text-[#180e0f]">
                    Location & Neighbourhood Insights
                  </h2>
                </div>
                <span className="rounded-full bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-bold text-slate-700">
                  {listing.city}
                </span>
              </div>

              {/* Main Dark Locality Banner */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a1314] via-[#211718] to-[#120a0b] p-6 text-white shadow-md">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#c41920] text-white shadow-lg shadow-red-900/40">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {listing.area ? `${listing.area}, ` : ""}{listing.city}
                    </h3>
                    <p className="mt-1.5 text-xs text-white/80 leading-relaxed max-w-xl">
                      Strategically located with direct accessibility to arterial road corridors, commercial hubs, verified utilities, and civic infrastructure.
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-white/15 pt-4 text-xs font-medium text-white/85">
                  <div className="flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1 backdrop-blur-xs">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span>Verified Pin Code</span>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1 backdrop-blur-xs">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span>Physical Verification Available</span>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1 backdrop-blur-xs">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span>Clear Title Deed</span>
                  </div>
                </div>
              </div>

              {/* ── NEIGHBOURHOOD CONNECTIVITY & DISTANCES MATRIX ── */}
              <div className="mt-6">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-700 mb-3 flex items-center gap-2">
                  <Compass className="h-4 w-4 text-[#c41920]" />
                  <span>Key Distance & Connectivity Matrix</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="rounded-2xl border border-gray-200/80 bg-gradient-to-br from-white to-gray-50/70 p-3.5 shadow-2xs">
                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
                      <Train className="h-4 w-4 text-blue-600" />
                      <span>Transit & Metro</span>
                    </div>
                    <p className="mt-1.5 text-sm font-black text-gray-900">5 - 10 Mins</p>
                    <p className="text-[10px] text-gray-500 font-medium">Railway & Bus Terminus</p>
                  </div>

                  <div className="rounded-2xl border border-gray-200/80 bg-gradient-to-br from-white to-gray-50/70 p-3.5 shadow-2xs">
                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
                      <GraduationCap className="h-4 w-4 text-purple-600" />
                      <span>Schools & Colleges</span>
                    </div>
                    <p className="mt-1.5 text-sm font-black text-gray-900">1 - 2 Km</p>
                    <p className="text-[10px] text-gray-500 font-medium">Top Tier Institutions</p>
                  </div>

                  <div className="rounded-2xl border border-gray-200/80 bg-gradient-to-br from-white to-gray-50/70 p-3.5 shadow-2xs">
                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
                      <HeartPulse className="h-4 w-4 text-emerald-600" />
                      <span>Healthcare</span>
                    </div>
                    <p className="mt-1.5 text-sm font-black text-gray-900">2 - 3 Km</p>
                    <p className="text-[10px] text-gray-500 font-medium">Multi-speciality Hospital</p>
                  </div>

                  <div className="rounded-2xl border border-gray-200/80 bg-gradient-to-br from-white to-gray-50/70 p-3.5 shadow-2xs">
                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
                      <ShoppingBag className="h-4 w-4 text-amber-600" />
                      <span>Daily Needs</span>
                    </div>
                    <p className="mt-1.5 text-sm font-black text-gray-900">Walking Dist.</p>
                    <p className="text-[10px] text-gray-500 font-medium">Market, Grocery & Banks</p>
                  </div>
                </div>
              </div>

              {/* ── BHOOMI FREE ON-GROUND SITE VISIT ASSISTANCE ── */}
              <div className="mt-6 rounded-2xl border border-red-200/90 bg-gradient-to-r from-red-50/90 via-[#fff8f8] to-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#c41920] text-white shadow-sm">
                    <Car className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-gray-950">
                      Want a Guided On-Ground Site Inspection?
                    </h4>
                    <p className="text-xs text-gray-700 font-medium mt-0.5">
                      Our authorized area representative will accompany you for boundary marking and physical verification.
                    </p>
                  </div>
                </div>
                <RequestVisitButton
                  phone={phone}
                  whatsappMessage={formattedWhatsappMessage}
                  listingId={listing.id}
                />
              </div>

              {/* ── BHOOMI VERIFIED TITLE & ADVANTAGE SECTION (LEFT SIDE TO FILL VACANT SPACE) ── */}
              <div className="mt-8 border-t border-gray-100 pt-8">
                <BhoomiPropertySidebarCards
                  price={priceNum}
                  title={listing.title}
                  city={listing.city}
                  area={listing.area}
                  showOnlyAssurance={true}
                />
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
                    <p className="text-xs uppercase tracking-wider text-gray-600 font-semibold font-semibold">
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
                      <LayoutDashboard className="h-4 w-4 text-gray-700 font-medium" />
                      View Dashboard & Inquiries
                    </Link>
                  </div>

                  <p className="mt-4 text-center text-xs text-gray-600 font-semibold leading-normal">
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
                      <p className="text-xs text-gray-700 font-medium truncate">
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
                      isLoggedIn={Boolean(viewer)}
                    />
                  </div>

                  {/* Trust Signals */}
                  <div className="mt-6 space-y-2.5 border-t border-gray-100 pt-5 text-xs text-gray-700 font-medium">
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

            {/* 2. COMPACT EMI CALCULATOR (BUYER ONLY) - Placed in right sidebar column */}
            {viewer?.role === "BUYER" && listing.purpose === "SALE" && (
              <HomeLoanEstimator
                price={priceNum}
                purpose={listing.purpose}
                formattedPrice={formatPrice(listing.price, listing.purpose)}
                listingId={listing.id}
                propertyTitle={listing.title}
                propertyLocation={`${listing.area ? `${listing.area}, ` : ""}${listing.city}`}
                compact={true}
              />
            )}


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
                  <p className="text-[11px] text-gray-600 font-semibold">
                    Guided on-ground visit at your convenience
                  </p>
                </div>
              </div>

              <p className="mt-3.5 text-xs leading-5 text-gray-600">
                Want to inspect <strong>{listing.title}</strong> in person? Our area manager can arrange physical site entry, document review, and builder meetings.
              </p>

              <div className="mt-4 space-y-2">
                {viewer ? (
                  <>
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
                      href="tel:+917417499974"
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-2.5 text-center text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
                    >
                      <Phone className="h-3.5 w-3.5 text-[#c41920]" />
                      <span>Call Helpline: +91 74174 99974</span>
                    </a>
                  </>
                ) : (
                  <>
                    <Link
                      href={`/login?next=/listings/${listing.id}`}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-center text-xs font-bold text-white transition hover:bg-emerald-700 shadow-xs"
                    >
                      <MessageCircle className="h-4 w-4" />
                      <span>Book Visit via WhatsApp</span>
                    </Link>
                    <Link
                      href={`/login?next=/listings/${listing.id}`}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-2.5 text-center text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
                    >
                      <Phone className="h-3.5 w-3.5 text-[#c41920]" />
                      <span>Call Helpline: +91 74174 99974</span>
                    </Link>
                  </>
                )}
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

              <div className="mt-5 rounded-xl bg-gray-50 p-3 text-[11px] text-gray-700 font-medium flex items-center justify-between">
                <span>Need legal help?</span>
                <Link href="/contact-us" className="font-bold text-[#c41920] hover:underline">
                  Talk to Expert →
                </Link>
              </div>
            </div>

            {/* Additional Rich Bhoomi Content: Locality Trends */}
            <BhoomiPropertySidebarCards
              price={priceNum}
              title={listing.title}
              city={listing.city}
              area={listing.area}
              showOnlyTrends={true}
            />
          </aside>
        </div>

        {/* ── RECOMMENDED PROPERTIES ── */}
        {recommendedListings.length > 0 && (
          <section className="mt-16 border-t border-gray-200/80 pt-12">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase tracking-widest text-[#c41920]">
                  Similar Options
                </p>
                <h2 className="mt-1.5 font-display text-3xl sm:text-4xl font-bold text-[#180e0f] tracking-tight">
                  Recommended Properties in {listing.city}
                </h2>
                <p className="mt-2 text-base text-gray-700 font-medium">
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
