import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/serverAuth";
import { uploadUserDocument } from "@/lib/userDocuments";

export async function POST(request) {
  const auth = await requireUser();
  if (!auth.user) return NextResponse.json({ error: auth.error }, { status: auth.status });
  const body = await request.formData().catch(() => null);
  const file = body?.get("file");
  const documentType = String(body?.get("documentType") || "");
  if (!file || !documentType) return NextResponse.json({ error: "A file and document type are required." }, { status: 400 });
  try {
    const upload = await uploadUserDocument(file, auth.user.id, documentType);
    const document = await prisma.userDocument.create({ data: { ...upload, userId: auth.user.id, documentType } });
    await prisma.user.update({ where: { id: auth.user.id }, data: { verificationStatus: "PENDING", verified: false, verifiedAt: null } });
    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Document upload failed." }, { status: 400 });
  }
}