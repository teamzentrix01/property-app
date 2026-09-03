import { notFound } from "next/navigation";
import CategoryLanding from "@/components/CategoryLanding";
import { categoryFromSlug } from "@/lib/contentCategories";

export const dynamic = "force-dynamic";

export default async function CategoryPage({ params }) {
  const { category } = await params;
  if (!categoryFromSlug(category) || category === "cities") notFound();
  return <CategoryLanding slug={category} />;
}
