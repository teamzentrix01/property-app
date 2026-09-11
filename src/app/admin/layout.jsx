import { redirect } from "next/navigation";
import { headers } from "next/headers";
import AdminSidebar from "@/components/AdminSidebar";
import { requireAdmin } from "@/lib/serverAuth";

export default async function AdminLayout({ children }) {
  // proxy.js identifies the public admin-login route before this protected
  // layout executes. Every other /admin route requires the admin-only cookie.
  if ((await headers()).get("x-bhoomi-admin-login") === "1") return children;
  const auth = await requireAdmin();
  if (!auth.user) redirect("/admin/login");
  return <div className="min-h-screen bg-slate-50 lg:pl-64"><AdminSidebar /><header className="border-b border-green-100 bg-white px-6 py-5 lg:px-10"><p className="text-[10px] font-bold uppercase tracking-[.18em] text-green-700">Bhoomi workspace</p><h1 className="mt-1 font-display text-2xl text-green-950">Admin control centre</h1></header><main className="px-5 py-8 lg:px-10">{children}</main></div>;
}
