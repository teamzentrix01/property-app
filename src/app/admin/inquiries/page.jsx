"use client";

import { useEffect, useState } from "react";
import { Search, ChevronLeft, ChevronRight, Landmark, Mail, Building, Eye, Sparkles } from "lucide-react";

export default function AdminInquiriesPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedInquiry, setSelectedInquiry] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const params = new URLSearchParams({ page: String(page) });
    if (debouncedQuery) params.set("search", debouncedQuery);
    fetch(`/api/admin/inquiries?${params}`)
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error);
        setData(result);
      })
      .catch((reason) => setError(reason.message));
  }, [page, debouncedQuery]);

  if (error) return <p className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm font-semibold text-red-700">{error}</p>;
  if (!data) return <p className="text-sm font-medium text-gray-500">Loading inquiries...</p>;

  const getInquiryTypeBadge = (message) => {
    if (message?.startsWith("[LOAN INQUIRY]")) {
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200/60">
          <Landmark size={11} /> Home Loan
        </span>
      );
    }
    if (message?.startsWith("[NIA CHATBOT INQUIRY]")) {
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-800 border border-rose-200/60">
          <Sparkles size={11} /> Nia AI Assistant
        </span>
      );
    }
    if (message?.startsWith("[CONTACT FORM]")) {
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-sky-50 px-2 py-0.5 text-[10px] font-bold text-sky-800 border border-sky-200/60">
          <Mail size={11} /> Contact Us
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-800 border border-purple-200/60">
        <Building size={11} /> Property
      </span>
    );
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl font-extrabold text-gray-950">Inquiries</h2>
          <p className="mt-1 text-sm text-gray-500">
            All inquiries (Property, Home Loans, Contact Us) submitted across Bhoomi.{" "}
            <span className="font-semibold text-gray-700">{data.total} total</span>
          </p>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search sender, loan, property..."
            className="rounded-xl border border-gray-200 bg-white pl-8 pr-4 py-2.5 text-sm text-gray-800 outline-none shadow-sm transition focus:border-[#c41920] focus:ring-2 focus:ring-[#c41920]/10"
          />
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full min-w-[850px] text-left text-sm">
          <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-gray-500 border-b border-gray-200">
            <tr>
              <th className="p-4">Type</th>
              <th className="p-4">Sender / Lead</th>
              <th className="p-4">Subject / Property</th>
              <th className="p-4">Inquiry Details</th>
              <th className="p-4 whitespace-nowrap">Date</th>
              <th className="p-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {data.inquiries.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-10 text-center text-sm text-gray-400">
                  No inquiries found.
                </td>
              </tr>
            ) : (
              data.inquiries.map((inq) => {
                const location = [inq.listing?.area, inq.listing?.city].filter(Boolean).join(", ");
                const cleanMsg = inq.message?.replace(/^\[(LOAN INQUIRY|CONTACT FORM)\]\n?/, "") || "";
                const shortMsg = cleanMsg.length > 70 ? cleanMsg.slice(0, 70) + "…" : cleanMsg;

                // Extract lead details if in structured format
                let displayPhone = inq.sender?.phone;
                let displayEmail = inq.sender?.email;
                let displayName = inq.sender?.name;

                const phoneMatch = inq.message?.match(/Phone:\s*([^\n]+)/);
                if (phoneMatch && phoneMatch[1] && phoneMatch[1] !== "Not provided") displayPhone = phoneMatch[1];
                const emailMatch = inq.message?.match(/(?:Email|From):\s*([^\n]+@[^\n]+)/);
                if (emailMatch) displayEmail = emailMatch[1];
                const nameMatch = inq.message?.match(/(?:Applicant|From):\s*([^\n]+)/);
                if (nameMatch) displayName = nameMatch[1];

                return (
                  <tr key={inq.id} className="border-t border-gray-100 hover:bg-slate-50/60 transition align-top">
                    <td className="p-4 whitespace-nowrap">
                      {getInquiryTypeBadge(inq.message)}
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-gray-900">{displayName || "Visitor"}</p>
                      {displayEmail && <p className="text-xs text-gray-500">{displayEmail}</p>}
                      {displayPhone && (
                        <p className="text-xs text-emerald-700 font-medium mt-0.5">+91 {displayPhone}</p>
                      )}
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-gray-900 line-clamp-1">{inq.listing?.title || "Direct Website Form"}</p>
                      {location && <p className="text-xs text-gray-500">{location}</p>}
                    </td>
                    <td className="p-4 max-w-[280px]">
                      <p
                        className="text-gray-700 text-xs leading-relaxed whitespace-pre-line line-clamp-2"
                        title={inq.message}
                      >
                        {shortMsg}
                      </p>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <p className="text-xs text-gray-700 font-medium">
                        {new Date(inq.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                      <p className="text-[11px] text-gray-400">
                        {new Date(inq.createdAt).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        type="button"
                        onClick={() => setSelectedInquiry(inq)}
                        className="rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-semibold text-gray-700 hover:border-[#c41920] hover:text-[#c41920] transition inline-flex items-center gap-1 shadow-2xs"
                      >
                        <Eye size={12} /> View
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        {!data.inquiries.length && query && (
          <p className="p-6 text-center text-sm text-gray-400">No results for "{query}".</p>
        )}
      </div>

      {/* Pagination */}
      {data.totalPages > 1 && (
        <div className="mt-5 flex items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            Page {data.page} of {data.totalPages} &middot; {data.total} inquiries
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={14} /> Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
              disabled={page >= data.totalPages}
              className="inline-flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Full Inquiry Details Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-2">
                {getInquiryTypeBadge(selectedInquiry.message)}
                <h3 className="font-display text-lg font-bold text-gray-900">Inquiry Details</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedInquiry(null)}
                className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
              >
                ✕
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div className="grid grid-cols-2 gap-3 rounded-2xl bg-slate-50 p-4 text-xs">
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Property Reference</span>
                  <span className="font-semibold text-gray-900 block truncate">{selectedInquiry.listing?.title || "Direct Website Lead"}</span>
                  <span className="text-gray-500 text-[11px]">{[selectedInquiry.listing?.area, selectedInquiry.listing?.city].filter(Boolean).join(", ")}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Received At</span>
                  <span className="font-semibold text-gray-900 block">{new Date(selectedInquiry.createdAt).toLocaleString("en-IN")}</span>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold uppercase text-gray-500 tracking-wider">Full Message / Application Details:</span>
                <div className="mt-2 rounded-2xl border border-gray-200 bg-white p-4 text-xs font-mono text-gray-800 leading-relaxed whitespace-pre-wrap max-h-[300px] overflow-y-auto">
                  {selectedInquiry.message}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedInquiry(null)}
                className="rounded-xl bg-gray-900 px-5 py-2 text-xs font-bold text-white hover:bg-gray-800 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
