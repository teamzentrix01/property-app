"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BarChart3, Users, UserCheck, FileCheck2, Building2, X, Menu, LogOut } from "lucide-react";

const links = [["/admin", "Dashboard", BarChart3], ["/admin/users/pending", "Pending Users", Users], ["/admin/users/active", "Active Users", UserCheck], ["/admin/documents", "Documents", FileCheck2], ["/admin/properties", "Properties", Building2]];

export default function AdminSidebar() {
  const [open, setOpen] = useState(false);
  const [counts, setCounts] = useState({});
  const router = useRouter();
  useEffect(() => { fetch("/api/admin/dashboard").then((response) => response.ok ? response.json() : null).then((data) => data && setCounts(data.stats)).catch(() => {}); }, []);
  async function logout() { await fetch("/api/auth/logout", { method: "POST" }); router.push("/login"); router.refresh(); }
  return <>
    <button aria-label="Open admin menu" onClick={() => setOpen(true)} className="fixed left-4 top-24 z-40 rounded-lg bg-amber-700 p-2 text-white lg:hidden"><Menu size={20} /></button>
    {open && <button aria-label="Close admin menu" onClick={() => setOpen(false)} className="fixed inset-0 z-40 bg-black/30 lg:hidden" />}
    <aside className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-amber-100 bg-white p-5 shadow-xl transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
      <div className="mb-8 flex items-center justify-between"><div><p className="text-lg font-bold text-amber-900">BHOOMI</p><p className="text-[9px] tracking-[.2em] text-amber-700">ADMIN PANEL</p></div><button aria-label="Close admin menu" onClick={() => setOpen(false)} className="lg:hidden"><X size={20} /></button></div>
      <nav className="space-y-2">{links.map(([href, label, Icon]) => { const count = label === "Pending Users" ? counts.pendingUsers : label === "Documents" ? counts.pendingDocuments : label === "Properties" ? counts.pendingListings : null; return <Link key={href} href={href} onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-amber-50 hover:text-amber-800"><Icon size={18} /><span className="flex-1">{label}</span>{count > 0 && <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] text-red-700">{count}</span>}</Link>; })}</nav>
      <button onClick={logout} className="mt-10 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-red-700 hover:bg-red-50"><LogOut size={18} />Logout</button>
    </aside>
  </>;
}
