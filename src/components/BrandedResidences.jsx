import PropertySection from "@/components/PropertySection";

export default function BrandedResidences({ listings = [], error = false }) {
  const visible = listings.slice(0, 4);
  return <PropertySection title="Branded residences" eyebrow="Distinctive addresses" description="Explore residences with a character of their own." listings={visible} error={error} badge="Featured"/>;
}
