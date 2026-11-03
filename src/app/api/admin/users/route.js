import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/serverAuth";
import { ROLES, text } from "@/lib/validation";
import { notifyEmail, sendAccountVerifiedEmail, sendAccountRejectedEmail } from "@/lib/mailer";
import { hashPassword } from "@/lib/auth";

const safeUser = {
  id: true,
  name: true,
  email: true,
  phone: true,
  passwordHash: true,
  role: true,
  adminArea: true,
  verified: true,
  verificationStatus: true,
  rejectionReason: true,
  rejectedAt: true,
  createdAt: true,
  documents: {
    select: {
      id: true,
      documentType: true,
      originalName: true,
      cloudinaryUrl: true,
      fileType: true,
      verificationStatus: true,
      rejectionReason: true,
      uploadedAt: true,
    },
    orderBy: { uploadedAt: "desc" },
  },
};

export async function GET(req) {
  try {
    const auth = await requireAdmin();
    if (!auth.user) return NextResponse.json({ error: auth.error }, { status: auth.status });
    const { searchParams } = new URL(req.url);
    // FIFO order: First registered user appears first (createdAt: "asc" by default)
    const order = searchParams.get("order") === "desc" ? "desc" : "asc";
    const users = await prisma.user.findMany({ select: safeUser, orderBy: { createdAt: order }, take: 500 });

    // Safely query plainPassword directly from database to avoid any Prisma Client cache conflicts
    let plainMap = new Map();
    try {
      const rawRows = await prisma.$queryRaw`SELECT id, "plainPassword" FROM "User"`;
      for (const row of rawRows) {
        if (row.id) plainMap.set(row.id, row.plainPassword);
      }
    } catch (e) {
      console.warn("Could not query plain passwords:", e.message);
    }

    const usersWithPlain = users.map((u) => ({
      ...u,
      plainPassword: plainMap.get(u.id) || null,
    }));

    return NextResponse.json({ users: usersWithPlain });
  } catch (error) {
    console.error("ADMIN USERS GET ERROR:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch users" }, { status: 500 });
  }
}

export async function PATCH(req) {
  const auth = await requireAdmin();
  if (!auth.user) return NextResponse.json({ error: auth.error }, { status: auth.status });
  if (auth.user.role !== "SUPER_ADMIN") return NextResponse.json({ error: "Super-admin access required" }, { status: 403 });
  const body = await req.json().catch(() => null);
  if (!body?.userId || typeof body.userId !== "string") return NextResponse.json({ error: "userId is required" }, { status: 400 });
  const target = await prisma.user.findUnique({ where: { id: body.userId } });
  if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (target.id === auth.user.id && body.role && body.role !== "SUPER_ADMIN") return NextResponse.json({ error: "You cannot remove your own super-admin access" }, { status: 400 });
  if (body.role && !ROLES.includes(body.role)) return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  if (body.role === "AREA_ADMIN" && !text(body.adminArea ?? target.adminArea, { min: 2, max: 80, required: true })) return NextResponse.json({ error: "Area admins require an assigned city" }, { status: 400 });
  if (body.verified !== undefined && typeof body.verified !== "boolean") return NextResponse.json({ error: "verified must be a boolean" }, { status: 400 });
  const data = {};
  if (body.role) data.role = body.role;
  if (body.adminArea !== undefined) data.adminArea = body.role === "AREA_ADMIN" || target.role === "AREA_ADMIN" ? text(body.adminArea, { min: 2, max: 80 }) : null;
  let requestedPlainPassword = null;
  if (body.plainPassword && typeof body.plainPassword === "string" && body.plainPassword.trim().length >= 6) {
    const pwd = body.plainPassword.trim();
    requestedPlainPassword = pwd;
    data.passwordHash = await hashPassword(pwd);
  }
  
  if (body.action === "RESEND_VERIFICATION_EMAIL") {
    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";
    const emailResult = await notifyEmail({
      to: target.email,
      subject: "🎉 Your Bhoomi Account is Verified by Admin - Start Posting Properties!",
      heading: "Account Verified Successfully!",
      message: `Hello ${target.name || "User"},\n\nGreat news! Your account and identity documents have been reviewed and approved by the administrator. Your Bhoomi account is ACTIVE and verified.\n\nYou are now fully eligible to post and manage property listings on Bhoomi for FREE.\n\nClick the button below to start posting your properties:`,
      action: {
        label: "Post Property Now",
        url: `${origin}/post-property`,
      },
    });
    return NextResponse.json({
      ok: Boolean(emailResult?.ok),
      emailSent: Boolean(emailResult?.ok),
      error: emailResult?.ok ? undefined : emailResult?.error,
      message: emailResult?.ok
        ? `Verification email sent successfully to ${target.email}`
        : `Email delivery failed: ${emailResult?.error || "Unknown error"}`,
    });
  }

  if (body.action === "REJECT" || body.verificationStatus === "REJECTED") {
    const reason = typeof body.rejectionReason === "string" && body.rejectionReason.trim()
      ? body.rejectionReason.trim().slice(0, 500)
      : "Account rejected by administrator.";
    data.verificationStatus = "REJECTED";
    data.verified = false;
    data.verifiedAt = null;
    data.rejectedAt = new Date();
    data.rejectionReason = reason;
  } else if (body.action === "RESTORE" || body.action === "RESET_PENDING" || (body.verificationStatus === "PENDING" && target.verificationStatus === "REJECTED")) {
    data.verificationStatus = "PENDING";
    data.verified = false;
    data.verifiedAt = null;
    data.rejectedAt = null;
    data.rejectionReason = null;
  }

  if (body.verified !== undefined) {
    if (body.verified === true) {
      const userDocs = await prisma.userDocument.findMany({
        where: { userId: target.id },
        select: { id: true, documentType: true, verificationStatus: true },
      });
      if (!userDocs.length) {
        return NextResponse.json(
          { error: "Cannot verify user: No verification documents have been uploaded by this user." },
          { status: 400 }
        );
      }
      const unverified = userDocs.filter((d) => d.verificationStatus !== "VERIFIED");
      if (unverified.length > 0) {
        return NextResponse.json(
          {
            error: `Cannot verify user: ${unverified.length} document(s) are not verified yet. Please review and verify all documents first.`,
          },
          { status: 400 }
        );
      }
      data.verified = true;
      data.verificationStatus = "ACTIVE";
      data.verifiedAt = new Date();
      data.rejectedAt = null;
      data.rejectionReason = null;
    } else {
      data.verified = false;
      data.verifiedAt = null;
      if (target.verificationStatus !== "REJECTED" && !data.verificationStatus) {
        data.verificationStatus = "PENDING";
      }
    }
  }
  if (!Object.keys(data).length && !requestedPlainPassword) return NextResponse.json({ error: "No changes supplied" }, { status: 400 });
  const user = Object.keys(data).length
    ? await prisma.user.update({ where: { id: target.id }, data: { ...data }, select: safeUser })
    : await prisma.user.findUnique({ where: { id: target.id }, select: safeUser });

  if (requestedPlainPassword) {
    try {
      await prisma.$executeRaw`UPDATE "User" SET "plainPassword" = ${requestedPlainPassword} WHERE id = ${target.id}`;
    } catch (e) {
      console.warn("Could not set plainPassword:", e.message);
    }
  }

  await prisma.adminAudit.create({ data: { adminId: auth.user.id, action: data.verificationStatus === "REJECTED" ? "USER_REJECTED" : "USER_UPDATED", targetType: "USER", targetId: target.id, metadata: { changedFields: Object.keys(data), previousRole: target.role, nextRole: user.role, verified: user.verified, verificationStatus: user.verificationStatus, rejectionReason: data.rejectionReason || null } } });

  // Send email to user's Gmail on Account Verification or Rejection
  let emailSent = false;
  const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (data.verificationStatus === "ACTIVE" || body.verified === true) {
    const emailResult = await sendAccountVerifiedEmail({
      user: { ...target, ...data },
      origin,
    }).catch((err) => ({ ok: false, error: err?.message }));
    emailSent = Boolean(emailResult?.ok);
  } else if (data.verificationStatus === "REJECTED") {
    const emailResult = await sendAccountRejectedEmail({
      user: { ...target, ...data },
      reason: data.rejectionReason,
      origin,
    }).catch((err) => ({ ok: false, error: err?.message }));
    emailSent = Boolean(emailResult?.ok);
  }

  let finalPlain = requestedPlainPassword;
  if (!finalPlain) {
    try {
      const rawUser = await prisma.$queryRaw`SELECT "plainPassword" FROM "User" WHERE id = ${target.id} LIMIT 1`;
      if (rawUser?.[0]) finalPlain = rawUser[0].plainPassword;
    } catch {}
  }

  return NextResponse.json({ user: { ...user, plainPassword: finalPlain }, emailSent });
}
