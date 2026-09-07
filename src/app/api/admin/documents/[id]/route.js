import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/serverAuth";

const documents = {
  aadhaar: { status: "aadhaarStatus", verifiedAt: "aadhaarVerifiedAt", verifiedBy: "aadhaarVerifiedBy", rejectionReason: "aadhaarRejectionReason", rejectedAt: "aadhaarRejectedAt", url: "aadhaarDocumentUrl" },
  pan: { status: "panStatus", verifiedAt: "panVerifiedAt", verifiedBy: "panVerifiedBy", rejectionReason: "panRejectionReason", rejectedAt: "panRejectedAt", url: "panDocumentUrl" },
  voterId: { status: "voterIdStatus", verifiedAt: "voterIdVerifiedAt", verifiedBy: "voterIdVerifiedBy", rejectionReason: "voterIdRejectionReason", rejectedAt: "voterIdRejectedAt", url: "voterIdDocumentUrl" },
};

export async function PATCH(req, { params }) {
  const auth = await requireAdmin();
  if (!auth.user) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const normalized = await prisma.userDocument.findUnique({ where: { id } });
  if (normalized) {
    if (!["VERIFIED", "REJECTED", "PENDING"].includes(body?.status)) return NextResponse.json({ error: "Invalid verification status" }, { status: 400 });
    const now = new Date();
    const rejectionReason = body.status === "REJECTED" ? String(body.reason || "Please upload a clearer copy of this document.").trim().slice(0, 500) : null;
    const updated = await prisma.$transaction(async (transaction) => {
      const document = await transaction.userDocument.update({ where: { id }, data: { verificationStatus: body.status, verifiedAt: body.status === "VERIFIED" ? now : null, verifiedBy: body.status === "VERIFIED" ? auth.user.id : null, rejectionReason } });
      const required = await transaction.userDocument.findMany({ where: { userId: document.userId, documentType: { in: ["AADHAAR", "PAN", "ADDRESS_PROOF"] } }, orderBy: { uploadedAt: "desc" }, select: { documentType: true, verificationStatus: true } });
      const latestByType = new Map();
      for (const item of required) latestByType.set(item.documentType, item.verificationStatus);
      const allVerified = ["AADHAAR", "PAN", "ADDRESS_PROOF"].every((type) => latestByType.get(type) === "VERIFIED");
      await transaction.user.update({ where: { id: document.userId }, data: allVerified ? { verificationStatus: "ACTIVE", verified: true, verifiedAt: now, rejectedAt: null, rejectionReason: null } : { verificationStatus: "PENDING", verified: false } });
      return document;
    });
    await prisma.adminAudit.create({ data: { adminId: auth.user.id, action: `ADMIN_DOCUMENT_${body.status}`, targetType: "USER_DOCUMENT", targetId: id, metadata: { reason: rejectionReason } } });
    return NextResponse.json({ document: updated });
  }
  const document = documents[body?.document];
  if (!document || !["VERIFIED", "REJECTED", "PENDING"].includes(body?.status)) return NextResponse.json({ error: "Invalid document or status" }, { status: 400 });
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user || !user[document.url]) return NextResponse.json({ error: "User or document not found" }, { status: 404 });
  const now = new Date();
  const reason = String(body.reason || "Document could not be verified.").slice(0, 500);
  const data = { [document.status]: body.status, [document.verifiedAt]: body.status === "VERIFIED" ? now : null, [document.verifiedBy]: body.status === "VERIFIED" ? auth.user.id : null, [document.rejectionReason]: body.status === "REJECTED" ? reason : null, [document.rejectedAt]: body.status === "REJECTED" ? now : null };
  if (body.status === "REJECTED") Object.assign(data, { verificationStatus: "REJECTED", rejectedAt: now, rejectionReason: reason });
  if (body.status === "VERIFIED") {
    const statuses = { aadhaarStatus: user.aadhaarStatus, panStatus: user.panStatus, voterIdStatus: user.voterIdStatus, [document.status]: "VERIFIED" };
    if (statuses.aadhaarStatus === "VERIFIED" && statuses.panStatus === "VERIFIED" && statuses.voterIdStatus === "VERIFIED") Object.assign(data, { verificationStatus: "ACTIVE", verifiedAt: now, rejectedAt: null, rejectionReason: null });
  }
  const updated = await prisma.user.update({ where: { id }, data, select: { id: true, verificationStatus: true, aadhaarStatus: true, panStatus: true, voterIdStatus: true } });
  await prisma.adminAudit.create({ data: { adminId: auth.user.id, action: `ADMIN_DOCUMENT_${body.status}`, targetType: "USER", targetId: id, metadata: { document: body.document, reason: body.reason || null } } });
  return NextResponse.json({ user: updated });
}

export async function GET(req, { params }) {
  const auth = await requireAdmin();
  if (!auth.user) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const { id } = await params;
  const document = await prisma.userDocument.findUnique({ where: { id }, include: { user: { select: { id: true, name: true, email: true } } } });
  if (!document) return NextResponse.json({ error: "Document not found" }, { status: 404 });
  return NextResponse.json({ document });
}
