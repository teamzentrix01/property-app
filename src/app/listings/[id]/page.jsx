import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { currentUser, isScopedAreaAdmin } from "@/lib/serverAuth";
import { formatPrice } from "@/lib/formatters";
import PropertyActions from "@/components/PropertyActions";
import PropertyGallery from "@/components/PropertyGallery";
import PropertyCard from "@/components/PropertyCard";
import Link from "next/link";
import { BadgeCheck } from "lucide-react";
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
  return (
    <main className="flex-1 bg-[#f7f7f3] pb-28 md:pb-16">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
        <p className="text-xs text-ink-soft">
          Home / {listing.city} / {listing.area}
        </p>
        <div className="mt-5">
          <PropertyGallery photos={listing.photos.map((photo) => ({ id: photo.id, url: photo.url }))} title={listing.title} />
        </div>
        <div className="mt-7 grid gap-8 lg:grid-cols-[1fr_360px]">
          <section>
            <div className="flex flex-wrap gap-2">
              {listing.status === "APPROVED" && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
                  <BadgeCheck className="h-4 w-4 text-green-600" />
                  Approved by Admin
                </span>
              )}
              {false && <span className="rounded-full bg-moss/10 px-3 py-1 text-xs font-bold text-moss-deep">
                {listing.owner?.verified ? "✓ Owner verified" : "✓ Listing reviewed"}
              </span>}
              {listing.reraNumber && (
                <span className="rounded-full bg-gold/15 px-3 py-1 text-xs font-bold text-gold">
                  RERA
                </span>
              )}
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold">
                {listing.postedBy === "BROKER"
                  ? "Listed by agent"
                  : "Listed by owner"}
              </span>
            </div>
            <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="font-display text-3xl leading-tight sm:text-4xl">
                  {listing.title}
                </h1>
                <p className="mt-2 text-ink-soft">
                  ⌖ {listing.area}, {listing.city}
                </p>
              </div>
              <div>
                <p className="font-display text-3xl font-semibold">
                  {formatPrice(listing.price, listing.purpose)}
                </p>
                <p className="text-right text-xs text-ink-soft">
                  {listing.negotiable ? "Negotiable" : "Quoted price"}
                </p>
                {unitPrice && <p className="mt-1 text-right text-xs font-semibold text-moss-deep">₹{Math.round(unitPrice).toLocaleString("en-IN")} / {listing.sizeUnit || "sq ft"}</p>}
              </div>
            </div>
            <div className="mt-7 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-ink/8 bg-ink/8 sm:grid-cols-4">
              {[
                ["Property type", listing.propertyType.replaceAll("_", " ")],
                [
                  "Area",
                  listing.sizeValue
                    ? `${listing.sizeValue} ${listing.sizeUnit || "sq ft"}`
                    : "Ask seller",
                ],
                ["Facing", listing.facing || "Not shared"],
                [
                  listing.propertyType === "PLOT" ? "Road width" : "Possession",
                  listing.propertyType === "PLOT"
                    ? listing.roadWidthFt
                      ? `${listing.roadWidthFt} ft`
                      : "Not shared"
                    : listing.possession?.replaceAll("_", " ") || "Ask seller",
                ],
              ].map(([a, b]) => (
                <div key={a} className="bg-white p-4">
                  <p className="text-[11px] uppercase tracking-wide text-ink-soft">
                    {a}
                  </p>
                  <p className="mt-1 text-sm font-semibold capitalize">{b}</p>
                </div>
              ))}
            </div>
            <Block title="Property details">
              <dl className="grid gap-px overflow-hidden rounded-2xl bg-ink/8 sm:grid-cols-2">
                {details.map(([k, label]) => (
                  <div
                    key={k}
                    className="flex justify-between bg-white p-4 text-sm"
                  >
                    <dt className="text-ink-soft">{label}</dt>
                    <dd className="font-semibold capitalize">
                      {typeof listing[k] === "boolean"
                        ? listing[k]
                          ? "Yes"
                          : "No"
                        : String(listing[k]).replaceAll("_", " ")}
                      {["plotLength", "plotWidth", "roadWidthFt"].includes(k)
                        ? " ft"
                        : ""}
                    </dd>
                  </div>
                ))}
              </dl>
            </Block>
            {listing.description && (
              <Block title="About this property">
                <p className="leading-7 text-ink-soft">{listing.description}</p>
              </Block>
            )}
            <Block title="Location & neighbourhood">
              <div className="rounded-2xl bg-gradient-to-br from-moss/15 to-paper-dim p-6">
                <p className="font-semibold">
                  {listing.area}, {listing.city}
                </p>
                <p className="mt-2 text-sm text-ink-soft">
                  Exact location is shared after connecting with the seller.
                  Always verify the site and documents independently.
                </p>
              </div>
            </Block>
          </section>
          <aside className="h-fit rounded-3xl border border-ink/10 bg-white p-6 shadow-xl shadow-ink/8 lg:sticky lg:top-24">
            {isOwner ? <>
              <p className="text-xs font-bold uppercase tracking-widest text-moss">Your property</p>
              <h2 className="mt-2 font-display text-2xl">Manage this listing</h2>
              <div className="mt-5 rounded-2xl bg-paper-dim p-4"><p className="text-xs uppercase tracking-wide text-ink-soft">Current status</p><div className="mt-2"><StatusBadge status={listing.status} /></div>{listing.rejectionReason && <p className="mt-2 text-xs text-red-700">Reason for rejection: {listing.rejectionReason}</p>}</div>
              <Link href={`/listings/${listing.id}/edit`} className="mt-4 block rounded-xl bg-moss py-3 text-center text-sm font-bold text-white">Edit property details</Link>
              <Link href="/dashboard" className="mt-2 block rounded-xl border border-ink/15 py-3 text-center text-sm font-semibold">View enquiries & dashboard</Link>
              <p className="mt-4 text-center text-xs text-ink-soft">Update incomplete details to improve buyer response.</p>
            </> : <>
            <p className="text-xs font-bold uppercase tracking-widest text-moss">
              Interested in this property?
            </p>
            <h2 className="mt-2 font-display text-2xl">
              Talk to the{" "}
              {listing.owner?.role === "BROKER" ? "property expert" : "owner"}
            </h2>
            <div className="mt-5 rounded-2xl bg-paper-dim p-4">
              <p className="font-semibold">{listing.owner?.name}</p>
              <p className="text-sm text-ink-soft">
                {listing.owner?.brokerAgency ||
                  listing.owner?.role?.toLowerCase()}
              </p>
            </div>
            <div className="mt-4">
              <PropertyActions listing={{ id: listing.id, title: listing.title, area: listing.area, city: listing.city, phone }} />
            </div>
            <p className="mt-4 text-center text-[10px] leading-4 text-ink-soft">
              Never transfer money before visiting and independently verifying
              ownership documents.
            </p>
            </>}
          </aside>
        </div>
        {recommendedListings.length > 0 && (
          <section className="mt-12 border-t border-ink/10 pt-10">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="font-display text-3xl">Recommended Properties</h2>
                <p className="mt-1 text-sm text-ink-soft">
                  Explore more verified properties you may be interested in.
                </p>
              </div>
              <Link href="/properties" className="text-sm font-semibold text-moss-deep transition hover:text-moss">
                View All Properties →
              </Link>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {serializeForClient(recommendedListings).map((recommendedListing) => (
                <PropertyCard key={recommendedListing.id} listing={recommendedListing} />
              ))}
            </div>
          </section>
        )}
      </div>
      {isOwner ? <div className="fixed inset-x-0 bottom-[65px] z-40 border-t border-ink/10 bg-white p-3 md:hidden"><Link href={`/listings/${listing.id}/edit`} className="block rounded-xl bg-moss py-3 text-center text-sm font-bold text-white">Edit property</Link></div> : <div className="fixed inset-x-0 bottom-[65px] z-40 grid grid-cols-2 gap-2 border-t border-ink/10 bg-white p-3 md:hidden">
        <a
          href={`tel:${phone}`}
          className="rounded-xl border border-moss/25 py-3 text-center text-sm font-bold text-moss-deep"
        >
          Call now
        </a>
        <a
          href={`https://wa.me/91${String(phone || "")
            .replace(/\D/g, "")
            .slice(-10)}`}
          className="rounded-xl bg-moss py-3 text-center text-sm font-bold text-white"
        >
          WhatsApp
        </a>
      </div>}
    </main>
  );
}
function Block({ title, children }) {
  return (
    <section className="mt-9">
      <h2 className="mb-4 font-display text-2xl">{title}</h2>
      {children}
    </section>
  );
}

function StatusTimeline({ status, rejectionReason }) {
  const steps = status === "DRAFT"
    ? ["Draft"]
    : status === "REJECTED"
      ? ["Submitted", "Pending", "Under Review", "Rejected"]
      : status === "INACTIVE"
        ? ["Submitted", "Pending", "Under Review", "Approved", "Active", "Inactive"]
        : ["Submitted", "Pending", "Under Review", "Approved", "Active"];
  const statusIndex = { DRAFT: 0, PENDING: 1, UNDER_REVIEW: 2, APPROVED: 3, ACTIVE: 4, REJECTED: 3, INACTIVE: 5 }[status] ?? 0;
  return <section className="mt-8 rounded-2xl border border-ink/10 bg-white p-5"><div className="flex items-center justify-between gap-3"><h2 className="font-display text-2xl">Listing status</h2><StatusBadge status={status} /></div><div className="mt-5 flex flex-wrap items-center gap-2">{steps.map((step, index) => <div key={step} className="flex items-center gap-2"><span className={`rounded-full px-3 py-2 text-xs font-semibold ${index === statusIndex ? "bg-ink text-white" : index < statusIndex ? "bg-moss/10 text-moss-deep" : "bg-paper-dim text-ink-soft"}`}>{step}</span>{index < steps.length - 1 && <span className="text-ink-soft">↓</span>}</div>)}</div>{status === "REJECTED" && rejectionReason && <p className="mt-4 text-sm text-red-700">Reason for rejection: {rejectionReason}</p>}</section>;
}
