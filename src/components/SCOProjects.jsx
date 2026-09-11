import PropertySection from "@/components/PropertySection";

export default function SCOProjects({ listings = [], error = false }) {
  const visible = listings.filter(listing => ["SHOP","SHOWROOM","OFFICE"].includes(listing.propertyType)).slice(0, 4);
  return <PropertySection title="Retail & office spaces" eyebrow="Business addresses" description="Explore shops, showrooms and offices." listings={visible} error={error}/>;
}
