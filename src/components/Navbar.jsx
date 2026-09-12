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
  Lock,
} from "lucide-react";

export default function Navbar() {
  const [user, setUser] = useState(undefined);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [lockedNotice, setLockedNotice] = useState(false);

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

  const isVerified = user && (user.verificationStatus === "ACTIVE" || ["AREA_ADMIN", "SUPER_ADMIN"].includes(user.role));

  return (
    <>
      {/* =====================================================
          STICKY NAVBAR - PREMIUM DESIGN
      ====================================================== */}

      <header className="sticky top-0 z-50 w-full border-b border-[#fecdd3] bg-gradient-to-b from-[#fff1f2] to-white shadow-sm transition-all">
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
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#c41920] to-[#8e1016] text-sm font-bold text-white shadow-sm shadow-[#c41920]/25">
                  ₹
                </div>

                <div>
                  <h1 className="text-lg font-bold tracking-tight text-[#8e1016]">
                    BHOOMI
                  </h1>

                  <p className="text-[9px] font-medium leading-none tracking-widest text-[#c41920]">
                    REAL ESTATE
                  </p>
                </div>
              </div>
            </Link>

            {/* Category Tabs - Hidden on Mobile */}
            <div className="hidden items-center gap-6 lg:flex">

              {/* Cities */}
              <div className="group relative">
                <button
                  type="button"
                  className="flex items-center gap-1 text-xs font-semibold text-[#180e0f] transition hover:text-[#c41920]"
                >
                  Cities
                  <ChevronDown size={13} />
                </button>

                <div className="invisible absolute left-0 top-full z-50 mt-2 w-40 rounded-lg border border-[#fecdd3] bg-white p-1.5 opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                  {[
                    ["Moradabad", "/listings?city=Moradabad"],
                    ["Bareilly", "/listings?city=Bareilly"],
                    ["Rampur", "/listings?city=Rampur"],
                  ].map(([city, href]) => (
                    <Link
                      key={city}
                      href={href}
                      className="block rounded-md px-3 py-2 text-xs font-semibold text-[#180e0f] hover:bg-[#fff1f2] hover:text-[#c41920]"
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
                  className="whitespace-nowrap text-xs font-semibold text-[#180e0f] transition hover:text-[#c41920]"
                >
                  {category}
                </Link>
              ))}
            </div>

            {/* =================================================
                DESKTOP RIGHT SECTION
            ================================================= */}
            <div className="ml-auto hidden items-center gap-3 lg:flex">
              {/* LOGGED IN */}
              {user ? (
                <>
                  <Link
                    href="/profile"
                    className="flex items-center gap-1.5 rounded-lg bg-[#8e1016] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#c41920]"
                  >
                    <User size={14} />
                    Profile
                  </Link>
                </>
              ) : user === null ? (
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 rounded-lg bg-[#c41920] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#8e1016]"
                >
                  <User size={14} />
                  Log in
                </Link>
              ) : null}

              {/* POST PROPERTY */}
              {user && (
                isVerified ? (
                  <Link
                    href="/post-property"
                    className="flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-gradient-to-r from-[#c41920] to-[#d9252c] px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-[#c41920]/20 transition hover:from-[#8e1016] hover:to-[#c41920]"
                  >
                    <Plus size={14} />
                    Post Property
                    <span className="ml-1 rounded bg-[#8e1016] px-1.5 py-0.5 text-[8px]">
                      FREE
                    </span>
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => setLockedNotice(true)}
                    className="flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-amber-50 border border-amber-300 px-3.5 py-2 text-xs font-semibold text-amber-900 shadow-sm transition hover:bg-amber-100"
                    title="Account not verified by admin"
                  >
                    <Lock size={13} className="text-amber-700" />
                    Post Property
                    <span className="ml-1 rounded bg-amber-200/90 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-amber-900">
                      LOCKED
                    </span>
                  </button>
                )
              )}

              {/* CONTACT NUMBER */}
              <a
                href="9999999999"
                className="flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 text-xs font-medium text-[#180e0f] transition hover:text-[#c41920]"
                aria-label="Call Bhoomi Real Estate"
              >
                <Phone size={16} className="text-[#c41920]" />
                <span>+91 9999999999</span>
              </a>

              {user && (
                <button
                  onClick={logout}
                  className="px-2.5 text-xs font-medium text-[#180e0f] hover:text-[#c41920]"
                >
                  Logout
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenu(!mobileMenu)}
              className="grid h-10 w-10 place-items-center rounded-lg bg-[#fff1f2] text-[#c41920] lg:hidden"
              aria-label="Menu"
            >
              {mobileMenu ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

          {/* =================================================
              SEARCH BAR
          ================================================== */}
          <div className="hidden border-t border-[#fecdd3] bg-[#fff1f2]/70 py-4 lg:block">

            <form
              key={`desktop-search-${searchParams.toString()}`}
              onSubmit={submitListingSearch}
              className="site-search grid gap-2 rounded-xl bg-[#8e1016] p-2 shadow-sm shadow-[#200406]/20 md:grid-cols-[1fr_1fr_1fr_auto]"
            >
              {/* Location */}
              <div className="flex items-center gap-2 rounded-lg border border-[#fecdd3] bg-white px-3 py-2 transition focus-within:border-[#c41920] focus-within:ring-2 focus-within:ring-[#fff1f2]">
                <MapPin
                  className="shrink-0 text-[#c41920]"
                  size={18}
                />

                <input
                  name="search"
                  type="text"
                  defaultValue={searchParams.get("search") || ""}
                  placeholder="Search City, Locality or Project..."
                  className="w-full bg-transparent text-xs font-semibold text-[#180e0f] outline-none placeholder:text-gray-400"
                />
              </div>

              {/* Property Type */}
              <div className="flex items-center gap-2 rounded-lg border border-[#fecdd3] bg-white px-3 py-2 transition focus-within:border-[#c41920] focus-within:ring-2 focus-within:ring-[#fff1f2]">
                <span className="shrink-0 text-sm font-bold text-[#c41920]">
                  🏢
                </span>

                <select
                  name="propertyType"
                  className="w-full bg-transparent text-xs font-semibold text-[#180e0f] outline-none"
                >
                  <option value="">All Types</option>
                  <option value="FLAT">Apartments</option>
                  <option value="HOUSE">Villas / Houses</option>
                  <option value="COMMERCIAL">Commercial</option>
                </select>

                <ChevronDown
                  size={12}
                  className="shrink-0 text-[#c41920]"
                />
              </div>

              {/* Budget */}
              <div className="flex items-center gap-2 rounded-lg border border-[#fecdd3] bg-white px-3 py-2 transition focus-within:border-[#c41920] focus-within:ring-2 focus-within:ring-[#fff1f2]">
                <span className="shrink-0 text-sm font-bold text-[#c41920]">
                  ₹
                </span>

                <select
                  name="budget"
                  className="w-full bg-transparent text-xs font-semibold text-[#180e0f] outline-none"
                >
                  <option>Any Budget</option>
                  <option>Below ₹50 Lakh</option>
                  <option>₹50L - ₹1 Cr</option>
                  <option>₹1 Cr - ₹5 Cr</option>
                  <option>Above ₹5 Cr</option>
                </select>

                <ChevronDown
                  size={12}
                  className="shrink-0 text-[#c41920]"
                />
              </div>

              {/* Search Button */}
              <button
                type="submit"
                className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#c41920] to-[#d9252c] px-6 py-2 text-xs font-semibold text-white shadow-sm shadow-[#200406]/15 transition hover:from-[#8e1016] hover:to-[#c41920]"
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
          <div className="border-t border-[#fecdd3] bg-white shadow-xl lg:hidden">

            <div className="space-y-3 px-4 py-4">

              {/* Mobile Search */}
              <form key={`mobile-search-${searchParams.toString()}`} onSubmit={submitListingSearch} className="site-search space-y-2 rounded-xl bg-[#8e1016] p-2 shadow-sm shadow-[#200406]/20">

                <div className="flex items-center gap-2 rounded-lg border border-[#fecdd3] bg-white px-3 py-2">
                  <MapPin
                    className="shrink-0 text-[#c41920]"
                    size={18}
                  />

                  <input
                    name="search"
                    defaultValue={searchParams.get("search") || ""}
                    placeholder="Search City, Locality..."
                    className="flex-1 bg-transparent text-xs font-semibold text-[#180e0f] outline-none"
                  />
                </div>

                <div className="flex gap-2">
                  <select name="propertyType" className="flex-1 rounded-lg border border-[#fecdd3] bg-white px-3 py-2 text-xs font-semibold text-[#180e0f] outline-none">
                    <option>All Types</option>
                    <option>Apartments</option>
                    <option>Villas</option>
                    <option>Commercial</option>
                  </select>

                  <select name="budget" className="flex-1 rounded-lg border border-[#fecdd3] bg-white px-3 py-2 text-xs font-semibold text-[#180e0f] outline-none">
                    <option>Any Budget</option>
                    <option>Below ₹50L</option>
                    <option>₹50L+</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#c41920] to-[#d9252c] px-4 py-2 text-xs font-semibold text-white"
                >
                  <Search size={16} />
                  Search
                </button>
              </form>

              {/* Mobile Categories */}
              <div className="flex flex-wrap gap-2 pt-2">

                <details className="relative">
                  <summary className="cursor-pointer list-none rounded-lg bg-[#fff1f2] px-3 py-1.5 text-[10px] font-semibold text-[#c41920] hover:bg-[#ffe4e6]">
                    Cities ▾
                  </summary>

                  <div className="absolute left-0 z-50 mt-1 w-36 rounded-lg border border-[#fecdd3] bg-white p-1 shadow-lg">
                    {[
                      ["Moradabad", "/listings?city=Moradabad"],
                      ["Bareilly", "/listings?city=Bareilly"],
                      ["Rampur", "/listings?city=Rampur"],
                    ].map(([city, href]) => (
                      <Link
                        key={city}
                        href={href}
                        onClick={() => setMobileMenu(false)}
                        className="block rounded px-2 py-1.5 text-[10px] font-semibold text-[#180e0f] hover:bg-[#fff1f2]"
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
                    className="rounded-lg bg-[#fff1f2] px-3 py-1.5 text-[10px] font-semibold text-[#c41920] hover:bg-[#ffe4e6]"
                  >
                    {cat}
                  </Link>
                ))}
              </div>

              {/* Mobile Links */}
              <div className="space-y-1.5 border-t border-[#fecdd3] pt-3">

                <Link
                  href="/listings"
                  className="block px-4 py-2 text-xs font-semibold text-[#180e0f] hover:text-[#c41920]"
                  onClick={() => setMobileMenu(false)}
                >
                  All Projects
                </Link>

                {/* Logged In Mobile */}
                {user ? (
                  <>
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 rounded-lg bg-[#8e1016] px-4 py-2 text-xs font-semibold text-white"
                      onClick={() => setMobileMenu(false)}
                    >
                      <User size={14} />
                      Profile
                    </Link>
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="flex items-center gap-2 rounded-lg bg-[#c41920] px-4 py-2 text-xs font-semibold text-white"
                    onClick={() => setMobileMenu(false)}
                  >
                    <User size={14} />
                    Log in
                  </Link>
                )}

                {user && (
                  isVerified ? (
                    <Link
                      href="/post-property"
                      className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#c41920] to-[#d9252c] px-4 py-2 text-xs font-semibold text-white"
                      onClick={() => setMobileMenu(false)}
                    >
                      <Plus size={14} />
                      Post Property FREE
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenu(false);
                        setLockedNotice(true);
                      }}
                      className="flex items-center justify-between rounded-lg bg-amber-50 border border-amber-300 px-4 py-2 text-xs font-semibold text-amber-900"
                    >
                      <span className="flex items-center gap-2">
                        <Lock size={14} className="text-amber-700" />
                        Post Property
                      </span>
                      <span className="rounded bg-amber-200/90 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wide text-amber-900">
                        LOCKED
                      </span>
                    </button>
                  )
                )}

                <a
                  href="9999999999"
                  className="flex items-center gap-2 rounded-lg border border-[#fecdd3] bg-[#fff1f2] px-4 py-2.5 text-xs font-semibold text-[#180e0f] transition hover:bg-[#ffe4e6]"
                >
                  <Phone size={17} className="text-[#c41920]" />
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

      <nav className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-5 border-t border-amber-200 bg-white/95 px-2 pb-[max(.45rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_30px_rgba(0,0,0,.08)] backdrop-blur-xl lg:hidden">

        {/* Home */}
        <Link
          href="/"
          className={`flex min-h-12 flex-col items-center justify-center gap-1 text-[10px] ${pathname === "/"
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
        {user && (
          isVerified ? (
            <Link
              href="/post-property"
              className="relative flex min-h-12 flex-col items-center justify-end gap-1 text-[10px] text-amber-900"
            >
              <span className="absolute -top-7 grid h-14 w-14 place-items-center rounded-full border-4 border-white bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg">
                <Plus size={27} />
              </span>

              <span>Post</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => setLockedNotice(true)}
              className="relative flex min-h-12 flex-col items-center justify-end gap-1 text-[10px] text-amber-900"
            >
              <span className="absolute -top-7 grid h-14 w-14 place-items-center rounded-full border-4 border-white bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg">
                <Lock size={24} />
              </span>

              <span>Post (Locked)</span>
            </button>
          )
        )}

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

      {/* Account Verification Required Modal */}
      {lockedNotice && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          onClick={() => setLockedNotice(false)}
        >
          <div
            className="relative flex flex-col w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-7 text-center border border-gray-100 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setLockedNotice(false)}
              className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/80 mb-4">
              <Lock size={30} />
            </div>

            <h3 className="font-display text-xl font-extrabold text-gray-950">
              Account Not Verified
            </h3>

            <div className="mt-3 rounded-xl bg-amber-50 border border-amber-200 p-3.5 text-xs font-semibold text-amber-900 leading-relaxed">
              Your account is not verified by the admin so you cannot post any property.
            </div>

            <p className="mt-3 text-xs text-gray-500 leading-relaxed">
              Please make sure your verification documents (Aadhaar, PAN, Address Proof) are submitted. Once reviewed and approved by the admin, property posting will be unlocked.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
              <Link
                href="/dashboard"
                onClick={() => setLockedNotice(false)}
                className="flex-1 rounded-xl bg-green-700 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-green-800 flex items-center justify-center"
              >
                Go to Dashboard
              </Link>
              <button
                type="button"
                onClick={() => setLockedNotice(false)}
                className="rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-100 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
