import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@/lib/serverAuth";
import { notifyEmail } from "@/lib/mailer";

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const inquiries = await prisma.inquiry.findMany({
    where: { OR: [{ senderId: user.id }, { recipientId: user.id }] },
    include: {
      listing: { select: { id: true, title: true, area: true, city: true } },
      sender: { select: { id: true, name: true, phone: true } },
      recipient: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json({ inquiries });
}

export async function POST(req) {
  try {
    const user = await currentUser();
    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "Invalid request payload" }, { status: 400 });

    const type = body.type || (body.listingId ? "PROPERTY" : "CONTACT");
    const rawMessage = body.message || body.notes || "";
    const senderName = String(body.name || user?.name || "Website Visitor").trim();
    const senderEmail = String(body.email || user?.email || "no-email@bhoomi.com").trim().toLowerCase();
    const senderPhone = String(body.phone || user?.phone || "").replace(/\D/g, "").slice(0, 10);

    // Role-based protection: LOAN inquiry / EMI calculations can only be submitted by authenticated BUYERs
    if (type === "LOAN") {
      if (!user) {
        return NextResponse.json({ error: "Login as Buyer required to submit Home Loan / EMI inquiries" }, { status: 401 });
      }
      if (user.role !== "BUYER") {
        return NextResponse.json({ error: "Only accounts with Buyer role can access Home Loan / EMI services" }, { status: 403 });
      }
    }

    // 1. Find or pick an admin as fallback recipient
    const superAdmin = await prisma.user.findFirst({
      where: { role: { in: ["SUPER_ADMIN", "AREA_ADMIN"] } },
      orderBy: { createdAt: "asc" },
      select: { id: true, email: true, name: true },
    });

    // 2. Identify sender ID
    let senderId = user?.id;
    if (!senderId) {
      const existingUser = await prisma.user.findFirst({
        where: { OR: [{ email: senderEmail }, ...(senderPhone ? [{ phone: senderPhone }] : [])] },
        select: { id: true },
      });
      senderId = existingUser?.id || superAdmin?.id;
    }

    let listing = null;
    let recipientId = superAdmin?.id;
    let recipientEmail = superAdmin?.email;

    if (body.listingId) {
      listing = await prisma.listing.findFirst({
        where: { id: body.listingId },
        include: { owner: { select: { id: true, email: true, name: true } } },
      });
      // Route inquiry recipient to Super Admin so Admin manages all leads
      if (superAdmin?.id) {
        recipientId = superAdmin.id;
        recipientEmail = superAdmin.email;
      } else if (listing?.ownerId) {
        recipientId = listing.ownerId;
        recipientEmail = listing.owner.email;
      }
    }

    if (!listing) {
      listing = await prisma.listing.findFirst({
        where: { status: { in: ["APPROVED", "ACTIVE"] } },
        select: { id: true, title: true, area: true, city: true, ownerId: true, owner: { select: { id: true, email: true, name: true } } },
      });
      if (!listing) {
        listing = await prisma.listing.findFirst({
          select: { id: true, title: true, area: true, city: true, ownerId: true, owner: { select: { id: true, email: true, name: true } } },
        });
      }
      if (!recipientId && listing?.ownerId) {
        recipientId = listing.ownerId;
        recipientEmail = listing.owner?.email;
      }
    }

    if (!senderId || !recipientId || !listing?.id) {
      return NextResponse.json({ error: "System initialization pending: no default recipient or property found." }, { status: 500 });
    }

    // Format final structured message
    let finalMessage = "";
    if (type === "LOAN") {
      finalMessage = `[LOAN INQUIRY]
Applicant: ${senderName}
Phone: ${senderPhone || "Not provided"}
Email: ${senderEmail}
Requested Loan: ₹${Number(body.loanAmount || 0).toLocaleString("en-IN")}
Tenure: ${body.tenureYears || 20} Years @ ${body.interestRate || 8.5}% p.a.
Estimated Monthly EMI: ₹${Number(body.emi || 0).toLocaleString("en-IN")}
Property: ${body.propertyTitle ? `${body.propertyTitle} (${body.propertyLocation || ""})` : listing?.title || "Property Loan"}
${rawMessage ? `Notes: ${rawMessage}` : ""}`.trim();
    } else if (type === "CONTACT") {
      finalMessage = `[CONTACT FORM]
From: ${senderName}
Phone: ${senderPhone || "Not provided"}
Email: ${senderEmail}
Subject: ${body.subject || "General Inquiry"}
Message: ${rawMessage}`.trim();
    } else {
      finalMessage = String(rawMessage).slice(0, 1000);
    }

    // Create inquiry in DB
    const inquiry = await prisma.inquiry.create({
      data: {
        message: finalMessage.slice(0, 1000),
        listingId: listing.id,
        senderId,
        recipientId,
      },
      include: {
        listing: { select: { id: true, title: true, area: true, city: true } },
        sender: { select: { id: true, name: true, phone: true, email: true } },
      },
    });

    // Notify recipient/owner if it was a property-specific inquiry
    if (type === "PROPERTY" && recipientEmail && listing?.title) {
      notifyEmail({
        to: recipientEmail,
        subject: "New property enquiry",
        heading: "A buyer is interested",
        message: `${senderName} sent an enquiry for "${listing.title}".`,
        action: { label: "View enquiry", url: `${new URL(req.url).origin}/dashboard` },
      }).catch(() => {});
    }

    // Always notify Admin on all inquiries (Loan, Contact, or Property)
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      const emailSubject =
        type === "LOAN"
          ? `🏦 New Home Loan Inquiry - ${senderName}`
          : type === "CONTACT"
          ? `📩 New Contact Us Message - ${senderName}`
          : `New Inquiry – ${listing?.title || "Property"}`;

      notifyEmail({
        to: adminEmail,
        subject: emailSubject,
        heading:
          type === "LOAN"
            ? "New Home Loan Inquiry Received"
            : type === "CONTACT"
            ? "New Contact Form Message"
            : "New Property Inquiry Received",
        message: `${finalMessage}\n\nSubmitted on: ${new Date().toLocaleString("en-IN")}`,
        action: { label: "View Inquiries in Admin →", url: `${new URL(req.url).origin}/admin/inquiries` },
      }).catch(() => {});
    }

    return NextResponse.json({ ok: true, inquiry }, { status: 201 });
  } catch (error) {
    console.error("INQUIRY POST ERROR:", error);
    return NextResponse.json({ error: error?.message || "Failed to submit inquiry" }, { status: 500 });
  }
}
