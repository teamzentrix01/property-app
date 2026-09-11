import PropertySection from "@/components/PropertySection";

export default function CommercialProjects({ listings = [], error = false }) {
  const visible = listings.filter(listing => ["SHOP","SHOWROOM","GODOWN","OFFICE"].includes(listing.propertyType)).slice(0, 4);
  return <PropertySection title="Spaces for your ambition" eyebrow="Commercial properties" description="Find a space for your next business move." listings={visible} error={error}/>;
}
