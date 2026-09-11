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

  return (
    <section className="mb-12 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="font-display text-2xl font-bold text-gray-900">Verification Documents</h2>
        <p className="mt-1 text-xs text-gray-500">PDF, JPG, JPEG, or PNG up to 5 MB. Documents are kept confidential and securely verified.</p>
      </div>
      {error && <p className="mt-3 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-700 border border-red-200">{error}</p>}
      {success && <p className="mt-3 rounded-xl bg-green-50 p-3 text-xs font-semibold text-green-800 border border-green-200">{success}</p>}
      <form onSubmit={upload} className="mt-5 grid gap-3 rounded-xl border border-gray-200 bg-slate-50 p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <label className="text-xs font-bold uppercase tracking-wider text-gray-600">
          Document type
          <select value={documentType} onChange={(event) => setDocumentType(event.target.value)} disabled={uploading} className="mt-1.5 block w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100">
            <option value="AADHAAR">Aadhaar Card</option>
            <option value="PAN">PAN Card</option>
            <option value="ADDRESS_PROOF">Address Proof</option>
            <option value="ID_PROOF">ID Proof</option>
            <option value="OTHER">Other</option>
          </select>
        </label>
        <label className="text-xs font-bold uppercase tracking-wider text-gray-600">
          Choose document
          <input type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" onChange={selectFile} disabled={uploading} className="mt-1.5 block w-full text-xs text-gray-600 file:mr-2 file:rounded-lg file:border-0 file:bg-green-100 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-green-800" />
        </label>
        <button type="submit" disabled={uploading || !selectedFile} className="rounded-xl bg-green-700 hover:bg-green-800 px-5 py-2 text-sm font-bold text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50">
          {uploading ? "Uploading..." : "Upload Document"}
        </button>
      </form>
      {selectedFile && <p className="mt-2 text-xs font-medium text-green-700">Selected: {selectedFile.name}</p>}
      <div className="mt-5 space-y-3">
        {documents.map((document) => (
          <div key={document.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div>
              <p className="font-bold text-gray-900">{labels[document.documentType] || document.documentType}</p>
              <p className="text-xs text-gray-500">{document.originalName} · {new Date(document.uploadedAt).toLocaleDateString("en-IN")} · <span className="font-semibold text-green-800">{document.verificationStatus}</span></p>
              {document.rejectionReason && <p className="mt-1 text-xs text-red-700">Reason: {document.rejectionReason}</p>}
            </div>
            <a href={document.cloudinaryUrl} target="_blank" rel="noreferrer" className="text-xs font-bold text-green-700 hover:text-green-800 hover:underline">
              View / Open →
            </a>
          </div>
        ))}
        {!documents.length && <p className="py-4 text-center text-sm text-gray-400">No documents uploaded yet.</p>}
      </div>
    </section>
  );
}
