"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import BhoomiMark from "@/components/BhoomiMark";

function portalFor(user) {
  if (user.role === "SUPER_ADMIN") return { href: "/dashboard", label: "Admin portal" };
  if (user.role === "AREA_ADMIN") return { href: "/dashboard", label: "Review portal" };
  if (user.role === "OWNER" || user.role === "BROKER") return { href: "/dashboard", label: "My portal" };
  return { href: "/dashboard", label: "My account" };
}

export default function Navbar() {
  const [user, setUser] = useState(undefined);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let active = true;
    fetch("/api/auth/me")
      .then((response) => (response.ok ? response.json() : { user: null }))
      .then((data) => active && setUser(data.user))
      .catch(() => active && setUser(null));
    return () => { active = false; };
  }, [pathname]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
    router.refresh();
  }

  const portal = user ? portalFor(user) : null;
  return (
    <header className="sticky top-0 z-20 border-b border-paper/10 bg-ink shadow-lg shadow-ink/15">
      <nav className="mx-auto flex min-h-18 max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-3">
        <Link href="/" aria-label="Bhoomi home"><BhoomiMark light /></Link>
        <div className="flex items-center gap-1 sm:gap-3 font-data text-xs sm:text-sm">
          <Link href="/listings" className="rounded-full px-2 py-2 text-paper/85 transition hover:bg-paper/10 hover:text-gold">Browse</Link>
          {(user === undefined || user?.role === "OWNER" || user?.role === "BROKER") && <Link href="/listings/new" className="rounded-full px-2 py-2 text-paper/85 transition hover:bg-paper/10 hover:text-gold">Post property</Link>}
          {user ? <><Link href={portal.href} className="rounded-full bg-paper/10 px-3 py-2 text-paper transition hover:bg-paper/20">{portal.label}</Link><button onClick={logout} className="rounded-full px-2 py-2 text-paper/85 transition hover:bg-paper/10 hover:text-gold">Log out</button></> : user === null ? <Link href="/login" className="rounded-full bg-gold px-4 py-2 text-ink shadow-sm transition hover:brightness-110">Log in</Link> : null}
        </div>
      </nav>
    </header>
  );
}
