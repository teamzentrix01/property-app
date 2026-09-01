import { prisma } from "@/lib/prisma";
import PropertyCard from "@/components/PropertyCard";
import { notFound } from "next/navigation";
import { serializeForClient } from "@/lib/formatters";

// Public page a broker shares — shows only the properties they picked
export default async function CatalogPage({ params }) {
  const { slug } = await params;
  let link;
  try {
    link = await prisma.catalogLink.findUnique({
      where: { slug },
      include: {
        broker: { select: { name: true, phone: true, brokerAgency: true } },
        listings: { where: { listing: { status: "APPROVED" } }, include: { listing: { include: { photos: true } } } },
      },
    });
  } catch {
    link = null;
  }
  if (!link) return notFound();

  return (
    <main className="flex-1 max-w-6xl mx-auto px-6 py-12 w-full">
      <p className="font-data text-xs uppercase tracking-wide text-gold mb-2">Curated by {link.broker.name}</p>
      <h1 className="font-display text-3xl mb-8">{link.title || "Selected properties"}</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {link.listings.map(({ listing }) => (
          <PropertyCard key={listing.id} listing={serializeForClient(listing)} />
        ))}
      </div>
      <a href={`tel:${link.broker.phone}`} className="inline-block mt-10 bg-gold text-ink px-6 py-3 rounded-full font-medium">
        Call {link.broker.name} — {link.broker.phone}
      </a>
    </main>
  );
}
