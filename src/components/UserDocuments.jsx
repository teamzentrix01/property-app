"use client";

import { useEffect, useState } from "react";

const MAX_SIZE = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ["application/pdf", "image/jpeg", "image/png"];
const labels = { AADHAAR: "Aadhaar Card", PAN: "PAN Card", ADDRESS_PROOF: "Address Proof", ID_PROOF: "ID Proof", OTHER: "Other" };

export default function UserDocuments() {
  const [documents, setDocuments] = useState([]);
  const [documentType, setDocumentType] = useState("AADHAAR");
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploading, setUploading] = useState(false);

  async function load() {
    try {
      const response = await fetch("/api/documents", { credentials: "include", cache: "no-store" });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Unable to load your documents.");
      setDocuments(data.documents || []);
    } catch (loadError) {
      setError(loadError.message || "Unable to load your documents.");
    }
  }

  useEffect(() => {
    const loadTimer = setTimeout(() => { load(); }, 0);
    return () => clearTimeout(loadTimer);
  }, []);

  function selectFile(event) {
    const file = event.target.files?.[0] || null;
    setError("");
    setSuccess("");
    if (!file) return setSelectedFile(null);
    if (!ACCEPTED_TYPES.includes(file.type)) {
      event.target.value = "";
      return setError("File type is not supported. Use PDF, JPG, JPEG, or PNG.");
    }
    if (file.size > MAX_SIZE) {
      event.target.value = "";
      return setError("File size is too large. Maximum size is 5 MB.");
    }
    setSelectedFile(file);
  }

  async function upload(event) {
    event.preventDefault();
    if (!selectedFile || uploading) {
      if (!selectedFile) setError("Please select a document");
      return;
    }
    setUploading(true);
    setError("");
    setSuccess("");
    try {
      const body = new FormData();
      body.set("file", selectedFile);
      body.set("documentType", documentType);
      const response = await fetch("/api/documents/upload", { method: "POST", credentials: "include", body });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Document upload failed. Please try again.");
      setSuccess(data.message || "Document uploaded successfully");
      setSelectedFile(null);
      event.currentTarget.reset();
      await load();
    } catch (uploadError) {
      setError(uploadError.message || "Document upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return <section className="mb-12 rounded-2xl border border-ink/10 bg-white p-5">
    <div>
      <h2 className="font-display text-2xl">Verification documents</h2>
      <p className="mt-1 text-sm text-ink-soft">PDF, JPG, JPEG, or PNG up to 5 MB. Your account remains pending until documents are verified.</p>
    </div>
    {error && <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {success && <p className="mt-3 rounded-lg bg-green-50 p-3 text-sm text-green-800">{success}</p>}
    <form onSubmit={upload} className="mt-4 grid gap-3 rounded-xl border border-ink/10 p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
      <label className="text-sm font-medium">Document type<select value={documentType} onChange={(event) => setDocumentType(event.target.value)} disabled={uploading} className="mt-1 block w-full rounded-lg border border-ink/20 bg-white px-3 py-2"><option value="AADHAAR">Aadhaar Card</option><option value="PAN">PAN Card</option><option value="ADDRESS_PROOF">Address Proof</option><option value="ID_PROOF">ID Proof</option><option value="OTHER">Other</option></select></label>
      <label className="text-sm font-medium">Choose document<input type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" onChange={selectFile} disabled={uploading} className="mt-1 block w-full text-sm" /></label>
      <button type="submit" disabled={uploading || !selectedFile} className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">{uploading ? "Uploading..." : "Upload document"}</button>
    </form>
    {selectedFile && <p className="mt-2 text-xs text-ink-soft">Selected: {selectedFile.name}</p>}
    <div className="mt-4 space-y-3">{documents.map((document) => <div key={document.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink/10 p-4"><div><p className="font-semibold">{labels[document.documentType] || document.documentType}</p><p className="text-xs text-ink-soft">{document.originalName} · {new Date(document.uploadedAt).toLocaleDateString("en-IN")} · {document.verificationStatus}</p>{document.rejectionReason && <p className="mt-1 text-xs text-red-700">{document.rejectionReason}</p>}</div><a href={document.cloudinaryUrl} target="_blank" rel="noreferrer" className="text-xs font-semibold text-moss-deep underline">View / Open</a></div>)}{!documents.length && <p className="py-4 text-sm text-ink-soft">No documents uploaded yet.</p>}</div>
  </section>;
}
