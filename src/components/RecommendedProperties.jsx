import PropertySection from "@/components/PropertySection";

export default function RecommendedProperties({ listings = [], error = false }) {
  const visible = listings.slice(0, 4);
  return <PropertySection title="Recommended properties" eyebrow="Selected for you" description="Explore homes, plots and spaces for your next chapter." listings={visible} error={error}/>;
}
