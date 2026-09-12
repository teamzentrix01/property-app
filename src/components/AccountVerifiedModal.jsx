"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Plus,
  Mail,
  ArrowRight,
  Building2,
} from "lucide-react";

export default function AccountVerifiedModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const pathname = usePathname();
  const router = useRouter();

  const checkVerificationStatus = () => {
    // Do not show on admin pages or login/signup
    if (
      pathname.startsWith("/admin") ||
      pathname === "/login" ||
      pathname === "/signup"
    ) {
      return;
    }

    fetch("/api/auth/me", { credentials: "include", cache: "no-store" })
      .then((res) => (res.ok ? res.json() : { user: null }))
      .then((data) => {
        const currentUser = data?.user;
        if (!currentUser) return;

        setUser(currentUser);

        const isVerified =
          currentUser.verificationStatus === "ACTIVE" ||
          currentUser.verified === true ||
          ["AREA_ADMIN", "SUPER_ADMIN"].includes(currentUser.role);

        if (isVerified) {
          try {
            const alreadySeen = localStorage.getItem(
              `bhoomi_verified_popup_seen_${currentUser.id}`
            );
            if (!alreadySeen) {
              // Show popup after brief delay for smooth appearance
              const timer = setTimeout(() => setIsOpen(true), 800);
              return () => clearTimeout(timer);
            }
          } catch {
            // ignore localStorage error
          }
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    checkVerificationStatus();

    const handleAuthChange = () => checkVerificationStatus();
    const handleManualShow = () => setIsOpen(true);

    window.addEventListener("bhoomi-auth-changed", handleAuthChange);
    window.addEventListener("bhoomi-show-verified-popup", handleManualShow);

    return () => {
      window.removeEventListener("bhoomi-auth-changed", handleAuthChange);
      window.removeEventListener("bhoomi-show-verified-popup", handleManualShow);
    };
  }, [pathname]);

  // Handle Close & Remember dismissal
  const handleClose = () => {
    setIsOpen(false);
    if (user?.id) {
      try {
        localStorage.setItem(`bhoomi_verified_popup_seen_${user.id}`, "true");
      } catch {}
    }
  };

  const handlePostProperty = () => {
    handleClose();
    router.push("/post-property");
  };

  if (!isOpen || !user) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="verified-modal-title"
    >
      {/* Backdrop with soft blur */}
      <div
        onClick={handleClose}
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-300"
      />

      {/* Modal Dialog Card - Compressed & Sleek */}
      <div className="relative w-full max-w-[420px] overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-2xl transition-all duration-200 animate-in zoom-in-95">
        {/* Top Header */}
        <div className="relative bg-gradient-to-br from-emerald-700 via-teal-800 to-emerald-900 px-5 py-4 text-center text-white">
          {/* Close Button */}
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close modal"
            className="absolute right-3.5 top-3.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/20 text-white/90 transition hover:bg-black/40 hover:text-white cursor-pointer"
          >
            <X size={14} />
          </button>

          {/* Shield Check Icon */}
          <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur-md text-emerald-300 shadow-inner border border-white/20">
            <ShieldCheck size={24} className="text-emerald-300" />
          </div>

          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/30 border border-emerald-400/40 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-100 mb-1">
            <CheckCircle2 size={11} />
            Verification Completed
          </span>

          <h2
            id="verified-modal-title"
            className="font-display text-lg sm:text-xl font-bold tracking-tight text-white"
          >
            Account Verified by Admin!
          </h2>

          <p className="mt-0.5 text-[11px] text-emerald-100/90 leading-normal max-w-xs mx-auto">
            Congratulations, <span className="font-bold text-white">{user.name || "Member"}</span>! Your documents are approved.
          </p>
        </div>

        {/* Modal Body Content */}
        <div className="p-4 sm:p-5 space-y-2.5">
          {/* Main Action Banner */}
          <div className="rounded-xl bg-emerald-50 border border-emerald-200/90 p-3 text-left">
            <div className="flex items-start gap-2.5">
              <div className="rounded-lg bg-emerald-600 p-1.5 text-white shrink-0 shadow-xs mt-0.5">
                <Building2 size={16} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-emerald-950">
                  You Are Now Able to Post Property!
                </h3>
                <p className="mt-0.5 text-[11px] text-emerald-900/80 leading-relaxed">
                  Your Bhoomi account is <span className="font-bold text-emerald-800">ACTIVE & VERIFIED</span>. You can now list residential, commercial, or rental properties for free.
                </p>
              </div>
            </div>
          </div>

          {/* Gmail / Email Notification Reminder */}
          <div className="flex items-center gap-2.5 rounded-xl bg-slate-50 border border-slate-200/80 px-3 py-2 text-xs text-slate-700">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-100 text-red-600 shrink-0">
              <Mail size={14} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold text-slate-800 leading-tight">
                Confirmation sent to your Gmail
              </p>
              <p className="text-[10px] text-slate-500 truncate">
                Sent to <span className="font-medium text-slate-700">{user.email}</span>
              </p>
            </div>
          </div>

          {/* Key Unlocked Privileges */}
          <div className="grid grid-cols-2 gap-2 pt-0.5">
            <div className="rounded-lg bg-slate-50 border border-slate-100 py-1.5 px-2 text-center">
              <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">
                Listing Status
              </span>
              <span className="font-bold text-[11px] text-emerald-700">
                ✓ Free Postings Active
              </span>
            </div>
            <div className="rounded-lg bg-slate-50 border border-slate-100 py-1.5 px-2 text-center">
              <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">
                Profile Trust
              </span>
              <span className="font-bold text-[11px] text-blue-700">
                🛡️ Verified Seller
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-1.5 flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={handlePostProperty}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#c41920] to-[#8e1016] px-4 py-2.5 text-xs font-bold text-white shadow-sm shadow-[#c41920]/25 transition hover:from-[#8e1016] hover:to-[#c41920] active:scale-95 cursor-pointer"
            >
              <Plus size={14} />
              <span>Post Property Now</span>
              <ArrowRight size={13} />
            </button>

            <Link
              href="/dashboard"
              onClick={handleClose}
              className="flex items-center justify-center rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
            >
              Dashboard
            </Link>
          </div>

          <div className="text-center pt-0.5">
            <button
              type="button"
              onClick={handleClose}
              className="text-[10px] font-semibold text-slate-400 hover:text-slate-600 transition cursor-pointer"
            >
              Dismiss / Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
