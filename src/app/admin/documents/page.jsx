"use client";

import { useEffect, useState } from "react";

const labels = { AADHAAR: "Aadhaar Card", PAN: "PAN Card", ADDRESS_PROOF: "Address Proof", ID_PROOF: "ID Proof", OTHER: "Other" };

export default function DocumentsPage() {
  const [documents, setDocuments] = useState(null);
  const [error, setError] = useState("");
  const load = () => fetch("/api/admin/documents").then(async (response) => { const data = await response.json(); if (!response.ok) throw new Error(data.error); const userId = new URLSearchParams(window.location.search).get("userId"); setDocuments(userId ? data.documents.filter((document) => document.user.id === userId) : data.documents); }).catch((reason) => setError(reason.message));
  useEffect(() => { load(); }, []);
  async function update(id, status) {
    const reason = status === "REJECTED" ? window.prompt("Please enter a rejection reason:", "Please upload a clearer copy of this document.") : undefined;
    if (status === "REJECTED" && !reason?.trim()) return;
    const response = await fetch(`/api/admin/documents/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status, reason }) });
    const data = await response.json();
    if (!response.ok) return setError(data.error);
    load();
  }
  if (error) return <p className="rounded-xl bg-red-50 p-4 text-red-700">{error}</p>;
  if (!documents) return <p className="text-sm text-slate-500">Loading documents...</p>;
  return <div><h2 className="mb-2 font-display text-3xl text-gray-950">User Documents</h2><p className="mb-6 text-sm text-slate-500">Review pending and rejected documents uploaded by users.</p><section className="overflow-x-auto rounded-2xl border border-gray-100 bg-white"><table className="w-full min-w-[980px] text-left text-sm"><thead className="bg-gray-50 text-xs uppercase text-slate-500"><tr><th className="p-4">User</th><th className="p-4">Document</th><th className="p-4">Uploaded</th><th className="p-4">Status</th><th className="p-4">Actions</th></tr></thead><tbody>{documents.map((document) => <tr key={document.id} className="border-t border-slate-100"><td className="p-4"><strong>{document.user.name}</strong><br /><span className="text-xs text-slate-500">{document.user.email} · {document.user.phone}</span></td><td className="p-4">{labels[document.documentType] || document.documentType}<br /><span className="text-xs text-slate-500">{document.originalName}</span></td><td className="p-4 text-slate-500">{new Date(document.uploadedAt).toLocaleString("en-IN")}</td><td className="p-4 font-semibold">{document.verificationStatus}</td><td className="p-4"><div className="flex flex-wrap gap-2"><a href={document.cloudinaryUrl} target="_blank" rel="noreferrer" className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold">View</a><button onClick={() => update(document.id, "VERIFIED")} className="rounded-lg bg-green-700 px-3 py-2 text-xs font-semibold text-white">Verify</button><button onClick={() => update(document.id, "REJECTED")} className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white">Reject</button></div></td></tr>)}</tbody></table>{!documents.length && <p className="p-10 text-center text-sm text-slate-500">No documents waiting for review.</p>}</section></div>;
}
