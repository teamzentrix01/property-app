"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Check,
  X,
  FileText,
  Image as ImageIcon,
  ShieldCheck,
  AlertTriangle,
  Eye,
  EyeOff,
  Ban,
  RotateCcw,
  Search,
  Trash2,
  UserX,
  Copy,
  Pencil,
} from "lucide-react";

const ROLES = ["BUYER", "OWNER", "BROKER", "AREA_ADMIN", "SUPER_ADMIN"];
const labels = {
  AADHAAR: "Aadhaar Card",
  PAN: "PAN Card",
  ADDRESS_PROOF: "Address Proof",
  ID_PROOF: "ID Proof",
  OTHER: "Other",
};

const isPdf = (doc) => {
  if (!doc) return false;
  const name = (doc.originalName || "").toLowerCase();
  const url = (doc.cloudinaryUrl || "").toLowerCase();
  const type = (doc.fileType || "").toLowerCase();
  return type.includes("pdf") || name.endsWith(".pdf") || url.endsWith(".pdf");
};

export default function ManageUsers() {
  const [users, setUsers] = useState(undefined);
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [loadingDocId, setLoadingDocId] = useState(null);
  const [statusTab, setStatusTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  // Track which row's password is currently visible (by user id)
  const [showPasswordId, setShowPasswordId] = useState(null);
  const [copiedPasswordId, setCopiedPasswordId] = useState(null);

  const copyPassword = (pwd, id) => {
    if (!pwd) return;
    navigator.clipboard.writeText(pwd).then(() => {
      setCopiedPasswordId(id);
      setTimeout(() => setCopiedPasswordId(null), 2000);
    });
  };

  const setPasswordPrompt = async (u) => {
    const newPwd = window.prompt(`Set new password for ${u.name || u.email} (min 6 characters):`);
    if (newPwd === null) return;
    if (!newPwd.trim() || newPwd.trim().length < 6) {
      alert("Password must be at least 6 characters long.");
      return;
    }
    await update(u.id, { plainPassword: newPwd.trim() });
  };

  const loadUsers = () => {
    fetch(`/api/admin/users?order=${sortOrder}`)
      .then(async (r) => {
        const data = await r.json().catch(() => ({}));
        if (!r.ok) {
          setError(data?.error || "Not authorized");
          setUsers([]);
          return;
        }
        setError("");
        setUsers(data?.users || []);
        if (selectedUser) {
          const refreshed = (data?.users || []).find((u) => u.id === selectedUser.id);
          if (refreshed) setSelectedUser(refreshed);
        }
      })
      .catch((err) => {
        console.error("Failed to load users:", err);
        setError(err.message || "Failed to load users");
        setUsers([]);
      });
  };

  useEffect(() => {
    loadUsers();
  }, [sortOrder]);

  async function update(userId, patch) {
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, ...patch }),
    });
    const data = await res.json();
    if (res.ok) {
      if (patch.verified === true) {
        alert(data.emailSent ? "User verified! Confirmation email sent to " + (data.user?.email || "user") : "User verified successfully.");
      }
      setUsers((us) => us.map((u) => (u.id === userId ? data.user : u)));
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser(data.user);
      }
    } else {
      alert(data.error || "Update failed");
    }
  }

  async function resendVerificationEmail(userId, userEmail) {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action: "RESEND_VERIFICATION_EMAIL" }),
      });
      const data = await res.json();
      if (res.ok && data.emailSent) {
        alert("Verification email sent successfully to " + userEmail);
      } else {
        alert(data.error || data.message || "Failed to send verification email");
      }
    } catch (err) {
      alert("Error sending email: " + err.message);
    }
  }

  async function rejectAccount(userId, userName) {
    const reason = window.prompt(
      `Reject account for "${userName}"?\nEnter rejection reason:`,
      "Documents or information provided do not meet verification standards."
    );
    if (reason === null) return;
    await update(userId, {
      action: "REJECT",
      rejectionReason: reason.trim() || "Account rejected by administrator.",
    });
  }

  async function restoreAccount(userId) {
    if (!window.confirm("Are you sure you want to move this account back to Pending review?")) return;
    await update(userId, { action: "RESTORE" });
  }

  async function deleteUser(userId, userName) {
    const note = window.prompt(
      `Delete account for "${userName}"?\nThis will archive their data (email, phone, password hash) so you can view it later.\n\nOptional note for deletion (press OK to skip):`,
      ""
    );
    if (note === null) return; // user pressed Cancel
    const res = await fetch("/api/admin/users/delete", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, note: note.trim() || null }),
    });
    const data = await res.json();
    if (res.ok) {
      alert(data.message || "User deleted and archived.");
      setUsers((us) => us.filter((u) => u.id !== userId));
      if (selectedUser?.id === userId) setSelectedUser(null);
    } else {
      alert(data.error || "Delete failed.");
    }
  }

  async function updateDocumentStatus(docId, status) {
    let reason = undefined;
    if (status === "REJECTED") {
      reason = window.prompt(
        "Please enter a rejection reason:",
        "Document is unclear or invalid. Please re-upload."
      );
      if (reason === null) return;
      if (!reason.trim()) reason = "Document could not be verified.";
    }
    setLoadingDocId(docId);
    try {
      const res = await fetch(`/api/admin/documents/${docId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, reason }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to update document status");
      } else {
        loadUsers();
      }
    } catch (e) {
      alert(e.message || "Failed to update document status");
    } finally {
      setLoadingDocId(null);
    }
  }

  if (error) return <main className="flex-1 px-6 py-16 text-center text-red-600">{error}</main>;
  if (!users) return <main className="flex-1 px-6 py-16 text-slate-500">Loading…</main>;

  // Filter calculations
  const allNonRejected = users.filter((u) => u.verificationStatus !== "REJECTED");
  const verifiedList = users.filter(
    (u) => (u.verified || u.verificationStatus === "ACTIVE") && u.verificationStatus !== "REJECTED"
  );
  const pendingList = users.filter((u) => u.verificationStatus === "PENDING");
  const rejectedList = users.filter((u) => u.verificationStatus === "REJECTED");

  // CRITICAL RULE: If an account is REJECTED, it ONLY appears in the "rejected" tab!
  const displayedUsers = users.filter((u) => {
    if (statusTab === "rejected") {
      if (u.verificationStatus !== "REJECTED") return false;
    } else {
      // Any other tab STRICTLY EXCLUDES rejected accounts!
      if (u.verificationStatus === "REJECTED") return false;

      if (statusTab === "verified") {
        if (!u.verified && u.verificationStatus !== "ACTIVE") return false;
      } else if (statusTab === "pending") {
        if (u.verificationStatus !== "PENDING") return false;
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        (u.name || "").toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q) ||
        (u.phone || "").toLowerCase().includes(q) ||
        (u.id || "").toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });

  return (
    <main className="flex-1 w-full max-w-[1400px] mx-auto px-3 sm:px-6 py-6 sm:py-10">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl mb-1 text-gray-900">Manage Users</h1>
          <p className="text-ink-soft text-xs sm:text-sm">
            Review documents, verify accounts, manage rejections, and set roles.
          </p>
        </div>
        <Link
          href="/admin/deleted-users"
          className="self-start sm:self-center inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-rose-200 bg-rose-50 text-xs font-semibold text-[#c41920] hover:bg-rose-100 hover:border-rose-300 transition shadow-xs"
        >
          <UserX size={15} />
          Deleted Accounts Archive
        </Link>
      </div>

      {/* FILTER TABS & SEARCH BAR */}
      <div className="flex flex-col gap-3 mt-4 mb-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Status tabs — scroll horizontally on very small screens */}
        <div className="overflow-x-auto pb-0.5">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-gray-200 text-xs font-semibold w-max">
            <button
              type="button"
              onClick={() => setStatusTab("all")}
              className={`px-2.5 py-1.5 rounded-lg transition whitespace-nowrap ${
                statusTab === "all"
                  ? "bg-white text-gray-900 shadow-xs font-bold"
                  : "text-slate-600 hover:text-gray-900"
              }`}
            >
              All ({allNonRejected.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusTab("verified")}
              className={`px-2.5 py-1.5 rounded-lg transition whitespace-nowrap ${
                statusTab === "verified"
                  ? "bg-white text-green-800 shadow-xs font-bold"
                  : "text-slate-600 hover:text-gray-900"
              }`}
            >
              Verified ({verifiedList.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusTab("pending")}
              className={`px-2.5 py-1.5 rounded-lg transition whitespace-nowrap ${
                statusTab === "pending"
                  ? "bg-white text-amber-800 shadow-xs font-bold"
                  : "text-slate-600 hover:text-gray-900"
              }`}
            >
              Pending ({pendingList.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusTab("rejected")}
              className={`px-2.5 py-1.5 rounded-lg transition flex items-center gap-1 whitespace-nowrap ${
                statusTab === "rejected"
                  ? "bg-red-600 text-white shadow-xs font-bold"
                  : "text-red-700 hover:bg-red-50"
              }`}
            >
              Rejected ({rejectedList.length})
              {rejectedList.length > 0 && statusTab !== "rejected" && (
                <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              )}
            </button>
          </div>
        </div>

        {/* Sort order + Search */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition shadow-2xs cursor-pointer whitespace-nowrap"
            title="Toggle FIFO / LIFO"
          >
            <span className="text-gray-400">Order:</span>
            <span className={sortOrder === "asc" ? "text-emerald-700 font-bold" : "text-blue-700 font-bold"}>
              {sortOrder === "asc" ? "FIFO" : "LIFO"}
            </span>
          </button>

          <div className="relative flex-1 min-w-[180px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search name, email, phone…"
              className="w-full rounded-xl border border-gray-200 bg-white pl-8 pr-3.5 py-1.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600/30"
            />
          </div>
        </div>
      </div>

      {/* Scroll hint for small screens */}
      <p className="text-[10px] text-slate-400 mb-1.5 sm:hidden">← Scroll right to see all columns</p>

      {/* USERS TABLE — horizontally scrollable on small screens */}
      <div className="w-full overflow-x-auto rounded-2xl shadow-sm border border-ink/10">
        <table className="min-w-[980px] w-full text-sm bg-paper text-ink">
          <thead className="bg-paper-dim font-data text-xs uppercase text-ink-soft">
            <tr>
              <th className="text-left px-3 py-3 w-10">#</th>
              <th className="text-left px-3 py-3 w-44">Name</th>
              <th className="text-left px-3 py-3 w-52">Contact</th>
              <th className="text-left px-3 py-3 w-28">Joined</th>
              <th className="text-left px-3 py-3 w-36">Role</th>
              <th className="text-left px-3 py-3 w-28">Admin Area</th>
              <th className="text-left px-3 py-3 w-32">Documents</th>
              <th className="text-left px-3 py-3 w-28">Status</th>
              <th className="text-right px-3 py-3 w-36">Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayedUsers.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-10 text-center text-sm text-slate-400">
                  {statusTab === "rejected"
                    ? "No rejected accounts."
                    : statusTab === "verified"
                    ? "No verified accounts found."
                    : statusTab === "pending"
                    ? "No pending accounts awaiting verification."
                    : "No users found."}
                </td>
              </tr>
            ) : (
              [...displayedUsers]
                .sort((a, b) => {
                  const tA = new Date(a.createdAt).getTime() || 0;
                  const tB = new Date(b.createdAt).getTime() || 0;
                  return sortOrder === "asc" ? tA - tB : tB - tA;
                })
                .map((u, index) => {
                  const docs = u.documents || [];
                  const verifiedDocs = docs.filter((d) => d.verificationStatus === "VERIFIED");
                  const pendingDocs = docs.filter((d) => d.verificationStatus === "PENDING");
                  const rejectedDocs = docs.filter((d) => d.verificationStatus === "REJECTED");
                  const allDocsVerified = docs.length > 0 && docs.length === verifiedDocs.length;
                  const isRejected = u.verificationStatus === "REJECTED";

                  return (
                    <tr key={u.id} className="border-t border-ink/10 hover:bg-slate-50/60 transition align-top">

                      {/* # */}
                      <td className="px-3 py-3 font-data text-xs text-slate-400 font-bold whitespace-nowrap">
                        #{index + 1}
                      </td>

                      {/* NAME */}
                      <td className="px-3 py-3 max-w-[176px]">
                        <Link
                          href={`/admin/users/${u.id}`}
                          className="font-semibold text-gray-900 hover:text-green-800 hover:underline text-sm leading-tight block"
                        >
                          {u.name}
                        </Link>
                        <p className="mt-0.5 text-[10px] text-slate-400 break-all leading-tight">{u.id}</p>
                        {isRejected && u.rejectionReason && (
                          <p className="mt-1 text-[10px] text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-100 leading-snug">
                            {u.rejectionReason}
                          </p>
                        )}
                      </td>

                      {/* CONTACT */}
                      <td className="px-3 py-3 font-data text-xs max-w-[208px]">
                        <div className="space-y-0.5">
                          <div className="text-slate-800 break-all">{u.email}</div>
                          <div className="text-slate-500">{u.phone}</div>
                          {/* Original password row with eye toggle */}
                          <div className="flex items-center gap-1 mt-1 min-w-0">
                            <span
                              className={`font-mono text-[10px] select-none truncate max-w-[130px] ${
                                showPasswordId === u.id ? "text-slate-800 font-semibold" : "text-slate-400"
                              }`}
                              title={
                                showPasswordId === u.id
                                  ? (u.plainPassword || u.passwordHash || "—")
                                  : "Original password (click eye to reveal)"
                              }
                            >
                              {showPasswordId === u.id
                                ? (u.plainPassword || u.passwordHash || "—")
                                : "••••••••••••"}
                            </span>
                            <button
                              type="button"
                              title={showPasswordId === u.id ? "Hide password" : "Show original password"}
                              onClick={() =>
                                setShowPasswordId((prev) => (prev === u.id ? null : u.id))
                              }
                              className="shrink-0 rounded p-0.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                            >
                              {showPasswordId === u.id ? <EyeOff size={11} /> : <Eye size={11} />}
                            </button>
                            {showPasswordId === u.id && (u.plainPassword || u.passwordHash) && (
                              <button
                                type="button"
                                title="Copy password"
                                onClick={() => copyPassword(u.plainPassword || u.passwordHash, u.id)}
                                className="shrink-0 rounded p-0.5 text-slate-400 hover:text-emerald-600 hover:bg-slate-100 transition"
                              >
                                {copiedPasswordId === u.id ? (
                                  <Check size={11} className="text-emerald-600" />
                                ) : (
                                  <Copy size={11} />
                                )}
                              </button>
                            )}
                            <button
                              type="button"
                              title="Set or update password"
                              onClick={() => setPasswordPrompt(u)}
                              className="shrink-0 rounded p-0.5 text-slate-300 hover:text-blue-600 hover:bg-slate-100 transition"
                            >
                              <Pencil size={10} />
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* JOINED */}
                      <td className="px-3 py-3 font-data text-xs text-slate-600 whitespace-nowrap">
                        {u.createdAt
                          ? new Date(u.createdAt).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "-"}
                        <br />
                        <span className="text-[10px] text-slate-400">
                          {u.createdAt
                            ? new Date(u.createdAt).toLocaleTimeString("en-IN", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : ""}
                        </span>
                      </td>

                      {/* ROLE */}
                      <td className="px-3 py-3">
                        <select
                          value={u.role}
                          onChange={(e) => {
                            const role = e.target.value;
                            if (role === "AREA_ADMIN") {
                              const adminArea = window.prompt("City this admin can moderate:", u.adminArea || "");
                              if (!adminArea?.trim()) return;
                              update(u.id, { role, adminArea });
                              return;
                            }
                            update(u.id, { role, adminArea: null });
                          }}
                          className="rounded-lg px-2 py-1 border border-ink/10 font-data text-xs bg-white w-full max-w-[130px]"
                        >
                          {ROLES.map((r) => (
                            <option key={r} value={r}>
                              {r.replaceAll("_", " ")}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* ADMIN AREA */}
                      <td className="px-3 py-3">
                        <input
                          defaultValue={u.adminArea || ""}
                          placeholder="e.g. Moradabad"
                          onBlur={(e) => update(u.id, { adminArea: e.target.value })}
                          disabled={u.role !== "AREA_ADMIN"}
                          className="rounded-lg px-2 py-1 border border-ink/10 text-xs w-full max-w-[112px] disabled:opacity-40 bg-white"
                        />
                      </td>

                      {/* DOCUMENTS */}
                      <td className="px-3 py-3">
                        {docs.length === 0 ? (
                          <button
                            type="button"
                            onClick={() => setSelectedUser(u)}
                            className="inline-flex rounded-md bg-gray-100 px-2 py-1 text-[11px] font-medium text-gray-500 hover:bg-gray-200 transition whitespace-nowrap"
                          >
                            No docs
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setSelectedUser(u)}
                            className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold shadow-xs transition whitespace-nowrap ${
                              allDocsVerified
                                ? "bg-green-50 text-green-800 border border-green-200 hover:bg-green-100"
                                : pendingDocs.length > 0
                                ? "bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100"
                                : "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                            }`}
                            title="Click to view and verify documents"
                          >
                            {allDocsVerified
                              ? `✓ ${docs.length} Verified`
                              : pendingDocs.length > 0
                              ? `⚠ ${pendingDocs.length} Pending`
                              : `✗ ${rejectedDocs.length} Rejected`}
                            <span className="text-[10px] opacity-70">({docs.length})</span>
                          </button>
                        )}
                      </td>

                      {/* STATUS / VERIFIED */}
                      <td className="px-3 py-3">
                        {isRejected ? (
                          <span className="inline-flex items-center gap-1 rounded-md bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700 whitespace-nowrap">
                            <Ban size={12} /> Rejected
                          </span>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="checkbox"
                              checked={u.verified}
                              onChange={(e) => {
                                const nextVerified = e.target.checked;
                                if (nextVerified && !allDocsVerified) {
                                  alert(
                                    docs.length === 0
                                      ? "Bina documents verify kiye user account verify nahi ho sakta."
                                      : "Sabhi documents pehle verify karein."
                                  );
                                  setSelectedUser(u);
                                  return;
                                }
                                update(u.id, { verified: nextVerified });
                              }}
                              className={`h-4 w-4 rounded border-gray-300 accent-green-700 ${
                                !u.verified && !allDocsVerified ? "cursor-not-allowed opacity-60" : "cursor-pointer"
                              }`}
                              title={
                                u.verified
                                  ? "User account is verified"
                                  : allDocsVerified
                                  ? "Ready to verify"
                                  : "Documents must be verified first"
                              }
                            />
                            <span
                              className={`text-xs font-semibold whitespace-nowrap ${
                                u.verified ? "text-green-700" : allDocsVerified ? "text-amber-700" : "text-slate-400"
                              }`}
                            >
                              {u.verified ? "Verified" : allDocsVerified ? "Ready" : "Locked"}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* ACTIONS */}
                      <td className="px-3 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap min-w-[112px]">
                          {isRejected ? (
                            <button
                              type="button"
                              onClick={() => restoreAccount(u.id)}
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-2 py-1 text-[11px] font-bold text-gray-700 hover:bg-slate-100 transition whitespace-nowrap"
                              title="Restore to Pending"
                            >
                              <RotateCcw size={11} /> Restore
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => rejectAccount(u.id, u.name)}
                              className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2 py-1 text-[11px] font-bold text-red-600 hover:bg-red-50 transition whitespace-nowrap"
                              title="Reject account"
                            >
                              <Ban size={11} /> Reject
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => deleteUser(u.id, u.name)}
                            className="inline-flex items-center gap-1 rounded-lg border border-rose-300 bg-rose-50 px-2 py-1 text-[11px] font-bold text-rose-700 hover:bg-rose-100 transition whitespace-nowrap"
                            title="Delete account (data archived)"
                          >
                            <Trash2 size={11} /> Delete
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
            )}
          </tbody>
        </table>
      </div>

      {/* USER DOCUMENTS REVIEW & VERIFICATION MODAL */}
      {selectedUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedUser(null)}
        >
          <div
            className="relative flex flex-col w-full max-w-3xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-gray-900 text-lg">Documents for {selectedUser.name}</h3>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                    {selectedUser.role}
                  </span>
                  {selectedUser.verificationStatus === "REJECTED" ? (
                    <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-700">
                      REJECTED
                    </span>
                  ) : selectedUser.verified ? (
                    <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-bold text-green-800">
                      VERIFIED
                    </span>
                  ) : (
                    <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800">
                      PENDING
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedUser.email} · {selectedUser.phone} · ID: {selectedUser.id}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Rejection Alert Banner in Modal if rejected */}
            {selectedUser.verificationStatus === "REJECTED" && (
              <div className="px-6 py-3 bg-red-50 border-b border-red-200 flex items-start justify-between gap-3">
                <div className="flex items-start gap-2 text-xs text-red-800">
                  <AlertTriangle size={16} className="text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold">This user account is currently REJECTED.</strong>
                    <p className="mt-0.5">Reason: {selectedUser.rejectionReason || "Verification criteria not met."}</p>
                    {selectedUser.rejectedAt && (
                      <p className="text-[11px] text-red-600/80 mt-0.5">
                        Rejected on: {new Date(selectedUser.rejectedAt).toLocaleString("en-IN")}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => restoreAccount(selectedUser.id)}
                  className="rounded-lg bg-white border border-red-300 px-3 py-1 text-xs font-bold text-red-700 hover:bg-red-100 transition shrink-0"
                >
                  Restore to Pending
                </button>
              </div>
            )}

            {/* Modal Body: Document List */}
            <div className="flex-1 overflow-auto p-6 space-y-4 bg-slate-50">
              {!selectedUser.documents || selectedUser.documents.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-xl border border-dashed border-gray-200">
                  <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-gray-700">No documents uploaded</p>
                  <p className="text-xs text-gray-400 mt-1">
                    This user has not uploaded any verification documents yet. User account cannot be verified without
                    documents.
                  </p>
                </div>
              ) : (
                selectedUser.documents.map((doc) => {
                  const isVerifiedDoc = doc.verificationStatus === "VERIFIED";
                  const isRejectedDoc = doc.verificationStatus === "REJECTED";
                  const isLoading = loadingDocId === doc.id;

                  return (
                    <div
                      key={doc.id}
                      className="rounded-xl border border-gray-200 bg-white p-4 shadow-xs flex flex-col gap-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                            {isPdf(doc) ? <FileText size={20} /> : <ImageIcon size={20} />}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-sm">
                              {labels[doc.documentType] || doc.documentType}
                            </p>
                            <p className="text-xs text-slate-500">
                              {doc.originalName} · Uploaded: {new Date(doc.uploadedAt).toLocaleDateString("en-IN")}
                            </p>
                          </div>
                        </div>

                        {/* Document Status Badge */}
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${
                            isVerifiedDoc
                              ? "bg-green-50 text-green-700 border border-green-200"
                              : isRejectedDoc
                              ? "bg-red-50 text-red-700 border border-red-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {doc.verificationStatus}
                        </span>
                      </div>

                      {doc.rejectionReason && (
                        <p className="text-xs rounded-lg bg-red-50 p-2 text-red-700 border border-red-200">
                          Rejection reason: {doc.rejectionReason}
                        </p>
                      )}

                      {/* Action buttons on document */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => setPreviewDoc(doc)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                        >
                          <Eye size={14} />
                          Preview Document
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={isLoading || isVerifiedDoc}
                            onClick={() => updateDocumentStatus(doc.id, "VERIFIED")}
                            className="inline-flex items-center gap-1 rounded-lg bg-green-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Check size={14} />
                            {isVerifiedDoc ? "Verified" : "Verify"}
                          </button>

                          <button
                            type="button"
                            disabled={isLoading}
                            onClick={() => updateDocumentStatus(doc.id, "REJECTED")}
                            className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 transition disabled:opacity-50"
                          >
                            <X size={14} />
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer: Account Verification & Rejection Actions */}
            <div className="px-6 py-4 border-t border-gray-200 bg-white">
              {(() => {
                const docs = selectedUser.documents || [];
                const verifiedDocs = docs.filter((d) => d.verificationStatus === "VERIFIED");
                const allVerified = docs.length > 0 && docs.length === verifiedDocs.length;
                const isRejected = selectedUser.verificationStatus === "REJECTED";

                return (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="text-xs">
                      {isRejected ? (
                        <p className="text-red-700 font-bold flex items-center gap-1.5">
                          <Ban size={15} /> Account is rejected. Restore to pending if re-evaluating.
                        </p>
                      ) : docs.length === 0 ? (
                        <p className="text-red-600 font-semibold">
                          ⚠ User has not uploaded documents. Account cannot be verified.
                        </p>
                      ) : allVerified ? (
                        <p className="text-green-700 font-bold flex items-center gap-1.5">
                          <ShieldCheck size={16} />
                          All {docs.length} document(s) verified! Account can now be verified.
                        </p>
                      ) : (
                        <p className="text-amber-800 font-semibold flex items-center gap-1.5">
                          <AlertTriangle size={15} className="text-amber-600" />
                          {docs.length - verifiedDocs.length} of {docs.length} document(s) still pending or rejected.
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                      {isRejected ? (
                        <button
                          type="button"
                          onClick={() => restoreAccount(selectedUser.id)}
                          className="flex-1 sm:flex-none rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-slate-100 transition"
                        >
                          Restore to Pending
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => rejectAccount(selectedUser.id, selectedUser.name)}
                          className="flex-1 sm:flex-none rounded-xl border border-red-200 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition"
                        >
                          ✕ Reject Account
                        </button>
                      )}

                      {selectedUser.verified ? (
                        <>
                          <button
                            type="button"
                            onClick={() => resendVerificationEmail(selectedUser.id, selectedUser.email)}
                            className="flex-1 sm:flex-none rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100 transition cursor-pointer"
                          >
                            ✉️ Resend Verification Email
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              update(selectedUser.id, { verified: false });
                            }}
                            className="flex-1 sm:flex-none rounded-xl border border-amber-300 px-4 py-2 text-xs font-bold text-amber-800 hover:bg-amber-50 transition"
                          >
                            Revoke Verification
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          disabled={!allVerified}
                          onClick={() => {
                            update(selectedUser.id, { verified: true });
                          }}
                          className={`flex-1 sm:flex-none rounded-xl px-4 py-2 text-xs font-bold text-white shadow-sm transition ${
                            allVerified
                              ? "bg-green-700 hover:bg-green-800 cursor-pointer"
                              : "bg-gray-300 text-gray-500 cursor-not-allowed"
                          }`}
                        >
                          {allVerified ? "✓ Verify User Account" : "Verify Account (Locked)"}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setSelectedUser(null)}
                        className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-100 transition"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* DOCUMENT PREVIEW SUB-MODAL */}
      {previewDoc && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          onClick={() => setPreviewDoc(null)}
        >
          <div
            className="relative flex flex-col w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
              <div>
                <p className="font-bold text-gray-900 text-base">
                  {labels[previewDoc.documentType] || previewDoc.documentType}
                </p>
                <p className="text-xs text-slate-500">{previewDoc.originalName}</p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            {/* Viewer */}
            <div className="flex-1 overflow-auto p-4 bg-slate-900/5 flex items-center justify-center min-h-[400px]">
              {isPdf(previewDoc) ? (
                <iframe
                  src={previewDoc.cloudinaryUrl}
                  title={previewDoc.originalName}
                  className="w-full h-[65vh] rounded-xl border border-gray-200 bg-white shadow-sm"
                />
              ) : (
                <img
                  src={previewDoc.cloudinaryUrl}
                  alt={previewDoc.originalName}
                  className="max-h-[68vh] max-w-full object-contain rounded-xl shadow-md bg-white"
                />
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end px-6 py-3 border-t border-gray-100 bg-white">
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="rounded-xl bg-gray-100 px-4 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-200"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
