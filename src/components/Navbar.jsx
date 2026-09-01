"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import BhoomiMark from "@/components/BhoomiMark";

import {
  Search,
  MapPin,
  ChevronDown,
  Menu,
  X,
  User,
  Heart,
  Plus,
  Globe,
  Phone,
} from "lucide-react";

export default function Navbar() {
  const [user, setUser] = useState(undefined);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    let active = true;

    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : { user: null }))
      .then((d) => {
        if (active) setUser(d.user);
      })
      .catch(() => {
        if (active) setUser(null);
      });

    return () => {
      active = false;
    };
  }, [pathname]);

  async function logout() {
    await fetch("/api/auth/logout", {
      method: "POST",
    });

    setUser(null);
    router.push("/");
    router.refresh();
  }

  return (
    <>
      {/* =====================================================
          STICKY NAVBAR - PREMIUM DESIGN
      ====================================================== */}

      <header className="sticky top-0 z-50 w-full border-b border-amber-200 bg-gradient-to-b from-amber-50 to-white shadow-sm transition-all">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">

          {/* ================= HEADER BAR ================= */}
          <div className="flex h-20 items-center justify-between gap-5">

            {/* Logo */}
            <Link
              href="/"
              aria-label="Bhoomi home"
              className="shrink-0"
            >
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center text-white font-bold text-sm">
                  ₹
                </div>
                <div>
                  <h1 className="text-lg font-bold tracking-tight text-amber-900">
                    BHOOMI
                  </h1>
                  <p className="text-[9px] font-medium text-amber-700 tracking-widest leading-none">
                    REAL ESTATE
                  </p>
                </div>
              </div>
            </Link>

            {/* Category Tabs - Hidden on Mobile */}
            <div className="hidden lg:flex items-center gap-6">
              {["Cities", "Apartments", "Branded", "Luxury", "Commercial", "Rental", "Villas"].map((category) => (
                <button
                  key={category}
                  className="text-xs font-semibold text-amber-900 hover:text-red-600 transition whitespace-nowrap"
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Desktop Right Section */}
            <div className="hidden lg:flex items-center gap-3 ml-auto">
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-900 hover:text-amber-700 transition">
                <Globe size={16} />
                <span>EN</span>
                <ChevronDown size={12} />
              </button>

              <Link
                href="/listings/new"
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-semibold rounded-lg hover:from-red-600 hover:to-red-700 transition whitespace-nowrap"
              >
                <Plus size={14} />
                Post Property
                <span className="ml-1 bg-red-700 px-1.5 py-0.5 rounded text-[8px]">FREE</span>
              </Link>

              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-1.5 px-3 py-2 bg-amber-900 text-white text-xs font-semibold rounded-lg hover:bg-amber-800 transition"
                  >
                    <User size={14} />
                    Dashboard
                  </Link>
                  <button
                    onClick={logout}
                    className="px-2.5 text-xs font-medium text-amber-900 hover:text-red-600"
                  >
                    Logout
                  </button>
                </>
              ) : user === null ? (
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 px-3 py-2 bg-green-700 text-white text-xs font-semibold rounded-lg hover:bg-green-800 transition"
                >
                  <User size={14} />
                  Log in
                </Link>
              ) : null}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenu(!mobileMenu)}
              className="grid h-10 w-10 place-items-center rounded-lg bg-amber-100 text-amber-900 lg:hidden"
              aria-label="Menu"
            >
              {mobileMenu ? <X size={22} /> : <Menu size={22} />}
            </button>

          </div>

          {/* ================= SEARCH BAR - SHOWS WHEN NOT SCROLLED ================= */}
         <div className="py-4 hidden lg:block border-t border-amber-200">
  {/* Search Form */}
  <form
    action="/listings"
    className="grid gap-2 md:grid-cols-[1fr_1fr_1fr_auto]"
  >
    {/* Location */}
    <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-white px-3 py-2 focus-within:border-red-500 transition">
      <MapPin className="text-red-600 shrink-0" size={18} />

      <input
        name="location"
        type="text"
        placeholder="Search City, Locality or Project..."
        className="text-xs font-semibold text-amber-900 bg-transparent outline-none placeholder:text-gray-400 w-full"
      />
    </div>

    {/* Property Type */}
    <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-white px-3 py-2 focus-within:border-red-500 transition">
      <span className="text-sm font-bold text-red-600 shrink-0">🏢</span>

      <select
        name="propertyType"
        className="text-xs font-semibold text-amber-900 bg-transparent outline-none w-full"
      >
        <option>All Types</option>
        <option>Apartments</option>
        <option>Villas</option>
        <option>Commercial</option>
      </select>

      <ChevronDown size={12} className="text-amber-700 shrink-0" />
    </div>

    {/* Budget */}
    <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-white px-3 py-2 focus-within:border-red-500 transition">
      <span className="text-sm font-bold text-red-600 shrink-0">₹</span>

      <select
        name="budget"
        className="text-xs font-semibold text-amber-900 bg-transparent outline-none w-full"
      >
        <option>Any Budget</option>
        <option>Below ₹50 Lakh</option>
        <option>₹50L - ₹1 Cr</option>
        <option>₹1 Cr - ₹5 Cr</option>
        <option>Above ₹5 Cr</option>
      </select>

      <ChevronDown size={12} className="text-amber-700 shrink-0" />
    </div>

    {/* Search Button */}
    <button
      type="submit"
      className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 px-6 py-2 font-semibold text-white text-xs hover:from-red-600 hover:to-red-700 transition"
    >
      <Search size={16} />
      Search
    </button>
  </form>
</div>

        </div>

        {/* =====================================================
            MOBILE MENU
        ====================================================== */}

        {mobileMenu && (
          <div className="border-t border-amber-200 bg-white shadow-xl lg:hidden">

            <div className="px-4 py-4 space-y-3">

              {/* Mobile Search */}
              <form action="/listings" className="space-y-2">
                <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-white px-3 py-2">
                  <MapPin className="text-red-600 shrink-0" size={18} />
                  <input
                    name="location"
                    placeholder="Search City, Locality..."
                    className="flex-1 bg-transparent text-xs font-semibold text-amber-900 outline-none"
                  />
                </div>

                <div className="flex gap-2">
                  <select className="flex-1 rounded-lg border border-amber-200 bg-white px-3 py-2 text-xs font-semibold text-amber-900 outline-none">
                    <option>All Types</option>
                    <option>Apartments</option>
                    <option>Villas</option>
                  </select>
                  <select className="flex-1 rounded-lg border border-amber-200 bg-white px-3 py-2 text-xs font-semibold text-amber-900 outline-none">
                    <option>Any Budget</option>
                    <option>Below ₹50L</option>
                    <option>₹50L+</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 px-4 py-2 font-semibold text-white text-xs"
                >
                  <Search size={16} />
                  Search
                </button>
              </form>

              {/* Mobile Categories */}
              <div className="flex flex-wrap gap-2 pt-2">
                {["Apartments", "Branded", "Luxury", "Commercial", "Villas"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setMobileMenu(false)}
                    className="px-3 py-1.5 text-[10px] font-semibold text-amber-900 bg-amber-100 rounded-lg hover:bg-amber-200"
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Mobile Links */}
              <div className="space-y-1.5 pt-3 border-t border-amber-200">
                <Link
                  href="/listings"
                  className="block px-4 py-2 text-xs font-semibold text-amber-900 hover:text-red-600"
                  onClick={() => setMobileMenu(false)}
                >
                  All Projects
                </Link>

                <Link
                  href="/listings/new"
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-semibold rounded-lg"
                  onClick={() => setMobileMenu(false)}
                >
                  <Plus size={14} />
                  Post Property FREE
                </Link>

                {user ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2 px-4 py-2 bg-amber-900 text-white text-xs font-semibold rounded-lg"
                      onClick={() => setMobileMenu(false)}
                    >
                      <User size={14} />
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setMobileMenu(false);
                      }}
                      className="w-full px-4 py-2 text-xs font-medium text-red-600"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="flex items-center gap-2 px-4 py-2 bg-green-700 text-white text-xs font-semibold rounded-lg"
                    onClick={() => setMobileMenu(false)}
                  >
                    <User size={14} />
                    Log in
                  </Link>
                )}
              </div>

            </div>

          </div>
        )}

      </header>

      {/* =====================================================
          MOBILE BOTTOM NAV
      ====================================================== */}

      <nav className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-5 border-t border-amber-200 bg-white/95 px-2 pb-[max(.45rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_30px_rgba(0,0,0,.08)] backdrop-blur-xl lg:hidden">

        {/* Home */}
        <Link
          href="/"
          className={`flex min-h-12 flex-col items-center justify-center gap-1 text-[10px] ${
            pathname === "/"
              ? "font-bold text-red-600"
              : "text-amber-900"
          }`}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-5 w-5"
          >
            <path d="m3 11 9-8 9 8" />
            <path d="M5 10v10h14V10M9 20v-6h6v6" />
          </svg>
          Home
        </Link>

        {/* Search */}
        <Link
          href="/listings"
          className="flex min-h-12 flex-col items-center justify-center gap-1 text-[10px] text-amber-900"
        >
          <Search size={20} />
          Search
        </Link>

        {/* Post */}
        <Link
          href="/listings/new"
          className="relative flex min-h-12 flex-col items-center justify-end gap-1 text-[10px] text-amber-900"
        >
          <span className="absolute -top-7 grid h-14 w-14 place-items-center rounded-full border-4 border-white bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg">
            <Plus size={27} />
          </span>
          <span>Post</span>
        </Link>

        {/* Saved */}
        <Link
          href="/dashboard#saved"
          className="flex min-h-12 flex-col items-center justify-center gap-1 text-[10px] text-amber-900"
        >
          <Heart size={20} />
          Saved
        </Link>

        {/* Profile */}
        <Link
          href={user ? "/dashboard" : "/login"}
          className="flex min-h-12 flex-col items-center justify-center gap-1 text-[10px] text-amber-900"
        >
          <User size={20} />
          Profile
        </Link>

      </nav>
    </>
  );
}