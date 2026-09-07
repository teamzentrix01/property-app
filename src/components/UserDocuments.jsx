"use client";

import { useEffect, useState } from "react";

const labels = { AADHAAR: "Aadhaar Card", PAN: "PAN Card", ADDRESS_PROOF: "Address Proof", ID_PROOF: "ID Proof", OTHER: "Other" };

export default function UserDocuments() {
  const [documents, setDocuments] = useState([]);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState("");
  const load = () => fetch("/api/documents").then((response) => response.json()).then((data) => setDocuments(data.documents || [])).catch(() => setError("Unable to load your documents."));
  useEffect(() => { load(); }, []);
  async function replaceDocument(event, documentType) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(documentType); setError("");
    const body = new FormData(); body.set("file", file); body.set("documentType", documentType);
    const response = await fetch("/api/documents/upload", { method: "POST", body });
    const data = await response.json();
    setUploading("");
    if (!response.ok) return setError(data.error || "Upload failed.");
    load();
  }
  return <section className="mb-12 rounded-2xl border border-ink/10 bg-white p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-display text-2xl">Verification documents</h2><p className="mt-1 text-sm text-ink-soft">Your account remains pending until all required documents are verified.</p></div></div>{error && <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}<div className="mt-4 space-y-3">{documents.map((document) => <div key={document.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink/10 p-4"><div><p className="font-semibold">{labels[document.documentType] || document.documentType}</p><p className="text-xs text-ink-soft">{document.originalName} · {document.verificationStatus}</p>{document.rejectionReason && <p className="mt-1 text-xs text-red-700">{document.rejectionReason}</p>}</div><div className="flex items-center gap-3"><a href={document.cloudinaryUrl} target="_blank" rel="noreferrer" className="text-xs font-semibold text-moss-deep underline">View</a>{document.verificationStatus === "REJECTED" && <label className="cursor-pointer rounded-full bg-ink px-3 py-2 text-xs font-semibold text-white">{uploading === document.documentType ? "Uploading..." : "Replace"}<input type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" className="hidden" onChange={(event) => replaceDocument(event, document.documentType)} disabled={Boolean(uploading)} /></label>}</div></div>)}</div></section>;
}