import PropertySection from "@/components/PropertySection";

export default function TopLuxuryProjects({ listings = [], error = false }) {
  const visible = listings.slice(0, 4);
  return <PropertySection title="Exceptional homes" eyebrow="The premium collection" description="Discover spacious homes and considered living." listings={visible} error={error} badge="Premium"/>;
}
