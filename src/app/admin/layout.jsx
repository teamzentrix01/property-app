import { redirect } from "next/navigation";
import AdminSidebar from "@/components/AdminSidebar";
import { requireAdmin } from "@/lib/serverAuth";

export default async function AdminLayout({ children }) {
  const auth = await requireAdmin();
  if (!auth.user) redirect(`/login?next=/admin`);
  return <div className="min-h-screen bg-[#f7f7f3] lg:pl-64"><AdminSidebar /><header className="border-b border-amber-100 bg-white px-6 py-5 lg:px-10"><h1 className="font-display text-2xl text-amber-950">Admin control centre</h1></header><main className="px-5 py-8 lg:px-10">{children}</main></div>;
}
