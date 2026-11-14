"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { User, LogIn, PlusCircle, ArrowRight, Sparkles, Building, CheckCircle2 } from "lucide-react";

export default function UserActivitySidebar() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include", cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) {
          setUser(data.user);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <aside className="w-full flex flex-col gap-4">
      {/* 1. User Profile / Login Box (99acres style) */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-[#c41920]">
            <User className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-display text-base font-bold text-gray-900">
              {loading ? (
                "Loading..."
              ) : user ? (
                user.name || "My Account"
              ) : (
                "Guest User"
              )}
            </h3>
            <p className="text-xs text-gray-500">
              {user ? (
                <span className="inline-flex items-center gap-1 font-semibold text-green-700">
                  <CheckCircle2 className="h-3 w-3" /> Logged In
                </span>
              ) : (
                "Your Recent Activity"
              )}
            </p>
          </div>
        </div>

        <p className="mt-3.5 text-xs text-gray-500 leading-relaxed">
          {user
            ? "View your shortlisted properties, ongoing inquiries, and manage your account details easily."
            : "No activity yet! Start browsing verified properties and projects and track them from here."}
        </p>

        <div className="mt-4">
          {user ? (
            <Link
              href="/dashboard"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#c41920] py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm transition hover:bg-[#8e1016]"
            >
              Go to Dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#c41920] py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm transition hover:bg-[#8e1016]"
              >
                <LogIn className="h-4 w-4" />
                LOGIN / REGISTER
              </Link>
              <p className="mt-2 text-center text-[11px] text-gray-400">
                to access all features on Bhoomi
              </p>
            </>
          )}
        </div>
      </div>

      {/* 2. Sell or Rent Faster (Post Property Free banner) */}
      <div className="relative overflow-hidden rounded-2xl border border-red-100 bg-gradient-to-br from-[#fff5f5] via-[#fef2f2] to-[#fee2e2] p-5 shadow-sm">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1 rounded-full bg-red-100/80 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#c41920]">
            <Sparkles className="h-3 w-3" /> Zero Brokerage
          </div>
          <h4 className="mt-2.5 font-display text-base font-extrabold text-gray-950">
            Sell or rent faster at the right price!
          </h4>
          <p className="mt-1 text-xs text-gray-600">
            List your residential or commercial property in 2 minutes.
          </p>

          <Link
            href="/listings/new"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#c41920] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#8e1016]"
          >
            <PlusCircle className="h-4 w-4" />
            Post Property, It&apos;s FREE
          </Link>
        </div>

        {/* Decorative graphic icon in bottom-right background */}
        <div className="pointer-events-none absolute -bottom-3 -right-3 text-red-200/50">
          <Building className="h-28 w-28" />
        </div>
      </div>
    </aside>
  );
}
