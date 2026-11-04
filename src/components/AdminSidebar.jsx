"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  BarChart3,
  Users,
  Building2,
  X,
  Menu,
  LogOut,
  FileBarChart,
  Settings,
  UserX,
  MessageSquare,
} from "lucide-react";

const links = [
  ["/admin/dashboard", "Dashboard", BarChart3],
  ["/admin/users", "Users", Users],
  ["/admin/deleted-users", "Deleted Accounts", UserX],
  ["/admin/properties", "Properties", Building2],
  ["/admin/inquiries", "Inquiries", MessageSquare],
  ["/admin/reports", "Reports", FileBarChart],
  ["/admin/settings", "Settings", Settings],
];

export default function AdminSidebar() {
  const [open, setOpen] = useState(false);
  const [counts, setCounts] = useState({});
  const router = useRouter();
  const pathname = usePathname();

  // Fetch live counts with seen timestamps from localStorage
  const refreshCounts = useCallback(() => {
    const seenUsersAt = typeof window !== "undefined" ? localStorage.getItem("bhoomi_admin_seen_users_at") : null;
    const seenInquiriesAt = typeof window !== "undefined" ? localStorage.getItem("bhoomi_admin_seen_inquiries_at") : null;

    const params = new URLSearchParams();
    if (seenUsersAt) params.set("seenUsersAt", seenUsersAt);
    if (seenInquiriesAt) params.set("seenInquiriesAt", seenInquiriesAt);

    fetch(`/api/admin/dashboard?${params.toString()}`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.stats) {
          setCounts(data.stats);
        }
      })
      .catch(() => {});
  }, []);

  // When admin navigates to /admin/users or /admin/inquiries, mark as seen
  useEffect(() => {
    if (!pathname) return;

    if (pathname.startsWith("/admin/users") && !pathname.startsWith("/admin/users/delete")) {
      const now = new Date().toISOString();
      localStorage.setItem("bhoomi_admin_seen_users_at", now);
      setCounts((prev) => ({ ...prev, newUsers: 0 }));
    }

    if (pathname.startsWith("/admin/inquiries")) {
      const now = new Date().toISOString();
      localStorage.setItem("bhoomi_admin_seen_inquiries_at", now);
      setCounts((prev) => ({ ...prev, newInquiries: 0 }));
    }
  }, [pathname]);

  // Initial fetch and 15s auto-polling for real-time live notification updates
  useEffect(() => {
    refreshCounts();
    const interval = setInterval(refreshCounts, 15000);
    return () => clearInterval(interval);
  }, [refreshCounts]);

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
              label === "Users"
                ? counts.newUsers
                : label === "Properties"
                ? counts.pendingListings
                : label === "Deleted Accounts"
                ? counts.deletedUsers
                : label === "Inquiries"
                ? counts.newInquiries
                : null;

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
                  <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-white px-1.5 text-[11px] font-bold text-[#c41920] shadow-sm">
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
