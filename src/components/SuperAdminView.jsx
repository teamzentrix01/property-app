"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Building2,
  Users,
  CheckCircle2,
  Clock,
  Plus,
  Copy,
  ExternalLink,
  Trash2,
  PhoneCall,
  Search,
  Filter,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  ChevronRight,
  TrendingUp,
  LayoutGrid,
} from "lucide-react";
import { CONTENT_CATEGORIES } from "@/lib/contentCategories";
import StatusBadge, { statusLabel } from "@/components/StatusBadge";
import AdminOverview from "@/components/AdminOverview";

export default function SuperAdminView({
  user,
  pending = [],
  inquiries = [],
  homepageListings = [],
  recommendationSections = [],
  recommendationForm,
  setRecommendationForm,
  createRecommendationSection,
  removeRecommendationSection,
  addListingToBlock,
  copyListingId,
  copiedListingId,
  approveListing,
  listingCategories,
  toggleCategory,
}) {
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "pending" | "homepage" | "inquiries" | "analytics"
  const [listingSearch, setListingSearch] = useState("");
  const [selectedPendingStatus, setSelectedPendingStatus] = useState("ALL");

  const filteredHomepageListings = homepageListings.filter((l) =>
    `${l.title} ${l.area} ${l.city} ${l.id}`
      .toLowerCase()
      .includes(listingSearch.toLowerCase())
  );

  const filteredPending = pending.filter((l) => {
    if (selectedPendingStatus === "ALL") return true;
    return l.status === selectedPendingStatus;
  });

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-200">
      {/* 1. Header Card with Quick Admin Nav Bar */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-zinc-900 to-[#7f1d1d] p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-red-500/20 px-3 py-1 text-xs font-bold text-red-200 backdrop-blur-md mb-2 border border-red-500/30">
              <Sparkles className="h-3.5 w-3.5 text-red-400" />
              <span>Super Admin Portal</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
              Welcome back, {user.name}
            </h1>
            <p className="mt-1 text-sm text-zinc-300">
              Complete platform management: Approvals, Homepage recommendations, user inquiries, and live audits.
            </p>
          </div>

          {/* Quick Direct Links */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/admin/users"
              className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/20 transition border border-white/10"
            >
              <Users className="h-4 w-4 text-emerald-400" />
              <span>Manage Users</span>
            </Link>
            <Link
              href="/admin/properties"
              className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 px-4 py-2.5 text-xs font-bold text-white hover:bg-white/20 transition border border-white/10"
            >
              <Building2 className="h-4 w-4 text-sky-400" />
              <span>All Properties</span>
            </Link>
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#c41920] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#8e1016] transition shadow-md"
            >
              <span>Admin Panel</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Quick KPI Stat Counter Pills */}
        <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
            <span className="text-zinc-400 block font-medium">Pending Approvals</span>
            <span className="text-xl font-bold text-amber-400">{pending.length}</span>
          </div>
          <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
            <span className="text-zinc-400 block font-medium">Inquiries / Leads</span>
            <span className="text-xl font-bold text-sky-400">{inquiries.length}</span>
          </div>
          <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
            <span className="text-zinc-400 block font-medium">Approved Listings</span>
            <span className="text-xl font-bold text-emerald-400">{homepageListings.length}</span>
          </div>
          <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
            <span className="text-zinc-400 block font-medium">Home Blocks</span>
            <span className="text-xl font-bold text-purple-400">{recommendationSections.length}</span>
          </div>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex overflow-x-auto no-scrollbar gap-2 border-b border-gray-200 pb-2">
        {[
          { id: "overview", label: "Overview & Analytics", icon: TrendingUp },
          { id: "pending", label: `Pending Approvals (${pending.length})`, icon: Clock },
          { id: "homepage", label: "Homepage & Recommendations", icon: LayoutGrid },
          { id: "inquiries", label: `Visit Requests & Leads (${inquiries.length})`, icon: PhoneCall },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                isActive
                  ? "bg-[#c41920] text-white shadow-sm"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200/80"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. TAB 1: OVERVIEW & ANALYTICS */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <AdminOverview />
        </div>
      )}

      {/* 4. TAB 2: PENDING APPROVALS */}
      {activeTab === "pending" && (
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="font-display text-xl font-bold text-gray-900">
                Pending Property Approvals
              </h2>
              <p className="text-xs text-gray-500">
                Review submitted property documents and verify categories before approving.
              </p>
            </div>

            {/* Filter by status */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-400">Status:</span>
              <select
                value={selectedPendingStatus}
                onChange={(e) => setSelectedPendingStatus(e.target.value)}
                className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-bold text-gray-700 outline-none"
              >
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>

          {filteredPending.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
              No listings match the current filter.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPending.map((listing) => (
                <div
                  key={listing.id}
                  className="rounded-2xl border border-gray-200 bg-white p-5 hover:border-red-200 transition shadow-2xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <Link
                          href={`/listings/${listing.id}`}
                          className="font-display text-base font-bold text-gray-900 hover:text-[#c41920] transition"
                        >
                          {listing.title}
                        </Link>
                        <StatusBadge status={listing.status} />
                      </div>
                      <p className="text-xs text-gray-500">
                        📍 {listing.area}, {listing.city} · Posted by{" "}
                        <strong className="text-gray-800">{listing.owner?.name}</strong> (
                        {listing.owner?.role}) · Phone:{" "}
                        <a href={`tel:${listing.owner?.phone}`} className="text-sky-600 underline">
                          {listing.owner?.phone}
                        </a>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        href={`/admin/properties/${listing.id}`}
                        className="rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
                      >
                        Inspect Details
                      </Link>
                      <select
                        value={listing.status}
                        onChange={(e) => approveListing(listing.id, e.target.value)}
                        className="rounded-xl border border-gray-300 bg-white px-3 py-1.5 text-xs font-bold text-gray-900 focus:ring-2 focus:ring-red-200 outline-none"
                      >
                        {[
                          "PENDING",
                          "UNDER_REVIEW",
                          "APPROVED",
                          "ACTIVE",
                          "REJECTED",
                          "INACTIVE",
                        ].map((s) => (
                          <option key={s} value={s}>
                            {statusLabel(s)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Categories checkboxes */}
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
                      Assign Homepage Feature Categories:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {CONTENT_CATEGORIES.map((cat) => {
                        const isChecked = (
                          listingCategories[listing.id] ||
                          listing.categories?.map((c) => c.category) ||
                          []
                        ).includes(cat.value);
                        return (
                          <label
                            key={cat.value}
                            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium cursor-pointer transition ${
                              isChecked
                                ? "border-[#c41920] bg-red-50 text-[#c41920]"
                                : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleCategory(listing.id, cat.value)}
                              className="accent-[#c41920] rounded"
                            />
                            {cat.label}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. TAB 3: HOMEPAGE RECOMMENDATION BLOCKS */}
      {activeTab === "homepage" && (
        <div className="space-y-6">
          {/* Create Recommendation Block Form */}
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-xs">
            <div className="mb-5">
              <span className="text-xs font-bold uppercase tracking-wider text-[#c41920]">
                Homepage Customization
              </span>
              <h2 className="mt-1 font-display text-xl font-bold text-gray-900">
                Create Recommendation Section Block
              </h2>
              <p className="text-xs text-gray-500">
                Create custom curated showcases on the homepage (e.g. &quot;Prime Plots in Moradabad&quot;).
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Section Title *
                </label>
                <input
                  value={recommendationForm.title}
                  onChange={(e) =>
                    setRecommendationForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-xs text-gray-900 focus:bg-white focus:border-[#c41920] outline-none"
                  placeholder="e.g. Handpicked Luxury Villas"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Subtitle
                </label>
                <input
                  value={recommendationForm.subtitle}
                  onChange={(e) =>
                    setRecommendationForm((prev) => ({ ...prev, subtitle: e.target.value }))
                  }
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-xs text-gray-900 focus:bg-white focus:border-[#c41920] outline-none"
                  placeholder="e.g. Verified by Bhoomi Experts"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Listing IDs (Comma separated or click from list below) *
                </label>
                <textarea
                  rows={2}
                  value={recommendationForm.listingIds}
                  onChange={(e) =>
                    setRecommendationForm((prev) => ({ ...prev, listingIds: e.target.value }))
                  }
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2 text-xs font-mono text-gray-900 focus:bg-white focus:border-[#c41920] outline-none"
                  placeholder="cmw..., cmw..."
                />
              </div>

              <div className="sm:col-span-2">
                <button
                  type="button"
                  onClick={createRecommendationSection}
                  className="rounded-xl bg-gradient-to-r from-[#c41920] to-[#e62630] px-5 py-2.5 text-xs font-bold text-white shadow hover:from-[#8e1016] hover:to-[#c41920] transition cursor-pointer"
                >
                  Save Recommendation Block
                </button>
              </div>
            </div>
          </div>

          {/* Existing Recommendation Blocks */}
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-xs">
            <h3 className="font-display text-lg font-bold text-gray-900 mb-4">
              Active Recommendation Blocks ({recommendationSections.length})
            </h3>

            {recommendationSections.length === 0 ? (
              <p className="text-xs text-gray-500 italic">No blocks created yet.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {recommendationSections.map((sec) => (
                  <div
                    key={sec.id}
                    className="rounded-2xl border border-gray-200 bg-gray-50/60 p-4 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-[#c41920]">
                            {sec.subtitle || "Featured"}
                          </p>
                          <h4 className="font-bold text-sm text-gray-900">{sec.title}</h4>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeRecommendationSection(sec.id)}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition"
                          title="Delete section"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {(sec.items || []).map((it) => (
                          <span
                            key={it.id}
                            className="rounded-md bg-white border border-gray-200 px-2 py-0.5 text-[10px] font-medium text-gray-700 truncate max-w-[180px]"
                          >
                            {it.listing?.title || it.listingId}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Approved Listings Browser for Easy Copying */}
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                <h3 className="font-display text-lg font-bold text-gray-900">
                  Approved Listings Explorer
                </h3>
                <p className="text-xs text-gray-500">
                  Click &quot;+ Add to block&quot; to automatically add to the section above.
                </p>
              </div>

              {/* Search filter */}
              <div className="relative w-full sm:w-64">
                <Search className="h-4 w-4 absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  value={listingSearch}
                  onChange={(e) => setListingSearch(e.target.value)}
                  placeholder="Search listings..."
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-3 py-2 text-xs text-gray-800 outline-none focus:bg-white focus:border-[#c41920]"
                />
              </div>
            </div>

            {filteredHomepageListings.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-6">No approved listings found.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {filteredHomepageListings.map((l) => (
                  <div
                    key={l.id}
                    className="rounded-2xl border border-gray-200 bg-white p-4 shadow-2xs flex flex-col justify-between hover:border-gray-300 transition"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-bold text-xs text-gray-900 line-clamp-1">{l.title}</p>
                        <span className="shrink-0 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          Approved
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        {l.area}, {l.city}
                      </p>
                      <p className="mt-2 text-[10px] font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded truncate select-all">
                        {l.id}
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => addListingToBlock(l.id)}
                        className="flex-1 rounded-lg bg-red-50 text-[#c41920] hover:bg-[#c41920] hover:text-white py-1.5 text-[11px] font-bold transition text-center cursor-pointer"
                      >
                        + Add to block
                      </button>
                      <button
                        type="button"
                        onClick={() => copyListingId(l.id)}
                        className="rounded-lg border border-gray-200 px-2 py-1.5 text-[11px] text-gray-600 hover:bg-gray-50 transition cursor-pointer"
                        title="Copy ID"
                      >
                        {copiedListingId === l.id ? "✓ Copied" : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. TAB 4: VISIT REQUESTS & INQUIRIES */}
      {activeTab === "inquiries" && (
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-xs">
          <div className="mb-6">
            <h2 className="font-display text-xl font-bold text-gray-900">
              Customer Leads & Visit Requests ({inquiries.length})
            </h2>
            <p className="text-xs text-gray-500">
              Direct inquiries and contact requests submitted through listing inquiry forms.
            </p>
          </div>

          {inquiries.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
              No inquiries received yet.
            </div>
          ) : (
            <div className="space-y-3">
              {inquiries.map((q) => (
                <div
                  key={q.id}
                  className="rounded-2xl border border-gray-200 bg-white p-5 hover:border-gray-300 transition shadow-2xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                      <Link
                        href={`/listings/${q.listing.id}`}
                        className="font-bold text-sm text-gray-900 hover:text-[#c41920] transition inline-flex items-center gap-1.5"
                      >
                        <span>{q.listing.title}</span>
                        <ExternalLink className="h-3 w-3 text-gray-400" />
                      </Link>
                      <p className="text-xs text-gray-500">
                        📍 {q.listing.area}, {q.listing.city}
                      </p>
                    </div>
                    <span className="text-[11px] font-medium text-gray-400">
                      {new Date(q.createdAt).toLocaleDateString("en-IN")}
                    </span>
                  </div>

                  <p className="mt-3 text-xs leading-relaxed text-gray-700 bg-gray-50 rounded-xl p-3 border border-gray-100">
                    {q.message}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs text-gray-500">
                      From: <strong className="text-gray-900">{q.sender?.name}</strong> (
                      {q.sender?.email})
                    </p>
                    {q.sender?.phone && (
                      <a
                        href={`tel:${q.sender.phone}`}
                        className="inline-flex items-center gap-1.5 rounded-full bg-[#180e0f] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#c41920] transition"
                      >
                        <PhoneCall className="h-3.5 w-3.5 text-white" />
                        <span>Call {q.sender.name}</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

