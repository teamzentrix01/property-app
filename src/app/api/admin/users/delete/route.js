import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/serverAuth";
import { sendAccountDeletedEmail } from "@/lib/mailer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET: fetch all deleted users (admin archive) with enriched admin & re-registered user details
export async function GET(req) {
  const auth = await requireAdmin();
  if (!auth.user) return NextResponse.json({ error: auth.error }, { status: auth.status });

  try {
    const deletedUsers = await prisma.deletedUser.findMany({
      orderBy: { deletedAt: "desc" },
      take: 200,
    });

    // Enrich with admin info
    const adminIds = [...new Set(deletedUsers.map((u) => u.deletedBy).filter(Boolean))];
    const reRegIds = [...new Set(deletedUsers.map((u) => u.reRegisteredUserId).filter(Boolean))];

    const [admins, reRegisteredUsers] = await Promise.all([
      adminIds.length > 0
        ? prisma.user.findMany({
            where: { id: { in: adminIds } },
            select: { id: true, name: true, email: true },
          })
        : [],
      reRegIds.length > 0
        ? prisma.user.findMany({
            where: { id: { in: reRegIds } },
            select: { id: true, name: true, email: true, verificationStatus: true, createdAt: true },
          })
        : [],
    ]);

    const adminMap = Object.fromEntries(admins.map((a) => [a.id, a]));
    const reRegMap = Object.fromEntries(reRegisteredUsers.map((u) => [u.id, u]));

    const enriched = deletedUsers.map((u) => ({
      ...u,
      deletedByAdmin: adminMap[u.deletedBy] || null,
      currentAccount: u.reRegisteredUserId ? (reRegMap[u.reRegisteredUserId] || null) : null,
    }));

    return NextResponse.json({ deletedUsers: enriched, total: enriched.length });
  } catch (err) {
    console.error("GET DELETED USERS ERROR:", err);
    return NextResponse.json({ error: "Failed to fetch deleted accounts" }, { status: 500 });
  }
}

// DELETE: soft-delete a user — saves their data to DeletedUser, then deletes the real account
export async function DELETE(req) {
  const auth = await requireAdmin();
  if (!auth.user) return NextResponse.json({ error: auth.error }, { status: auth.status });
  if (auth.user.role !== "SUPER_ADMIN" && auth.user.role !== "AREA_ADMIN") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const userId = typeof body?.userId === "string" ? body.userId.trim() : "";
  const note = typeof body?.note === "string" ? body.note.trim().slice(0, 500) : null;

  if (!userId) return NextResponse.json({ error: "userId is required" }, { status: 400 });

  // Prevent self-deletion
  if (userId === auth.user.id) {
    return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 });
  }

  // Find the real user with password hash
  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      passwordHash: true,
      plainPassword: true,
      role: true,
      verificationStatus: true,
    },
  });

  if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // 1. Upsert into DeletedUser archive (preserves all user details + password hash + plain password)
  await prisma.deletedUser.upsert({
    where: { originalUserId: target.id },
    update: {
      name: target.name,
      email: target.email,
      phone: target.phone,
      passwordHash: target.passwordHash,
      plainPassword: target.plainPassword,
      role: target.role,
      verificationStatus: target.verificationStatus,
      deletedAt: new Date(),
      deletedBy: auth.user.id,
      note: note ?? undefined,
      reRegisteredAt: null,
      reRegisteredUserId: null,
    },
    create: {
      originalUserId: target.id,
      name: target.name,
      email: target.email,
      phone: target.phone,
      passwordHash: target.passwordHash,
      plainPassword: target.plainPassword,
      role: target.role,
      verificationStatus: target.verificationStatus,
      deletedBy: auth.user.id,
      note: note ?? undefined,
    },
  });

  // 2. Audit log
  await prisma.adminAudit.create({
    data: {
      adminId: auth.user.id,
      action: "USER_DELETED",
      targetType: "USER",
      targetId: target.id,
      metadata: {
        name: target.name,
        email: target.email,
        phone: target.phone,
        role: target.role,
        note: note || null,
      },
    },
  }).catch(() => {});

  // 3. Clean up related records and hard-delete the user
  try {
    await prisma.$transaction(async (tx) => {
      // Saved listings
      await tx.savedListing.deleteMany({ where: { userId } }).catch(() => {});

      // Broker catalog links
      const brokerCatalogs = await tx.catalogLink.findMany({ where: { brokerId: userId }, select: { id: true } });
      if (brokerCatalogs.length > 0) {
        const catIds = brokerCatalogs.map((c) => c.id);
        await tx.catalogLinkListing.deleteMany({ where: { catalogLinkId: { in: catIds } } }).catch(() => {});
        await tx.catalogLink.deleteMany({ where: { brokerId: userId } }).catch(() => {});
      }

      // Listings owned by this user
      const userListings = await tx.listing.findMany({ where: { ownerId: userId }, select: { id: true } });
      if (userListings.length > 0) {
        const listingIds = userListings.map((l) => l.id);
        await tx.photo.deleteMany({ where: { listingId: { in: listingIds } } }).catch(() => {});
        await tx.document.deleteMany({ where: { listingId: { in: listingIds } } }).catch(() => {});
        await tx.listingCategory.deleteMany({ where: { listingId: { in: listingIds } } }).catch(() => {});
        await tx.homepageSectionItem.deleteMany({ where: { listingId: { in: listingIds } } }).catch(() => {});
        await tx.savedListing.deleteMany({ where: { listingId: { in: listingIds } } }).catch(() => {});
        await tx.catalogLinkListing.deleteMany({ where: { listingId: { in: listingIds } } }).catch(() => {});
        await tx.inquiry.deleteMany({ where: { listingId: { in: listingIds } } }).catch(() => {});
        await tx.listingReport.deleteMany({ where: { listingId: { in: listingIds } } }).catch(() => {});
        await tx.listing.deleteMany({ where: { id: { in: listingIds } } }).catch(() => {});
      }

      // Inquiries & reports
      await tx.inquiry.deleteMany({ where: { OR: [{ senderId: userId }, { recipientId: userId }] } }).catch(() => {});
      await tx.listingReport.deleteMany({ where: { reporterId: userId } }).catch(() => {});
      await tx.adminAudit.deleteMany({ where: { adminId: userId } }).catch(() => {});

      // Tokens & documents
      await tx.passwordResetToken.deleteMany({ where: { userId } }).catch(() => {});
      await tx.emailVerificationToken.deleteMany({ where: { userId } }).catch(() => {});
      await tx.userDocument.deleteMany({ where: { userId } }).catch(() => {});

      // Finally delete the user account
      await tx.user.delete({ where: { id: userId } });
    });

    // Notify user on their Gmail/email that account was removed
    if (target.email) {
      const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      await sendAccountDeletedEmail({
        user: target,
        note,
        origin,
      }).catch((err) => console.error("Account deleted email failed:", err));
    }

    return NextResponse.json({
      ok: true,
      message: `User "${target.name}" (${target.email}) deleted and archived. The user can sign up again anytime with this email/phone.`,
    });
  } catch (err) {
    console.error("USER HARD DELETE ERROR:", err);
    return NextResponse.json({ error: "Failed to delete user account: " + err?.message }, { status: 500 });
  }
}
