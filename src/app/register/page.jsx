import { redirect } from "next/navigation";

export default async function RegisterRedirect({ searchParams }) {
  const sp = await searchParams;
  const next = sp?.next || sp?.redirect;
  const target = next ? `/signup?next=${encodeURIComponent(next)}` : "/signup";
  redirect(target);
}

