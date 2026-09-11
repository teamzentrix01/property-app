"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
  Phone,
} from "lucide-react";

export default function Navbar() {
  const [user, setUser] = useState(undefined);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  function submitListingSearch(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const params = new URLSearchParams();
    const search = String(form.get("search") || "").trim();
    const selectedType = String(form.get("propertyType") || "");
    const propertyType = { Apartments: "FLAT", Villas: "HOUSE", Commercial: "COMMERCIAL" }[selectedType] || selectedType;
    const budget = String(form.get("budget") || "");
    if (search) params.set("search", search);
    if (propertyType) params.set("propertyType", propertyType);
    if (budget.startsWith("Below")) {
      params.set("maxPrice", "5000000");
    } else if (budget.startsWith("Above")) {
      params.set("minPrice", "50000000");
    } else if (budget.includes("50L -")) {
      params.set("minPrice", "5000000");
      params.set("maxPrice", "10000000");
    } else if (budget.includes("1 Cr -")) {
      params.set("minPrice", "10000000");
      params.set("maxPrice", "50000000");
    } else if (budget) {
      const [minPrice, maxPrice] = budget.split("-");
      if (minPrice) params.set("minPrice", minPrice);
      if (maxPrice) params.set("maxPrice", maxPrice);
    }
    setMobileMenu(false);
    router.push(`/listings${params.size ? `?${params.toString()}` : ""}`);
  }

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    let active = true;

    fetch("/api/auth/me", { credentials: "include", cache: "no-store" })
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
      credentials: "include",
    });

    window.dispatchEvent(new Event("bhoomi-auth-changed"));
    setUser(null);
    router.push("/");
    router.refresh();
  }

  return (
    <>
      {/* =====================================================
          STICKY NAVBAR - PREMIUM DESIGN
      ====================================================== */}

      <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white shadow-sm transition-all">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">

          {/* ================= HEADER BAR ================= */}
          <div className="flex h-18 items-center justify-between gap-3">

            {/* Logo */}
            <Link
              href="/"
              aria-label="Bhoomi home"
              className="shrink-0"
            >
              <BhoomiMark />
            </Link>

            {/* Category Tabs - Hidden on Mobile */}
            <div className="hidden items-center gap-4 xl:flex">

              {/* Cities */}
              <div className="group relative">
                <button
                  type="button"
                  className="nav-link flex items-center gap-1 text-xs font-semibold"
                >
                  Cities
                  <ChevronDown size={13} />
                </button>

                <div className="invisible absolute left-0 top-full z-50 mt-2 w-40 rounded-lg border border-gray-200 bg-white p-1.5 opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                  {[
                    ["Moradabad", "/listings?city=Moradabad"],
                    ["Bareilly", "/listings?city=Bareilly"],
                    ["Rampur", "/listings?city=Rampur"],
                  ].map(([city, href]) => (
                    <Link
                      key={city}
                      href={href}
                      className="block rounded-md px-3 py-2 text-xs font-semibold text-gray-900 hover:bg-gray-50 hover:text-red-600"
                    >
                      {city}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Categories */}
              {[
                ["Apartments", "/categories/apartment"],
                ["Branded", "/categories/branded"],
                ["Luxury", "/categories/luxury"],
                ["Commercial", "/categories/commercial"],
                ["Rental", "/categories/rental"],
                ["Villas", "/categories/villas"],
              ].map(([category, href]) => (
                <Link
                  href={href}
                  key={category}
                  aria-current={pathname === href ? "page" : undefined}
                  className="nav-link whitespace-nowrap text-xs font-semibold"
                >
                  {category}
                </Link>
              ))}
            </div>

            {/* =================================================
                DESKTOP RIGHT SECTION
            ================================================= */}
            <div className="ml-auto hidden items-center gap-2.5 xl:flex">
              {/* CONTACT NUMBER */}
              <a
                href="tel:+919999999999"
                className="flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs font-semibold text-gray-800 transition hover:text-green-700 hover:bg-green-50"
                aria-label="Call Bhoomi Real Estate"
              >
                <Phone size={15} className="text-red-600" />
                <span>+91 99999 99999</span>
              </a>

              {/* POST PROPERTY CTA */}
              <Link
                href="/post-property"
                className="flex items-center gap-1.5 whitespace-nowrap rounded-xl bg-green-700 px-3.5 py-2 text-xs font-bold text-white shadow-sm shadow-green-900/15 transition duration-200 hover:bg-green-800"
              >
                <Plus size={15} />
                <span>Post Property</span>
                <span className="rounded bg-green-900/80 px-1.5 py-0.5 text-[9px] font-extrabold text-green-100">
                  FREE
                </span>
              </Link>

              {/* LOGGED IN OR LOGIN */}
              {user ? (
                <>
                  <Link
                    href="/profile"
                    className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-800 transition hover:bg-green-50 hover:text-green-700 hover:border-green-300"
                  >
                    <User size={14} className="text-green-700" />
                    Profile
                  </Link>
                  <button
                    onClick={logout}
                    className="rounded-xl px-2.5 py-2 text-xs font-semibold text-gray-600 transition hover:text-red-600 hover:bg-red-50"
                  >
                    Logout
                  </button>
                </>
              ) : user === null ? (
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 rounded-xl border-1.5 border-red-600 px-3.5 py-2 text-xs font-bold text-red-600 transition duration-200 hover:bg-red-600 hover:text-white"
                >
                  <User size={14} />
                  Log in
                </Link>
              ) : null}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenu(!mobileMenu)}
              className="grid h-10 w-10 place-items-center rounded-xl border border-gray-200 bg-gray-50 text-gray-800 hover:bg-green-50 hover:text-green-700 xl:hidden"
              aria-label="Menu"
            >
              {mobileMenu ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* =================================================
              SEARCH BAR
          ================================================== */}
          <div className="hidden border-t border-gray-100 bg-white py-2.5 lg:block">

            <form
              key={`desktop-search-${searchParams.toString()}`}
              onSubmit={submitListingSearch}
              className="site-search grid gap-2 rounded-xl bg-white md:grid-cols-[1fr_1fr_1fr_auto]"
            >
              {/* Location */}
              <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-white px-3 py-2 transition focus-within:border-green-600 focus-within:ring-2 focus-within:ring-green-100">
                <MapPin
                  className="shrink-0 text-red-600"
                  size={18}
                />

                <input
                  name="search"
                  type="text"
                  defaultValue={searchParams.get("search") || ""}
                  placeholder="Search City, Locality or Project..."
                  className="w-full bg-transparent text-xs font-semibold text-gray-900 outline-none placeholder:text-gray-400"
                />
              </div>

              {/* Property Type */}
              <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-white px-3 py-2 transition focus-within:border-green-600 focus-within:ring-2 focus-within:ring-green-100">
                <span className="shrink-0 text-sm font-bold text-green-700">
                  🏢
                </span>

                <select
                  name="propertyType"
                  className="w-full bg-transparent text-xs font-semibold text-gray-900 outline-none"
                >
                  <option value="">All Types</option>
                  <option value="FLAT">Apartments</option>
                  <option value="HOUSE">Villas / Houses</option>
                  <option value="COMMERCIAL">Commercial</option>
                </select>

                <ChevronDown
                  size={12}
                  className="shrink-0 text-gray-700"
                />
              </div>

              {/* Budget */}
              <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-white px-3 py-2 transition focus-within:border-green-600 focus-within:ring-2 focus-within:ring-green-100">
                <span className="shrink-0 text-sm font-bold text-green-700">
                  ₹
                </span>

                <select
                  name="budget"
                  className="w-full bg-transparent text-xs font-semibold text-gray-900 outline-none"
                >
                  <option>Any Budget</option>
                  <option>Below ₹50 Lakh</option>
                  <option>₹50L - ₹1 Cr</option>
                  <option>₹1 Cr - ₹5 Cr</option>
                  <option>Above ₹5 Cr</option>
                </select>

                <ChevronDown
                  size={12}
                  className="shrink-0 text-gray-700"
                />
              </div>

              {/* Search Button */}
              <button
                type="submit"
                className="flex items-center justify-center gap-2 rounded-lg bg-green-700 px-6 py-2 text-xs font-semibold text-white shadow-sm shadow-green-950/15 transition hover:bg-green-900"
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
          <div className="max-h-[calc(100dvh-72px)] overflow-y-auto border-t border-gray-200 bg-white shadow-sm xl:hidden">

            <div className="space-y-3 px-4 py-4">

              {/* Mobile Search */}
              <form key={`mobile-search-${searchParams.toString()}`} onSubmit={submitListingSearch} className="site-search space-y-2 rounded-xl bg-white p-2">

                <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2">
                  <MapPin
                    className="shrink-0 text-green-700"
                    size={18}
                  />

                  <input
                    name="search"
                    defaultValue={searchParams.get("search") || ""}
                    placeholder="Search City, Locality..."
                    className="flex-1 bg-transparent text-xs font-semibold text-gray-900 outline-none"
                  />
                </div>

                <div className="flex gap-2">
                  <select name="propertyType" className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-900 outline-none">
                    <option>All Types</option>
                    <option>Apartments</option>
                    <option>Villas</option>
                    <option>Commercial</option>
                  </select>

                  <select name="budget" className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-900 outline-none">
                    <option>Any Budget</option>
                    <option>Below ₹50L</option>
                    <option>₹50L+</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-700 px-4 py-2 text-xs font-semibold text-white"
                >
                  <Search size={16} />
                  Search
                </button>
              </form>

              {/* Mobile Categories */}
              <div className="flex flex-wrap gap-2 pt-2">

                <details className="relative">
                  <summary className="cursor-pointer list-none rounded-lg bg-gray-100 px-3 py-1.5 text-[10px] font-semibold text-gray-900 hover:bg-gray-200">
                    Cities ▾
                  </summary>

                  <div className="absolute left-0 z-50 mt-1 w-36 rounded-lg border border-gray-200 bg-white p-1 shadow-lg">
                    {[
                      ["Moradabad", "/listings?city=Moradabad"],
                      ["Bareilly", "/listings?city=Bareilly"],
                      ["Rampur", "/listings?city=Rampur"],
                    ].map(([city, href]) => (
                      <Link
                        key={city}
                        href={href}
                        onClick={() => setMobileMenu(false)}
                        className="block rounded px-2 py-1.5 text-[10px] font-semibold text-gray-900 hover:bg-gray-50"
                      >
                        {city}
                      </Link>
                    ))}
                  </div>
                </details>

                {[
                  ["Apartments", "/categories/apartment"],
                  ["Branded", "/categories/branded"],
                  ["Luxury", "/categories/luxury"],
                  ["Commercial", "/categories/commercial"],
                  ["Rental", "/categories/rental"],
                  ["Villas", "/categories/villas"],
                ].map(([cat, href]) => (
                  <Link
                    href={href}
                    key={cat}
                    onClick={() => setMobileMenu(false)}
                    className="rounded-lg bg-gray-100 px-3 py-1.5 text-[10px] font-semibold text-gray-900 hover:bg-gray-200"
                  >
                    {cat}
                  </Link>
                ))}
              </div>

              {/* Mobile Links */}
              <div className="space-y-1.5 border-t border-gray-200 pt-3">

                <Link
                  href="/listings"
                  className="block px-4 py-2 text-xs font-semibold text-gray-900 hover:text-red-600"
                  onClick={() => setMobileMenu(false)}
                >
                  All Projects
                </Link>

                {/* Logged In Mobile */}
                {user ? (
                  <>
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-xs font-semibold text-white"
                      onClick={() => setMobileMenu(false)}
                    >
                      <User size={14} />
                      Profile
                    </Link>
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2 text-xs font-semibold text-white"
                    onClick={() => setMobileMenu(false)}
                  >
                    <User size={14} />
                    Log in
                  </Link>
                )}

                {user && (
                  <Link
                    href="/post-property"
                    className="flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2 text-xs font-semibold text-white"
                    onClick={() => setMobileMenu(false)}
                  >
                    <Plus size={14} />
                    Post Property FREE
                  </Link>
                )}

                <a
                  href="9999999999"
                  className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-xs font-semibold text-gray-900 transition hover:bg-gray-100"
                >
                  <Phone size={17} className="text-red-600" />
                  <span>+91 63970 36898</span>
                </a>

                {user && (
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-xs font-medium text-red-600"
                  >
                    Logout
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* =====================================================
          MOBILE BOTTOM NAV
      ====================================================== */}

      <nav className={`fixed inset-x-0 bottom-0 z-50 grid ${user ? "grid-cols-5" : "grid-cols-4"} border-t border-gray-200 bg-white px-2 pb-[max(.45rem,env(safe-area-inset-bottom))] pt-2 shadow-sm md:hidden`}>

        {/* Home */}
        <Link
          href="/"
          className={`flex min-h-12 flex-col items-center justify-center gap-1 text-[10px] ${pathname === "/"
            ? "font-bold text-green-700"
            : "text-gray-700 hover:text-green-700"
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
          className={`flex min-h-12 flex-col items-center justify-center gap-1 text-[10px] ${pathname.startsWith("/listings")
            ? "font-bold text-green-700"
            : "text-gray-700 hover:text-green-700"
            }`}
        >
          <Search size={20} />
          Search
        </Link>

        {/* Post */}
        {user && (
          <Link
            href="/post-property"
            className="relative flex min-h-12 flex-col items-center justify-end gap-1 text-[10px] text-gray-700 hover:text-green-700"
          >
            <span className="absolute -top-7 grid h-14 w-14 place-items-center rounded-full border-4 border-white bg-green-700 text-white shadow-lg shadow-green-900/30">
              <Plus size={27} />
            </span>

            <span>Post</span>
          </Link>
        )}

        {/* Saved */}
        <Link
          href="/dashboard#saved"
          className="flex min-h-12 flex-col items-center justify-center gap-1 text-[10px] text-gray-700 hover:text-red-600"
        >
          <Heart size={20} className="text-red-600" />
          Saved
        </Link>

        {/* Profile */}
        <Link
          href={user ? "/dashboard" : "/login"}
          className="flex min-h-12 flex-col items-center justify-center gap-1 text-[10px] text-gray-900"
        >
          <User size={20} />
          Profile
        </Link>
      </nav>
    </>
  );
}
