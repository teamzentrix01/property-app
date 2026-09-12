"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  Users,
  Building2,
  X,
  Menu,
  LogOut,
  FileBarChart,
  Settings,
} from "lucide-react";

const links = [
  ["/admin/dashboard", "Dashboard", BarChart3],
  ["/admin/users", "Users", Users],
  ["/admin/properties", "Properties", Building2],
  ["/admin/reports", "Reports", FileBarChart],
  ["/admin/settings", "Settings", Settings],
];

export default function AdminSidebar() {
  const [open, setOpen] = useState(false);
  const [counts, setCounts] = useState({});
  const router = useRouter();

  useEffect(() => {
    fetch("/api/admin/dashboard", { credentials: "include" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => data && setCounts(data.stats))
      .catch(() => { });
  }, []);

  async function logout() {
    await fetch("/api/admin/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <>
      <button
        aria-label="Open admin menu"
        onClick={() => setOpen(true)}
        className="fixed left-4 top-24 z-40 rounded-lg bg-[#c41920] p-2 text-white shadow-lg shadow-[#c41920]/30 lg:hidden"
      >
        <Menu size={20} />
      </button>

      {open && (
        <button
          aria-label="Close admin menu"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-[#3d070b] bg-[#200406] p-5 text-white shadow-xl transition-transform lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-8 flex items-center justify-between border-b border-white/10 pb-6">
          <div>
            <p className="text-lg font-bold tracking-wide text-white">BHOOMI</p>
            <p className="text-[9px] tracking-[.2em] text-[#fecdd3]">
              ADMIN PANEL
            </p>
          </div>

          <button
            aria-label="Close admin menu"
            onClick={() => setOpen(false)}
            className="text-white lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="space-y-2">
          {links.map(([href, label, Icon]) => {
            const count =
              label === "Properties" ? counts.pendingListings : null;

            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-[#fff1f2] transition hover:bg-[#c41920] hover:text-white"
              >
                <Icon size={18} />
                <span className="flex-1">{label}</span>

                {count > 0 && (
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] text-red-700">
                    {count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={logout}
          className="mt-10 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-[#fecdd3] transition hover:bg-white/10 hover:text-white"
        >
          <LogOut size={18} />
          Logout
        </button>
      </aside>
    </>
  );
}
