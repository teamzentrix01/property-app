import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/serverAuth";
import { uploadUserDocument, validateDocument } from "@/lib/userDocuments";

export async function POST(request) {
  const auth = await requireUser();
  if (!auth.user) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const body = await request.formData().catch(() => null);
  const file = body?.get("file");
  const documentType = String(body?.get("documentType") || "").trim();
  if (!file) return NextResponse.json({ error: "Please select a document" }, { status: 400 });
  if (!documentType) return NextResponse.json({ error: "Please select a document type" }, { status: 400 });
  try {
    // Validate before any external request. The authenticated user ID is always
    // derived from the verified cookie, never accepted from the client.
    await validateDocument(file, documentType);
    const upload = await uploadUserDocument(file, auth.user.id, documentType);
    const document = await prisma.userDocument.create({ data: { ...upload, userId: auth.user.id, documentType } });
    await prisma.user.update({ where: { id: auth.user.id }, data: { verificationStatus: "PENDING", verified: false, verifiedAt: null } });
    return NextResponse.json({ success: true, message: "Document uploaded successfully", document }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    const validationErrors = [
      "Please select a document.",
      "Invalid document type.",
      "Only PDF, JPG, JPEG and PNG files are allowed.",
      "File size must be 5 MB or less.",
      "The uploaded file does not match its file type.",
    ];
    if (validationErrors.includes(message)) {
      return NextResponse.json({ error: message }, { status: 400 });
    }
    console.error("DOCUMENT UPLOAD API ERROR", { message });
    return NextResponse.json({ error: "Document upload failed. Please try again." }, { status: 502 });
  }
}
