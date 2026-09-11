import PropertySection from "@/components/PropertySection";

export default function NewLaunchProjects({ listings = [], error = false }) {
  const visible = listings.slice(0, 4);
  return <PropertySection title="New on Bhoomi" eyebrow="Fresh opportunities" description="Discover the latest properties added to Bhoomi." listings={visible} error={error} badge="New"/>;
}
