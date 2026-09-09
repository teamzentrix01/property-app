import { redirect } from "next/navigation";

export default async function PropertyDetailPage({ params }) {
  const { id } = await params;
  redirect(`/listings/${id}`);
}
