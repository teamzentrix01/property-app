"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import BhoomiMark from "@/components/BhoomiMark";

const Icon = ({ name, className = "h-5 w-5" }) => {
  const paths = {
    home: (
      <>
        <path d="m3 11 9-8 9 8" />
        <path d="M5 10v10h14V10M9 20v-6h6v6" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),
    plus: (
      <>
        <path d="M12 5v14M5 12h14" />
      </>
    ),
    heart: (
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z" />
    ),
    user: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
      </>
    ),
  };
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
};
export default function Navbar() {
  const [user, setUser] = useState(undefined);
  const pathname = usePathname();
  const router = useRouter();
  useEffect(() => {
    let active = true;
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : { user: null }))
      .then((d) => active && setUser(d.user))
      .catch(() => active && setUser(null));
    return () => {
      active = false;
    };
  }, [pathname]);
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
    router.refresh();
  }
  const nav = [
    { href: "/listings?purpose=SALE", label: "Buy" },
    { href: "/listings?purpose=RENT", label: "Rent" },
    { href: "/listings?propertyType=PLOT", label: "Plots" },
    { href: "/listings?propertyType=OFFICE", label: "Commercial" },
  ];
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-ink/8 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6">
          <Link href="/" aria-label="Bhoomi home">
            <BhoomiMark />
          </Link>
          <nav className="hidden items-center gap-1 lg:flex">
            {nav.map((i) => (
              <Link
                key={i.label}
                href={i.href}
                className="rounded-full px-4 py-2 text-sm font-medium text-ink-soft transition hover:bg-paper-dim/70 hover:text-ink"
              >
                {i.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto hidden items-center gap-2 md:flex">
            <Link
              href="/listings/new"
              className="rounded-full border border-moss/25 px-4 py-2 text-sm font-semibold text-moss-deep hover:bg-moss/5"
            >
              Post property <span className="text-[10px] text-gold">FREE</span>
            </Link>
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white"
                >
                  Dashboard
                </Link>
                <button onClick={logout} className="px-2 text-sm text-ink-soft">
                  Log out
                </button>
              </>
            ) : user === null ? (
              <Link
                href="/login"
                className="rounded-full bg-moss px-5 py-2 text-sm font-semibold text-white"
              >
                Log in
              </Link>
            ) : null}
          </div>
          <Link
            href="/listings"
            className="ml-auto grid h-10 w-10 place-items-center rounded-full bg-paper-dim text-ink md:hidden"
            aria-label="Search"
          >
            <Icon name="search" />
          </Link>
        </div>
      </header>
      <nav className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-5 border-t border-ink/10 bg-white/97 px-2 pb-[max(.45rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_30px_rgba(22,48,43,.08)] backdrop-blur-xl md:hidden">
        {[
          { href: "/", label: "Home", icon: "home" },
          { href: "/listings", label: "Search", icon: "search" },
          { href: "/listings/new", label: "Post", icon: "plus", post: true },
          { href: "/dashboard#saved", label: "Saved", icon: "heart" },
          {
            href: user ? "/dashboard" : "/login",
            label: "Profile",
            icon: "user",
          },
        ].map((i) => (
          <Link
            key={i.label}
            href={i.href}
            className={`relative flex min-h-12 flex-col items-center justify-end gap-1 text-[10px] font-medium ${pathname === i.href ? "text-moss-deep" : "text-ink-soft"}`}
          >
            {i.post ? (
              <span className="absolute -top-7 grid h-14 w-14 place-items-center rounded-full border-4 border-white bg-moss text-white shadow-lg shadow-moss/25">
                <Icon name="plus" className="h-7 w-7" />
              </span>
            ) : (
              <Icon name={i.icon} />
            )}
            <span>{i.label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
