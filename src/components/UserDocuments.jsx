"use client";

import { useEffect, useState } from "react";
import { X, FileText, Image as ImageIcon } from "lucide-react";

const MAX_SIZE = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ["application/pdf", "image/jpeg", "image/png"];
const labels = { AADHAAR: "Aadhaar Card", PAN: "PAN Card", ADDRESS_PROOF: "Address Proof", ID_PROOF: "ID Proof", OTHER: "Other" };

const isPdf = (doc) => {
  if (!doc) return false;
  const name = (doc.originalName || "").toLowerCase();
  const url = (doc.cloudinaryUrl || "").toLowerCase();
  const type = (doc.fileType || "").toLowerCase();
  return type.includes("pdf") || name.endsWith(".pdf") || url.endsWith(".pdf");
};

export default function UserDocuments() {
  const [documents, setDocuments] = useState([]);
  const [documentType, setDocumentType] = useState("AADHAAR");
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploading, setUploading] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);

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
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setPreviewDoc(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      clearTimeout(loadTimer);
      window.removeEventListener("keydown", handleKeyDown);
    };
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
            <button
              type="button"
              onClick={() => setPreviewDoc(document)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-green-200 bg-green-50 px-3.5 py-1.5 text-xs font-bold text-green-800 transition hover:bg-green-700 hover:text-white"
            >
              View / Open →
            </button>
          </div>
        ))}
        {!documents.length && <p className="py-4 text-center text-sm text-gray-400">No documents uploaded yet.</p>}
      </div>

      {/* Document Preview Pop-up Modal */}
      {previewDoc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          onClick={() => setPreviewDoc(null)}
        >
          <div
            className="relative flex flex-col w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 sm:px-6 sm:py-4 border-b border-gray-200 bg-white">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-700">
                  {isPdf(previewDoc) ? <FileText size={20} /> : <ImageIcon size={20} />}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900 text-sm sm:text-base truncate">
                      {labels[previewDoc.documentType] || previewDoc.documentType}
                    </h3>
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      previewDoc.verificationStatus === "VERIFIED"
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : previewDoc.verificationStatus === "REJECTED"
                        ? "bg-red-50 text-red-700 border border-red-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}>
                      {previewDoc.verificationStatus}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 truncate max-w-xs sm:max-w-md">
                    {previewDoc.originalName} · Uploaded on {new Date(previewDoc.uploadedAt).toLocaleDateString("en-IN")}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition"
                aria-label="Close popup"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body / Viewer */}
            <div className="flex-1 overflow-auto p-4 sm:p-6 bg-slate-900/5 flex items-center justify-center min-h-[350px]">
              {isPdf(previewDoc) ? (
                <iframe
                  src={previewDoc.cloudinaryUrl}
                  title={previewDoc.originalName}
                  className="w-full h-[65vh] rounded-xl border border-gray-200 bg-white shadow-sm"
                />
              ) : (
                <div className="relative max-h-[68vh] flex items-center justify-center">
                  <img
                    src={previewDoc.cloudinaryUrl}
                    alt={previewDoc.originalName}
                    className="max-h-[68vh] max-w-full object-contain rounded-xl shadow-md bg-white"
                  />
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-white text-xs text-gray-500">
              <span className="hidden sm:inline">Press <kbd className="px-1.5 py-0.5 rounded bg-gray-100 border text-[11px] font-mono">Esc</kbd> or click outside to close</span>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="ml-auto rounded-xl bg-gray-100 px-4 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-200 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
