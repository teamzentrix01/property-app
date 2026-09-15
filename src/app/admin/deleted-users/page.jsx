"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  UserX,
  Search,
  RotateCcw,
  Eye,
  EyeOff,
  Copy,
  Check,
  Calendar,
  ShieldAlert,
  UserCheck,
  Clock,
  ArrowLeft,
  KeyRound,
  Mail,
  Phone,
  Info,
} from "lucide-react";

export default function DeletedUsersPage() {
  const [deletedUsers, setDeletedUsers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [reRegFilter, setReRegFilter] = useState("ALL");
  const [showPasswordId, setShowPasswordId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const fetchDeletedUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/users/delete", {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to load deleted accounts");
      }
      setDeletedUsers(data.deletedUsers || []);
    } catch (err) {
      setError(err.message || "Something went wrong loading deleted accounts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeletedUsers();
  }, []);

  const handleCopy = (text, id) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtered list
  const filteredList = useMemo(() => {
    if (!deletedUsers) return [];
    return deletedUsers.filter((u) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.phone && u.phone.toLowerCase().includes(q)) ||
        (u.note && u.note.toLowerCase().includes(q)) ||
        (u.originalUserId && u.originalUserId.toLowerCase().includes(q));

      const matchRole = roleFilter === "ALL" || u.role === roleFilter;

      const isReReg = Boolean(u.reRegisteredAt || u.reRegisteredUserId);
      const matchReReg =
        reRegFilter === "ALL" ||
        (reRegFilter === "REREGISTERED" && isReReg) ||
        (reRegFilter === "NOT_REREGISTERED" && !isReReg);

      return matchSearch && matchRole && matchReReg;
    });
  }, [deletedUsers, searchQuery, roleFilter, reRegFilter]);

  const stats = useMemo(() => {
    if (!deletedUsers) return { total: 0, reRegistered: 0, notReRegistered: 0 };
    const reRegistered = deletedUsers.filter((u) => u.reRegisteredAt || u.reRegisteredUserId).length;
    return {
      total: deletedUsers.length,
      reRegistered,
      notReRegistered: deletedUsers.length - reRegistered,
    };
  }, [deletedUsers]);

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-6">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-[#8a6b6d]">
            <Link
              href="/admin/users"
              className="hover:text-[#c41920] transition inline-flex items-center gap-1 font-medium"
            >
              <ArrowLeft size={16} /> Active Users
            </Link>
            <span>/</span>
            <span className="text-[#180e0f] font-semibold">Deleted Accounts Archive</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#180e0f] flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-rose-100 text-[#c41920]">
              <UserX size={24} />
            </span>
            Deleted Accounts
          </h1>
          <p className="text-xs sm:text-sm text-[#5c4042] max-w-3xl leading-relaxed">
            All user accounts removed from the live system are preserved here with full profile and credential details. If a user signs up again using the same email or phone number, account creation succeeds automatically.
          </p>
        </div>

        <button
          onClick={fetchDeletedUsers}
          disabled={loading}
          className="inline-flex items-center gap-2 self-start sm:self-center px-4 py-2.5 rounded-xl border border-ink/15 bg-white text-xs sm:text-sm font-semibold text-[#180e0f] hover:bg-rose-50 hover:text-[#c41920] transition shadow-sm disabled:opacity-50"
        >
          <RotateCcw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Info Notice Banner */}
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 sm:p-5 flex items-start gap-3.5 text-emerald-900 shadow-sm">
        <Info size={22} className="text-emerald-600 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm space-y-1">
          <p className="font-semibold text-emerald-950">
            Re-Registration Feature Enabled:
          </p>
          <p className="text-emerald-800 leading-relaxed">
            Jab koi user jiska account pehle delete ho chuka hai, usi <strong>Email</strong> ya <strong>Phone Number</strong> se dobara sign up karega, to naya account seamlessly create ho jayega. Archive record automatically update hokar uska latest status reflect karega.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-ink/10 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#8a6b6d]">Total Deleted</p>
            <p className="text-3xl font-extrabold text-[#180e0f] mt-1">{stats.total}</p>
          </div>
          <div className="p-3 bg-rose-50 text-[#c41920] rounded-xl">
            <UserX size={26} />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-ink/10 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#8a6b6d]">Re-Registered Users</p>
            <p className="text-3xl font-extrabold text-emerald-600 mt-1">{stats.reRegistered}</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <UserCheck size={26} />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-ink/10 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#8a6b6d]">Not Yet Re-Registered</p>
            <p className="text-3xl font-extrabold text-amber-600 mt-1">{stats.notReRegistered}</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock size={26} />
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-ink/10 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8a6b6d]" />
          <input
            type="text"
            placeholder="Search by name, email, phone, or admin note..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-ink/15 text-sm focus:outline-none focus:ring-2 focus:ring-[#c41920]/20 focus:border-[#c41920] transition bg-[#faf7f7]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-ink/15 text-xs sm:text-sm font-medium bg-[#faf7f7] text-[#180e0f] focus:outline-none focus:ring-2 focus:ring-[#c41920]/20"
          >
            <option value="ALL">All Roles</option>
            <option value="BUYER">BUYER</option>
            <option value="OWNER">OWNER</option>
            <option value="BROKER">BROKER</option>
            <option value="AREA_ADMIN">AREA_ADMIN</option>
            <option value="SUPER_ADMIN">SUPER_ADMIN</option>
          </select>

          <select
            value={reRegFilter}
            onChange={(e) => setReRegFilter(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-ink/15 text-xs sm:text-sm font-medium bg-[#faf7f7] text-[#180e0f] focus:outline-none focus:ring-2 focus:ring-[#c41920]/20"
          >
            <option value="ALL">All Re-Reg Status</option>
            <option value="REREGISTERED">Re-registered</option>
            <option value="NOT_REREGISTERED">Not Re-registered</option>
          </select>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-ink/10 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-[#8a6b6d] flex flex-col items-center gap-3">
            <RotateCcw size={32} className="animate-spin text-[#c41920]" />
            <p className="text-sm font-semibold">Loading deleted accounts archive...</p>
          </div>
        ) : error ? (
          <div className="py-16 text-center text-rose-600 space-y-3 px-4">
            <ShieldAlert size={40} className="mx-auto" />
            <p className="font-semibold">{error}</p>
            <button
              onClick={fetchDeletedUsers}
              className="px-4 py-2 bg-[#c41920] text-white rounded-xl text-xs font-semibold"
            >
              Try Again
            </button>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="py-20 text-center text-[#8a6b6d] space-y-3 px-4">
            <UserX size={44} className="mx-auto text-[#8a6b6d]/40" />
            <p className="text-base font-semibold text-[#180e0f]">No deleted accounts found</p>
            <p className="text-xs text-[#8a6b6d] max-w-md mx-auto">
              {searchQuery || roleFilter !== "ALL" || reRegFilter !== "ALL"
                ? "No deleted accounts match your search filters. Try clearing your filters."
                : "No accounts have been deleted yet."}
            </p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="min-w-[1050px] w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-ink/10 bg-[#faf7f7] text-[11px] font-bold uppercase tracking-wider text-[#8a6b6d]">
                  <th className="py-3.5 px-4 w-[200px]">User Info</th>
                  <th className="py-3.5 px-4 w-[260px]">Contact & Saved Password</th>
                  <th className="py-3.5 px-4 w-[120px]">Role</th>
                  <th className="py-3.5 px-4 w-[120px]">Prior Status</th>
                  <th className="py-3.5 px-4 w-[180px]">Deleted Date & Admin</th>
                  <th className="py-3.5 px-4 w-[170px]">Re-Registration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10 text-xs">
                {filteredList.map((user) => {
                  const isPasswordVisible = showPasswordId === user.id;
                  const isReReg = Boolean(user.reRegisteredAt || user.reRegisteredUserId);

                  return (
                    <tr key={user.id} className="hover:bg-rose-50/30 transition">
                      {/* USER INFO */}
                      <td className="py-4 px-4 align-top">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-full bg-rose-100 text-[#c41920] font-bold flex items-center justify-center text-sm shrink-0">
                            {user.name ? user.name[0].toUpperCase() : "U"}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-sm text-[#180e0f] truncate">{user.name || "Unknown"}</p>
                            <p className="text-[10px] text-[#8a6b6d] font-mono truncate" title={user.originalUserId}>
                              ID: {user.originalUserId?.slice(0, 12)}...
                            </p>
                            {user.note && (
                              <div className="mt-1.5 p-1.5 rounded-lg bg-amber-50 border border-amber-200/80 text-[10px] text-amber-900 leading-tight">
                                <span className="font-semibold">Note:</span> {user.note}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* CONTACT & SAVED PASSWORD */}
                      <td className="py-4 px-4 align-top">
                        <div className="space-y-1.5">
                          {/* Email */}
                          <div className="flex items-center gap-1.5 group">
                            <Mail size={13} className="text-[#8a6b6d] shrink-0" />
                            <span className="text-[#180e0f] font-medium truncate max-w-[170px] select-all">
                              {user.email}
                            </span>
                            <button
                              onClick={() => handleCopy(user.email, `email-${user.id}`)}
                              className="opacity-0 group-hover:opacity-100 text-[#8a6b6d] hover:text-[#c41920] transition p-0.5"
                              title="Copy email"
                            >
                              {copiedId === `email-${user.id}` ? (
                                <Check size={12} className="text-emerald-600" />
                              ) : (
                                <Copy size={12} />
                              )}
                            </button>
                          </div>

                          {/* Phone */}
                          <div className="flex items-center gap-1.5 group">
                            <Phone size={13} className="text-[#8a6b6d] shrink-0" />
                            <span className="text-[#180e0f] font-mono select-all">
                              {user.phone}
                            </span>
                            <button
                              onClick={() => handleCopy(user.phone, `phone-${user.id}`)}
                              className="opacity-0 group-hover:opacity-100 text-[#8a6b6d] hover:text-[#c41920] transition p-0.5"
                              title="Copy phone"
                            >
                              {copiedId === `phone-${user.id}` ? (
                                <Check size={12} className="text-emerald-600" />
                              ) : (
                                <Copy size={12} />
                              )}
                            </button>
                          </div>

                          {/* Password Hash with Eye Toggle */}
                          <div className="flex items-center gap-1.5 pt-0.5">
                            <KeyRound size={13} className="text-[#8a6b6d] shrink-0" />
                            <div className="flex items-center gap-1 bg-[#faf7f7] px-2 py-0.5 rounded-md border border-ink/10 max-w-[200px]">
                              <span
                                className="font-mono text-[10px] text-[#5c4042] truncate max-w-[130px]"
                                title={isPasswordVisible ? (user.plainPassword || user.passwordHash || "(no password)") : "Original password (click eye to reveal)"}
                              >
                                {isPasswordVisible
                                  ? user.plainPassword || user.passwordHash || "(no password)"
                                  : "••••••••••••"}
                              </span>
                              <button
                                type="button"
                                onClick={() => setShowPasswordId(isPasswordVisible ? null : user.id)}
                                className="text-[#8a6b6d] hover:text-[#c41920] transition p-0.5 shrink-0"
                                title={isPasswordVisible ? "Hide password" : "Show original password"}
                              >
                                {isPasswordVisible ? <EyeOff size={12} /> : <Eye size={12} />}
                              </button>
                              {isPasswordVisible && (user.plainPassword || user.passwordHash) && (
                                <button
                                  type="button"
                                  onClick={() => handleCopy(user.plainPassword || user.passwordHash, `pwd-${user.id}`)}
                                  className="text-[#8a6b6d] hover:text-emerald-600 transition p-0.5 shrink-0"
                                  title="Copy password"
                                >
                                  {copiedId === `pwd-${user.id}` ? (
                                    <Check size={12} className="text-emerald-600" />
                                  ) : (
                                    <Copy size={12} />
                                  )}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* ROLE */}
                      <td className="py-4 px-4 align-top">
                        <span className="inline-block px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase bg-[#faf7f7] border border-ink/15 text-[#180e0f]">
                          {user.role}
                        </span>
                      </td>

                      {/* PRIOR STATUS */}
                      <td className="py-4 px-4 align-top">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase border ${
                            user.verificationStatus === "ACTIVE"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : user.verificationStatus === "REJECTED"
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {user.verificationStatus || "PENDING"}
                        </span>
                      </td>

                      {/* DELETED DATE & ADMIN */}
                      <td className="py-4 px-4 align-top">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-[#180e0f] font-medium">
                            <Calendar size={13} className="text-[#8a6b6d] shrink-0" />
                            <span>
                              {user.deletedAt
                                ? new Date(user.deletedAt).toLocaleDateString("en-IN", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : "N/A"}
                            </span>
                          </div>
                          <p className="text-[10px] text-[#8a6b6d]">
                            By:{" "}
                            <span className="font-semibold text-[#5c4042]">
                              {user.deletedByAdmin?.name || user.deletedByAdmin?.email || user.deletedBy || "Super Admin"}
                            </span>
                          </p>
                        </div>
                      </td>

                      {/* RE-REGISTRATION STATUS */}
                      <td className="py-4 px-4 align-top">
                        {isReReg ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <UserCheck size={12} />
                              Re-Registered
                            </span>
                            {user.reRegisteredAt && (
                              <p className="text-[10px] text-emerald-700">
                                {new Date(user.reRegisteredAt).toLocaleDateString("en-IN", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </p>
                            )}
                            {user.currentAccount ? (
                              <p className="text-[10px] text-[#5c4042] font-medium">
                                Active: {user.currentAccount.name}
                              </p>
                            ) : null}
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-zinc-100 text-zinc-700 border border-zinc-300">
                              Not re-registered
                            </span>
                            <p className="text-[10px] text-[#8a6b6d]">
                              Eligible for signup anytime
                            </p>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Footer hint for mobile horizontal scroll */}
      <div className="text-center text-[11px] text-[#8a6b6d] sm:hidden">
        ← Scroll table horizontally to view all details →
      </div>
    </div>
  );
}
