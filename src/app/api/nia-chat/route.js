import { NextResponse } from "next/server";
import { currentUser } from "@/lib/serverAuth";
import { prisma } from "@/lib/prisma";
import { ADMIN_CONTACT } from "@/lib/adminContact";
import {
  parseNaturalLanguageIntent,
  searchPropertiesForNia,
  findDealersForNia,
  BUY_BUDGET_OPTIONS,
  RENT_BUDGET_OPTIONS,
  PROPERTY_TYPE_OPTIONS,
  RECOMMENDED_CITIES,
  BHK_OPTIONS,
  FURNISHING_OPTIONS,
  RESIDENTIAL_PREF_OPTIONS,
  PLOT_SIZE_OPTIONS,
  COMMERCIAL_AREA_OPTIONS,
  COMMERCIAL_USAGE_OPTIONS,
  CONTACT_METHOD_OPTIONS,
  HOW_TO_CONTACT_OPTIONS,
  BHOOMI_KNOWLEDGE,
} from "@/lib/niaEngine";

export async function POST(req) {
  try {
    const user = await currentUser();
    const body = await req.json().catch(() => ({}));
    const {
      action = null,
      payload = null,
      message = "",
      conversationState = {},
      history = [],
      currentProperty = null,
    } = body;

    // Current State Copy
    const state = {
      flow: conversationState.flow || "property_search", // 'property_search' | 'submit_dealer_request' | 'contact_dealer'
      currentStep: conversationState.currentStep || "welcome",
      selectedPurpose: conversationState.selectedPurpose || null, // 'SALE' | 'RENT'
      selectedPropertyType: conversationState.selectedPropertyType || null, // 'FLAT' | 'HOUSE' | 'PLOT' | 'OFFICE' | 'SHOP' | 'PG'
      selectedPropertyTypeLabel: conversationState.selectedPropertyTypeLabel || null,
      selectedLocation: conversationState.selectedLocation || null,
      selectedBudget: conversationState.selectedBudget || null,
      minPrice: conversationState.minPrice || 0,
      maxPrice: conversationState.maxPrice || 0,
      selectedBHK: conversationState.selectedBHK || null,
      selectedFurnishing: conversationState.selectedFurnishing || null,
      // Dealer Request Flow specific fields
      dealerSize: conversationState.dealerSize || null,
      dealerAdditionalReq: conversationState.dealerAdditionalReq || null,
      contactName: conversationState.contactName || user?.name || null,
      contactPhone: conversationState.contactPhone || user?.phone || null,
      contactMethod: conversationState.contactMethod || "WhatsApp",
      dealerRequestSubmitted: conversationState.dealerRequestSubmitted || false,
      ...conversationState,
    };

    const trimmedMessage = String(message || "").trim();

    // ─────────────────────────────────────────────────────────────
    // 1. GLOBAL ACTIONS: Reset, Sell, etc.
    // ─────────────────────────────────────────────────────────────

    // Action: Reset Chat
    if (action === "reset") {
      const resetState = {
        flow: "property_search",
        currentStep: "welcome",
        selectedPurpose: null,
        selectedPropertyType: null,
        selectedPropertyTypeLabel: null,
        selectedLocation: null,
        selectedBudget: null,
        minPrice: 0,
        maxPrice: 0,
        selectedBHK: null,
        selectedFurnishing: null,
        dealerSize: null,
        dealerAdditionalReq: null,
        contactName: user?.name || null,
        contactPhone: user?.phone || null,
        contactMethod: "WhatsApp",
        dealerRequestSubmitted: false,
      };

      return NextResponse.json({
        ok: true,
        reply: "Hi! I'm Nia, your Bhoomi AI assistant. 👋 I can help you find verified properties across India, check prices, connect with dealers, or submit customized requirements.\n\nWhat are you looking to do today?",
        quickReplies: [
          { label: "Buy a Property", action: "select_purpose", payload: { purpose: "SALE", label: "Buy" } },
          { label: "Rent a Property", action: "select_purpose", payload: { purpose: "RENT", label: "Rent" } },
          { label: "Submit Dealer Request", action: "start_submit_dealer_request" },
          { label: "How to Contact Dealer", action: "start_contact_dealer_flow" },
          { label: "Sell a Property", action: "sell_property" },
        ],
        conversationState: resetState,
        properties: [],
      });
    }

    // Action: Sell Property
    if (action === "sell_property") {
      return NextResponse.json({
        ok: true,
        reply: "Listing your property on Bhoomi is 100% free and easy! You can post verified plots, flats, houses, shops, or commercial properties in under 2 minutes.",
        quickReplies: [
          { label: "Go to Post Property →", url: "/post-property" },
          { label: "I want to Buy instead", action: "select_purpose", payload: { purpose: "SALE", label: "Buy" } },
          { label: "I want to Rent instead", action: "select_purpose", payload: { purpose: "RENT", label: "Rent" } },
          { label: "Start Over", action: "reset" },
        ],
        conversationState: state,
      });
    }

    // ─────────────────────────────────────────────────────────────
    // 2. FLOW 1: SUBMIT DEALER REQUEST (Conversational Requirements Flow)
    // ─────────────────────────────────────────────────────────────

    // Trigger Start Dealer Request Flow
    if (action === "start_submit_dealer_request" || action === "ask_dealer") {
      state.flow = "submit_dealer_request";
      state.currentStep = "dealer_q1_purpose";

      return NextResponse.json({
        ok: true,
        reply: "Sure! I can help you find a suitable property through our dealer network. Let me ask you a few questions first.\n\nWhat are you looking for?",
        quickReplies: [
          { label: "Buy a Property", action: "dealer_set_purpose", payload: { purpose: "SALE", label: "Buy" } },
          { label: "Rent a Property", action: "dealer_set_purpose", payload: { purpose: "RENT", label: "Rent" } },
          { label: "← Back", action: "reset" },
        ],
        conversationState: state,
      });
    }

    // Dealer Q1: Purpose
    if (action === "dealer_set_purpose") {
      state.flow = "submit_dealer_request";
      state.selectedPurpose = payload?.purpose || "SALE";
      state.currentStep = "dealer_q2_type";

      return NextResponse.json({
        ok: true,
        reply: `Noted: ${payload?.label || (state.selectedPurpose === "RENT" ? "Rent" : "Buy")}.\n\nWhich type of property do you need?`,
        quickReplies: [
          { label: "Flat / Apartment", action: "dealer_set_type", payload: { type: "FLAT", label: "Flat / Apartment" } },
          { label: "Independent House", action: "dealer_set_type", payload: { type: "HOUSE", label: "Independent House" } },
          { label: "Plot / Land", action: "dealer_set_type", payload: { type: "PLOT", label: "Plot / Land" } },
          { label: "Office Space", action: "dealer_set_type", payload: { type: "OFFICE", label: "Office Space" } },
          { label: "Shop", action: "dealer_set_type", payload: { type: "SHOP", label: "Shop" } },
          { label: "PG", action: "dealer_set_type", payload: { type: "PG", label: "PG" } },
          { label: "← Change Purpose", action: "start_submit_dealer_request" },
        ],
        conversationState: state,
      });
    }

    // Dealer Q2: Type
    if (action === "dealer_set_type") {
      state.flow = "submit_dealer_request";
      state.selectedPropertyType = payload?.type || "FLAT";
      state.selectedPropertyTypeLabel = payload?.label || payload?.type || "Property";
      state.currentStep = "dealer_q3_location";

      return NextResponse.json({
        ok: true,
        reply: `Got it: ${state.selectedPropertyTypeLabel}.\n\nWhich location are you interested in? Pick a city below or type your preferred area/city:`,
        quickReplies: [
          ...RECOMMENDED_CITIES.map((city) => ({
            label: city,
            action: "dealer_set_location",
            payload: { location: city },
          })),
          { label: "← Change Property Type", action: "dealer_set_purpose", payload: { purpose: state.selectedPurpose } },
        ],
        conversationState: state,
      });
    }

    // Dealer Q3: Location
    if (action === "dealer_set_location") {
      state.flow = "submit_dealer_request";
      state.selectedLocation = payload?.location || "Moradabad";
      state.currentStep = "dealer_q4_budget";

      const budgetList = state.selectedPurpose === "RENT" ? RENT_BUDGET_OPTIONS : BUY_BUDGET_OPTIONS;
      const budgetPrompt =
        state.selectedPurpose === "RENT"
          ? `Great! In ${state.selectedLocation}, what is your approximate monthly rent budget?`
          : `Great! In ${state.selectedLocation}, what is your approximate purchase budget for a ${state.selectedPropertyTypeLabel || "property"}?`;

      return NextResponse.json({
        ok: true,
        reply: budgetPrompt,
        quickReplies: [
          ...budgetList.map((b) => ({
            label: b.label,
            action: "dealer_set_budget",
            payload: { budgetLabel: b.label, min: b.min, max: b.max },
          })),
          { label: "← Change Location", action: "dealer_set_type", payload: { type: state.selectedPropertyType, label: state.selectedPropertyTypeLabel } },
        ],
        conversationState: state,
      });
    }

    // Dealer Q4: Budget
    if (action === "dealer_set_budget") {
      state.flow = "submit_dealer_request";
      state.selectedBudget = payload?.budgetLabel || "Flexible";
      state.minPrice = payload?.min || 0;
      state.maxPrice = payload?.max || 0;
      state.currentStep = "dealer_q5_size";

      // Question 5: Size or Configuration based on category
      if (["FLAT", "HOUSE", "PG"].includes(state.selectedPropertyType)) {
        return NextResponse.json({
          ok: true,
          reply: `Budget saved (${state.selectedBudget}).\n\nWhat size or configuration (BHK) do you prefer for your residential property?`,
          quickReplies: [
            ...BHK_OPTIONS.map((bhk) => ({
              label: bhk.label,
              action: "dealer_set_size",
              payload: { size: bhk.label, bhk: bhk.value },
            })),
            { label: "← Change Budget", action: "dealer_set_location", payload: { location: state.selectedLocation } },
          ],
          conversationState: state,
        });
      } else if (state.selectedPropertyType === "PLOT") {
        return NextResponse.json({
          ok: true,
          reply: `Budget saved (${state.selectedBudget}).\n\nWhat preferred plot area and measurement unit are you looking for?`,
          quickReplies: [
            ...PLOT_SIZE_OPTIONS.map((opt) => ({
              label: opt.label,
              action: "dealer_set_size",
              payload: { size: opt.label },
            })),
            { label: "← Change Budget", action: "dealer_set_location", payload: { location: state.selectedLocation } },
          ],
          conversationState: state,
        });
      } else {
        // Commercial: Office / Shop / Showroom
        return NextResponse.json({
          ok: true,
          reply: `Budget saved (${state.selectedBudget}).\n\nWhat preferred commercial area size in sq. ft. do you need?`,
          quickReplies: [
            ...COMMERCIAL_AREA_OPTIONS.map((opt) => ({
              label: opt.label,
              action: "dealer_set_size",
              payload: { size: opt.label },
            })),
            { label: "← Change Budget", action: "dealer_set_location", payload: { location: state.selectedLocation } },
          ],
          conversationState: state,
        });
      }
    }

    // Dealer Q5: Size
    if (action === "dealer_set_size") {
      state.flow = "submit_dealer_request";
      state.dealerSize = payload?.size || "Flexible / No Preference";
      if (payload?.bhk !== undefined) state.selectedBHK = payload.bhk;
      state.currentStep = "dealer_q6_additional";

      if (["FLAT", "HOUSE"].includes(state.selectedPropertyType)) {
        return NextResponse.json({
          ok: true,
          reply: `Size noted: ${state.dealerSize}.\n\nDo you have any additional preferences regarding possession or furnishing?`,
          quickReplies: [
            ...RESIDENTIAL_PREF_OPTIONS.map((opt) => ({
              label: opt.label,
              action: "dealer_set_additional",
              payload: { additional: opt.label },
            })),
            { label: "← Change Size", action: "dealer_set_budget", payload: { budgetLabel: state.selectedBudget, min: state.minPrice, max: state.maxPrice } },
          ],
          conversationState: state,
        });
      } else if (state.selectedPropertyType === "PLOT") {
        return NextResponse.json({
          ok: true,
          reply: `Plot size noted: ${state.dealerSize}.\n\nAny additional plot preferences?`,
          quickReplies: [
            { label: "MDA / DMA / Authority Approved", action: "dealer_set_additional", payload: { additional: "Authority Approved (MDA/DMA)" } },
            { label: "Corner Plot", action: "dealer_set_additional", payload: { additional: "Corner Plot" } },
            { label: "Gated Township", action: "dealer_set_additional", payload: { additional: "Gated Township" } },
            { label: "Road Facing (30+ ft)", action: "dealer_set_additional", payload: { additional: "Wide Road Facing" } },
            { label: "No Specific Preference", action: "dealer_set_additional", payload: { additional: "No Specific Preference" } },
            { label: "← Change Plot Size", action: "dealer_set_budget", payload: { budgetLabel: state.selectedBudget, min: state.minPrice, max: state.maxPrice } },
          ],
          conversationState: state,
        });
      } else {
        // Commercial
        return NextResponse.json({
          ok: true,
          reply: `Area noted: ${state.dealerSize}.\n\nWhat is your intended commercial property usage or preference?`,
          quickReplies: [
            ...COMMERCIAL_USAGE_OPTIONS.map((opt) => ({
              label: opt.label,
              action: "dealer_set_additional",
              payload: { additional: opt.label },
            })),
            { label: "Ready to Move", action: "dealer_set_additional", payload: { additional: "Ready to Move" } },
            { label: "No Specific Preference", action: "dealer_set_additional", payload: { additional: "No Specific Preference" } },
            { label: "← Change Area", action: "dealer_set_budget", payload: { budgetLabel: state.selectedBudget, min: state.minPrice, max: state.maxPrice } },
          ],
          conversationState: state,
        });
      }
    }

    // Dealer Q6: Additional Preferences
    if (action === "dealer_set_additional") {
      state.flow = "submit_dealer_request";
      state.dealerAdditionalReq = payload?.additional || "No Specific Preference";
      state.currentStep = "dealer_q7_contact";

      // If user is already logged in with valid 10 digit phone, pre-fill and ask preferred contact method
      const hasValidPhone = state.contactPhone && /^[6-9]\d{9}$/.test(String(state.contactPhone).replace(/\D/g, "").slice(-10));
      const promptText = hasValidPhone
        ? `Great! I have all your property requirements.\n\nSince you are logged in as ${state.contactName || "User"} (${state.contactPhone}), please choose your preferred contact method:`
        : `Great! I have understood your property requirements.\n\nPlease share your contact details (Full Name & 10-digit Mobile Number) so our verified dealer team can assist you:`;

      return NextResponse.json({
        ok: true,
        reply: promptText,
        quickReplies: [
          { label: "WhatsApp", action: "dealer_set_contact_method", payload: { method: "WhatsApp" } },
          { label: "Phone Call", action: "dealer_set_contact_method", payload: { method: "Call" } },
          { label: "Either Call / WhatsApp", action: "dealer_set_contact_method", payload: { method: "Either" } },
          { label: "← Change Preferences", action: "dealer_set_size", payload: { size: state.dealerSize } },
        ],
        conversationState: state,
      });
    }

    // Dealer Q7: Contact Method / Contact Provided
    if (action === "dealer_set_contact_method") {
      state.flow = "submit_dealer_request";
      state.contactMethod = payload?.method || "WhatsApp";

      const hasValidPhone = state.contactPhone && /^[6-9]\d{9}$/.test(String(state.contactPhone).replace(/\D/g, "").slice(-10));
      if (!hasValidPhone) {
        state.currentStep = "dealer_awaiting_phone";
        return NextResponse.json({
          ok: true,
          reply: "Please type your 10-digit mobile number below so our dealer can reach you:",
          quickReplies: [
            { label: "← Back", action: "dealer_set_additional", payload: { additional: state.dealerAdditionalReq } },
          ],
          conversationState: state,
        });
      }

      // We have all contact details -> Show Summary Confirmation (Question 7)
      return generateDealerRequestSummary(state);
    }

    // Action: Edit Dealer Request
    if (action === "dealer_edit_details") {
      state.flow = "submit_dealer_request";
      return NextResponse.json({
        ok: true,
        reply: "Which detail would you like to edit?",
        quickReplies: [
          { label: "Edit Purpose (Buy/Rent)", action: "start_submit_dealer_request" },
          { label: "Edit Property Type", action: "dealer_set_purpose", payload: { purpose: state.selectedPurpose } },
          { label: "Edit Location", action: "dealer_set_type", payload: { type: state.selectedPropertyType, label: state.selectedPropertyTypeLabel } },
          { label: "Edit Budget", action: "dealer_set_location", payload: { location: state.selectedLocation } },
          { label: "Edit Size / BHK", action: "dealer_set_budget", payload: { budgetLabel: state.selectedBudget, min: state.minPrice, max: state.maxPrice } },
          { label: "Edit Contact Method", action: "dealer_set_additional", payload: { additional: state.dealerAdditionalReq } },
          { label: "Start Fresh", action: "reset" },
        ],
        conversationState: state,
      });
    }

    // Action: Confirm & Submit Dealer Request
    if (action === "confirm_dealer_request") {
      state.flow = "submit_dealer_request";
      if (state.dealerRequestSubmitted) {
        return NextResponse.json({
          ok: true,
          reply: "Your dealer request has already been submitted! Our team will reach out to you shortly. Would you like to explore existing properties or start a new inquiry?",
          quickReplies: [
            { label: "Explore Properties", action: "reset" },
            { label: "How to Contact Dealer", action: "start_contact_dealer_flow" },
          ],
          conversationState: state,
        });
      }

      // Validate Phone
      const cleanPhone = String(state.contactPhone || "").replace(/\D/g, "").slice(-10);
      if (!cleanPhone || cleanPhone.length !== 10) {
        return NextResponse.json({
          ok: true,
          reply: "Please provide a valid 10-digit mobile number before submitting so our dealer can contact you.",
          quickReplies: [
            { label: "Provide Phone Number", action: "dealer_set_additional", payload: { additional: state.dealerAdditionalReq } },
          ],
          conversationState: state,
        });
      }

      // Save Inquiry to DB
      try {
        const superAdmin = await prisma.user.findFirst({
          where: { role: { in: ["SUPER_ADMIN", "AREA_ADMIN"] } },
          orderBy: { createdAt: "asc" },
          select: { id: true, email: true },
        });

        let senderId = user?.id;
        if (!senderId) {
          const existingUser = await prisma.user.findFirst({
            where: { phone: cleanPhone },
            select: { id: true },
          });
          senderId = existingUser?.id || superAdmin?.id;
        }

        // Pick listing for inquiry foreign key
        let targetListing = await prisma.listing.findFirst({
          where: {
            status: { in: ["APPROVED", "ACTIVE"] },
            ...(state.selectedLocation ? { city: { contains: state.selectedLocation, mode: "insensitive" } } : {}),
          },
          select: { id: true, ownerId: true },
        });

        if (!targetListing) {
          targetListing = await prisma.listing.findFirst({
            select: { id: true, ownerId: true },
          });
        }

        const structuredSummary = `[DEALER REQUEST]
Purpose: ${state.selectedPurpose === "RENT" ? "Rent a Property" : "Buy a Property"}
Property Type: ${state.selectedPropertyTypeLabel || state.selectedPropertyType || "Not Specified"}
Preferred Location: ${state.selectedLocation || "Not Specified"}
Budget: ${state.selectedBudget || "Flexible"}
Size / Configuration: ${state.dealerSize || "Flexible"}
Additional Requirements: ${state.dealerAdditionalReq || "None"}
Contact Name: ${state.contactName || "Website Visitor"}
Mobile Number: ${cleanPhone}
Preferred Contact Method: ${state.contactMethod || "WhatsApp"}`;

        if (targetListing && (senderId || superAdmin?.id)) {
          await prisma.inquiry.create({
            data: {
              message: structuredSummary.slice(0, 1000),
              listingId: targetListing.id,
              senderId: senderId || superAdmin.id,
              recipientId: superAdmin?.id || targetListing.ownerId,
            },
          });
        }

        state.dealerRequestSubmitted = true;
        state.currentStep = "dealer_request_completed";

        return NextResponse.json({
          ok: true,
          reply: `🎉 **Dealer Request Successfully Submitted!**\n\nThank you, **${state.contactName || "User"}**! Your customized property request for **${state.selectedPropertyTypeLabel} in ${state.selectedLocation}** has been registered with Bhoomi's regional dealer network.\n\nOur verified dealer will connect with you via **${state.contactMethod}** on **+91 ${cleanPhone}** shortly with curated matching properties.`,
          quickReplies: [
            { label: "Browse Current Properties", action: "reset" },
            { label: "How to Contact Dealer", action: "start_contact_dealer_flow" },
            { label: "Post a Property", url: "/post-property" },
          ],
          conversationState: state,
        });
      } catch (err) {
        console.error("Dealer request submit error:", err);
        return NextResponse.json({
          ok: false,
          reply: "I had a temporary issue saving your dealer request. Please try confirming once more or call our support directly.",
          quickReplies: [
            { label: "Retry Confirm & Submit", action: "confirm_dealer_request" },
            { label: "Start Fresh", action: "reset" },
          ],
          conversationState: state,
        });
      }
    }

    // ─────────────────────────────────────────────────────────────
    // 3. FLOW 2: HOW TO CONTACT DEALER (Informational & Guidance Flow)
    // ─────────────────────────────────────────────────────────────

    if (action === "start_contact_dealer_flow") {
      state.flow = "contact_dealer";
      state.currentStep = "contact_dealer_main";

      return NextResponse.json({
        ok: true,
        reply: "Of course! You can connect with a property dealer or owner directly through Bhoomi. Let me guide you.\n\nHow would you like to connect?",
        quickReplies: [
          ...HOW_TO_CONTACT_OPTIONS,
          { label: "← Back to Main Menu", action: "reset" },
        ],
        conversationState: state,
      });
    }

    // Option A: Specific Property Inquiry
    if (action === "contact_specific_property") {
      state.flow = "contact_dealer";
      state.currentStep = "contact_specific_property_check";

      // If user is currently on a property detail page or currentProperty is passed
      if (currentProperty?.id) {
        const ownerPhone = ADMIN_CONTACT.waNumber;
        const formattedWhatsappMsg = `Hi, I am interested in ${currentProperty.title} (${currentProperty.area || ""}, ${currentProperty.city}). Please connect me with the dealer or owner.`;
        const waLink = `https://wa.me/${ownerPhone}?text=${encodeURIComponent(formattedWhatsappMsg)}`;

        return NextResponse.json({
          ok: true,
          reply: `You are currently viewing **"${currentProperty.title}"** in **${currentProperty.city}** (Listing ID: \`${currentProperty.id}\`).\n\nYou can reach out immediately through the verified options below:`,
          quickReplies: [
            { label: "💬 Get Best Quote on WhatsApp", url: waLink },
            { label: "📞 Call Helpline (+91 74174 99974)", url: "tel:+917417499974" },
            { label: "View Property Page", url: `/listings/${currentProperty.id}` },
            { label: "← Other Dealer Contact Options", action: "start_contact_dealer_flow" },
          ],
          conversationState: state,
        });
      }

      return NextResponse.json({
        ok: true,
        reply: "Have you already selected a property on Bhoomi?\n\nIf yes, please share the **Property Title**, **Listing Link**, or **Listing ID** so I can connect you with its assigned dealer.",
        quickReplies: [
          { label: "Browse Properties First", action: "reset" },
          { label: "Find Dealers by City Instead", action: "find_dealers_by_location" },
          { label: "Submit Dealer Request for Me", action: "start_submit_dealer_request" },
          { label: "← Back", action: "start_contact_dealer_flow" },
        ],
        conversationState: state,
      });
    }

    // Option B: Contact Property Owner
    if (action === "contact_property_owner") {
      state.flow = "contact_dealer";
      state.currentStep = "contact_owner_guide";

      return NextResponse.json({
        ok: true,
        reply: `Every property on Bhoomi features a verified **"Contact Owner"** section on its details page.\n\nHere is how to reach the owner:\n1. Open any property details page.\n2. In the right-hand sidebar, you will see the **Owner Profile** with a **Verified Owner** badge.\n3. Click **"Get Best Quote on WhatsApp"** for instant chat, or click **"Call Now"** / **"Schedule Visit"**.\n\n*Note: To protect your privacy and ensure safety, all owner connections are verified by Bhoomi with zero brokerage.*`,
        quickReplies: [
          { label: "Search Properties Now", action: "select_purpose", payload: { purpose: "SALE", label: "Buy" } },
          { label: "Find Dealers in My Area", action: "find_dealers_by_location" },
          { label: "Submit Dealer Request", action: "start_submit_dealer_request" },
          { label: "← Back", action: "start_contact_dealer_flow" },
        ],
        conversationState: state,
      });
    }

    // Option C: Find Dealers by Location
    if (action === "find_dealers_by_location") {
      state.flow = "contact_dealer";
      state.currentStep = "find_dealers_select_city";

      return NextResponse.json({
        ok: true,
        reply: "Which city or location would you like to find verified dealers in?",
        quickReplies: [
          ...RECOMMENDED_CITIES.map((city) => ({
            label: city,
            action: "show_dealers_for_city",
            payload: { city },
          })),
          { label: "← Back", action: "start_contact_dealer_flow" },
        ],
        conversationState: state,
      });
    }

    // Show Dealers for City
    if (action === "show_dealers_for_city") {
      state.flow = "contact_dealer";
      const targetCity = payload?.city || state.selectedLocation || "Moradabad";
      state.selectedLocation = targetCity;

      const dealers = await findDealersForNia(targetCity);

      if (dealers && dealers.length > 0) {
        const dealerCards = dealers
          .map((d, i) => {
            const roleName = d.role === "BROKER" ? "Registered Broker" : d.role === "AREA_ADMIN" ? "Area Manager" : "Verified Property Seller";
            const agency = d.brokerAgency ? ` (${d.brokerAgency})` : "";
            const verifiedBadge = d.verified ? " ✓ Verified" : "";
            const listingsCount = d._count?.listings ? ` • ${d._count.listings} active listings` : "";
            return `${i + 1}. **${d.name}**${agency}\n   ${roleName}${verifiedBadge}${listingsCount}`;
          })
          .join("\n\n");

        return NextResponse.json({
          ok: true,
          reply: `Here are verified dealers and authorized advisors serving **${targetCity}**:\n\n${dealerCards}\n\nYou can connect directly via Bhoomi Helpline (+91 74174 99974) or submit a custom dealer request.`,
          quickReplies: [
            { label: "💬 Connect on WhatsApp", url: `https://wa.me/${ADMIN_CONTACT.waNumber}?text=${encodeURIComponent(`Hi Bhoomi, I want to connect with a dealer in ${targetCity}.`)}` },
            { label: "Submit Dealer Request for Me", action: "start_submit_dealer_request" },
            { label: "Check Another City", action: "find_dealers_by_location" },
            { label: "← Main Menu", action: "reset" },
          ],
          conversationState: state,
        });
      }

      // No registered broker records for this location
      return NextResponse.json({
        ok: true,
        reply: `Currently, there are no independent dealer profiles publicly listed specifically in **${targetCity}**.\n\nHowever, our centralized Bhoomi Dealer Network operates across ${targetCity}! Would you like to submit a Dealer Request so our regional coordinator can assign a verified local advisor to you?`,
        quickReplies: [
          { label: "Yes, Submit Dealer Request", action: "start_submit_dealer_request" },
          { label: "Check Another City", action: "find_dealers_by_location" },
          { label: "Call Helpline (+91 74174 99974)", url: "tel:+917417499974" },
          { label: "← Back", action: "start_contact_dealer_flow" },
        ],
        conversationState: state,
      });
    }

    // Option D: Need Help Connecting
    if (action === "dealer_connection_help") {
      state.flow = "contact_dealer";
      state.currentStep = "connection_help";

      return NextResponse.json({
        ok: true,
        reply: `We're here to help! If you're having trouble reaching an owner or dealer, here are the fastest options:\n\n1. **Official WhatsApp Helpline:** Click below to chat directly with Bhoomi Customer Support (+91 74174 99974).\n2. **Call Us Directly:** Speak with an area specialist during business hours (9 AM - 8 PM).\n3. **Submit Dealer Request:** If you want a dealer to source and negotiate a property tailored to your requirements, submit a request and we will assign a dealer to contact you.`,
        quickReplies: [
          { label: "💬 Chat on WhatsApp (+91 74174 99974)", url: `https://wa.me/${ADMIN_CONTACT.waNumber}?text=${encodeURIComponent("Hi Bhoomi support, I need help connecting with a property dealer.")}` },
          { label: "📞 Call Helpline", url: "tel:+917417499974" },
          { label: "Submit Dealer Request", action: "start_submit_dealer_request" },
          { label: "← Back to Options", action: "start_contact_dealer_flow" },
        ],
        conversationState: state,
      });
    }

    // ─────────────────────────────────────────────────────────────
    // 4. FLOW 3: NORMAL PROPERTY SEARCH FUNNEL (Buy / Rent)
    // ─────────────────────────────────────────────────────────────

    // Action: Select Purpose (Buy / Rent)
    if (action === "select_purpose") {
      state.flow = "property_search";
      state.selectedPurpose = payload?.purpose || "SALE";
      state.currentStep = "select_type";

      const purposeName = state.selectedPurpose === "RENT" ? "rent" : "buy";
      return NextResponse.json({
        ok: true,
        reply: `Great! You want to ${purposeName} a property.\nWhat type of property are you looking for?`,
        quickReplies: [
          ...PROPERTY_TYPE_OPTIONS.map((opt) => ({
            label: opt.label,
            action: "select_type",
            payload: { type: opt.value, label: opt.label },
          })),
          { label: "← Back", action: "reset" },
        ],
        conversationState: state,
      });
    }

    // Action: Select Property Type
    if (action === "select_type") {
      state.flow = "property_search";
      state.selectedPropertyType = payload?.type || "FLAT";
      state.selectedPropertyTypeLabel = payload?.label || payload?.type || "Property";
      state.currentStep = "select_location";

      return NextResponse.json({
        ok: true,
        reply: `Got it, ${state.selectedPropertyTypeLabel}!\nWhich city or location do you prefer? You can pick a popular city below or type your area name:`,
        quickReplies: [
          ...RECOMMENDED_CITIES.map((city) => ({
            label: city,
            action: "select_location",
            payload: { location: city },
          })),
          { label: "← Change Property Type", action: "select_purpose", payload: { purpose: state.selectedPurpose } },
        ],
        conversationState: state,
      });
    }

    // Action: Select Location
    if (action === "select_location") {
      state.flow = "property_search";
      state.selectedLocation = payload?.location || "Moradabad";
      state.currentStep = "select_budget";

      const budgetList = state.selectedPurpose === "RENT" ? RENT_BUDGET_OPTIONS : BUY_BUDGET_OPTIONS;
      const budgetPrompt =
        state.selectedPurpose === "RENT"
          ? `What is your approximate monthly rent budget in ${state.selectedLocation}?`
          : `What is your approximate budget for a ${state.selectedPropertyTypeLabel || "property"} in ${state.selectedLocation}?`;

      return NextResponse.json({
        ok: true,
        reply: budgetPrompt,
        quickReplies: [
          ...budgetList.map((b) => ({
            label: b.label,
            action: "select_budget",
            payload: { budgetLabel: b.label, min: b.min, max: b.max },
          })),
          { label: "← Change Location", action: "select_type", payload: { type: state.selectedPropertyType, label: state.selectedPropertyTypeLabel } },
        ],
        conversationState: state,
      });
    }

    // Action: Select Budget
    if (action === "select_budget") {
      state.flow = "property_search";
      state.selectedBudget = payload?.budgetLabel || "Flexible";
      state.minPrice = payload?.min || 0;
      state.maxPrice = payload?.max || 0;

      // If Flat or House, ask BHK next; otherwise jump to search
      if (["FLAT", "HOUSE"].includes(state.selectedPropertyType)) {
        state.currentStep = "select_bhk";
        return NextResponse.json({
          ok: true,
          reply: `Budget noted (${state.selectedBudget}).\nHow many bedrooms (BHK) are you looking for?`,
          quickReplies: [
            ...BHK_OPTIONS.map((bhk) => ({
              label: bhk.label,
              action: "select_bhk",
              payload: { bhk: bhk.value, label: bhk.label },
            })),
            { label: "← Change Budget", action: "select_location", payload: { location: state.selectedLocation } },
          ],
          conversationState: state,
        });
      }

      // For plots, shops, offices, PG: move directly to show properties
      state.currentStep = "completed";
      const searchRes = await searchPropertiesForNia(state, { limit: 6 });
      return respondWithProperties(state, searchRes);
    }

    // Action: Select BHK
    if (action === "select_bhk") {
      state.flow = "property_search";
      state.selectedBHK = payload?.bhk || 0;
      state.selectedBHKLabel = payload?.label || `${payload?.bhk} BHK`;

      // Ask Furnishing next
      state.currentStep = "select_furnishing";
      return NextResponse.json({
        ok: true,
        reply: `Got it! Any specific furnishing preference?`,
        quickReplies: [
          ...FURNISHING_OPTIONS.map((f) => ({
            label: f.label,
            action: "select_furnishing",
            payload: { furnishing: f.value, label: f.label },
          })),
          { label: "← Change BHK", action: "select_budget", payload: { budgetLabel: state.selectedBudget, min: state.minPrice, max: state.maxPrice } },
        ],
        conversationState: state,
      });
    }

    // Action: Select Furnishing
    if (action === "select_furnishing") {
      state.flow = "property_search";
      state.selectedFurnishing = payload?.furnishing || "ANY";
      state.currentStep = "completed";

      const searchRes = await searchPropertiesForNia(state, { limit: 6 });
      return respondWithProperties(state, searchRes);
    }

    // Action: Trigger Search Directly
    if (action === "search_now") {
      state.flow = "property_search";
      const searchRes = await searchPropertiesForNia(state, { limit: 6 });
      return respondWithProperties(state, searchRes);
    }

    // ─────────────────────────────────────────────────────────────
    // 5. NATURAL LANGUAGE & TYPED TEXT PROCESSING
    // ─────────────────────────────────────────────────────────────

    // Check if user is currently inside the "Submit Dealer Request" flow awaiting phone or name
    if (state.flow === "submit_dealer_request") {
      // Check if text has phone number
      const phoneDigits = trimmedMessage.replace(/\D/g, "");
      if (phoneDigits.length === 10 && /^[6-9]\d{9}$/.test(phoneDigits)) {
        state.contactPhone = phoneDigits;
        // Check if name is in the message e.g. "Rohan 9876543210"
        const remainingName = trimmedMessage.replace(phoneDigits, "").replace(/[^a-zA-Z\s]/g, "").trim();
        if (remainingName && remainingName.length > 2) {
          state.contactName = remainingName;
        }
        return generateDealerRequestSummary(state);
      }

      // If user provided a name
      if (!state.contactName && /^[a-zA-Z\s]{3,30}$/.test(trimmedMessage)) {
        state.contactName = trimmedMessage;
        if (!state.contactPhone) {
          return NextResponse.json({
            ok: true,
            reply: `Nice to meet you, ${state.contactName}! Please share your 10-digit mobile number so our dealer can contact you:`,
            quickReplies: [
              { label: "← Back", action: "dealer_set_additional", payload: { additional: state.dealerAdditionalReq } },
            ],
            conversationState: state,
          });
        }
        return generateDealerRequestSummary(state);
      }

      // If user typed custom size e.g. "200 gaj" or "1500 sqft"
      if (state.currentStep === "dealer_q5_size" || !state.dealerSize) {
        state.dealerSize = trimmedMessage;
        state.currentStep = "dealer_q6_additional";
        return NextResponse.json({
          ok: true,
          reply: `Size noted: ${state.dealerSize}.\n\nDo you have any additional requirements or preferences (ready to move, furnishing, road width)?`,
          quickReplies: [
            { label: "Ready to Move", action: "dealer_set_additional", payload: { additional: "Ready to Move" } },
            { label: "Furnished", action: "dealer_set_additional", payload: { additional: "Furnished" } },
            { label: "No Specific Preference", action: "dealer_set_additional", payload: { additional: "No Specific Preference" } },
          ],
          conversationState: state,
        });
      }

      // If user typed custom additional req
      if (state.currentStep === "dealer_q6_additional" || !state.dealerAdditionalReq) {
        state.dealerAdditionalReq = trimmedMessage;
        state.currentStep = "dealer_q7_contact";
        return NextResponse.json({
          ok: true,
          reply: `Requirement noted: "${state.dealerAdditionalReq}".\n\nPlease share your contact details (Full Name & 10-digit Mobile Number) so our dealer can reach you:`,
          quickReplies: [
            { label: "WhatsApp", action: "dealer_set_contact_method", payload: { method: "WhatsApp" } },
            { label: "Phone Call", action: "dealer_set_contact_method", payload: { method: "Call" } },
          ],
          conversationState: state,
        });
      }
    }

    // Check if user is in "contact_dealer" flow asking about a specific property or city
    if (state.flow === "contact_dealer") {
      // Check if user entered a property ID or title
      if (trimmedMessage.startsWith("cm") || /(listing|property|flat|plot|house)/i.test(trimmedMessage)) {
        const found = await prisma.listing.findFirst({
          where: {
            OR: [
              { id: trimmedMessage.trim() },
              { title: { contains: trimmedMessage.trim(), mode: "insensitive" } },
            ],
          },
          select: { id: true, title: true, city: true, area: true },
        });

        if (found) {
          const ownerPhone = ADMIN_CONTACT.waNumber;
          const formattedWhatsappMsg = `Hi, I am interested in ${found.title} (${found.area}, ${found.city}). Please connect me with the dealer.`;
          return NextResponse.json({
            ok: true,
            reply: `I found the listing: **${found.title}** in **${found.city}** (ID: \`${found.id}\`).\n\nHow would you like to connect with the assigned dealer/owner?`,
            quickReplies: [
              { label: "💬 WhatsApp (+91 74174 99974)", url: `https://wa.me/${ownerPhone}?text=${encodeURIComponent(formattedWhatsappMsg)}` },
              { label: "📞 Call Helpline", url: "tel:+917417499974" },
              { label: "View Property Page", url: `/listings/${found.id}` },
              { label: "← Back", action: "start_contact_dealer_flow" },
            ],
            conversationState: state,
          });
        }
      }

      // Check if city was typed
      const cityMatch = RECOMMENDED_CITIES.find((c) => new RegExp(`\\b${c}\\b`, "i").test(trimmedMessage));
      if (cityMatch) {
        return NextResponse.json({
          ok: true,
          reply: `Looking up verified dealers in ${cityMatch}...`,
          quickReplies: [
            { label: `View Dealers in ${cityMatch}`, action: "show_dealers_for_city", payload: { city: cityMatch } },
          ],
          conversationState: state,
        });
      }
    }

    // General Natural Language Parsing
    const extracted = parseNaturalLanguageIntent(trimmedMessage);

    // If user explicitly asks "Submit Dealer Request"
    if (extracted.wantsSubmitDealer || /(submit dealer request|dealer request|find dealer for me)/i.test(trimmedMessage)) {
      state.flow = "submit_dealer_request";
      state.currentStep = "dealer_q1_purpose";
      return NextResponse.json({
        ok: true,
        reply: "Sure! I can help you find a suitable property through our dealer network. Let me ask you a few questions first.\n\nWhat are you looking for?",
        quickReplies: [
          { label: "Buy a Property", action: "dealer_set_purpose", payload: { purpose: "SALE", label: "Buy" } },
          { label: "Rent a Property", action: "dealer_set_purpose", payload: { purpose: "RENT", label: "Rent" } },
        ],
        conversationState: state,
      });
    }

    // If user explicitly asks "How to contact dealer?"
    if (extracted.wantsContactDealer || /(how to contact dealer|contact dealer|contact owner|talk to dealer|dealer number)/i.test(trimmedMessage)) {
      state.flow = "contact_dealer";
      state.currentStep = "contact_dealer_main";
      return NextResponse.json({
        ok: true,
        reply: "Of course! You can connect with a property dealer or owner directly through Bhoomi. Let me guide you.\n\nHow would you like to connect?",
        quickReplies: [
          ...HOW_TO_CONTACT_OPTIONS,
          { label: "← Back to Main Menu", action: "reset" },
        ],
        conversationState: state,
      });
    }

    // Merge extracted data into state
    if (extracted.purpose) state.selectedPurpose = extracted.purpose;
    if (extracted.propertyType) {
      state.selectedPropertyType = extracted.propertyType;
      const foundType = PROPERTY_TYPE_OPTIONS.find((p) => p.value === extracted.propertyType);
      state.selectedPropertyTypeLabel = foundType?.label || extracted.propertyType;
    }
    if (extracted.city) state.selectedLocation = extracted.city;
    else if (extracted.locality && !state.selectedLocation) state.selectedLocation = extracted.locality;
    if (extracted.maxPrice) {
      state.maxPrice = extracted.maxPrice;
      state.minPrice = extracted.minPrice || 0;
      state.selectedBudget = extracted.budgetLabel || `Up to ₹${extracted.maxPrice}`;
    }
    if (extracted.bedrooms) state.selectedBHK = extracted.bedrooms;
    if (extracted.furnishing) state.selectedFurnishing = extracted.furnishing;

    // Handle Selling request
    if (extracted.intent === "SELL" || /(sell|bechna|post property)/i.test(trimmedMessage)) {
      return NextResponse.json({
        ok: true,
        reply: "You can post your property on Bhoomi in simple steps! Click below to start your listing:",
        quickReplies: [
          { label: "Post My Property →", url: "/post-property" },
          { label: "Help me find a property", action: "reset" },
        ],
        conversationState: state,
      });
    }

    // Handle Verification / MDA / DMA / RERA
    if (extracted.wantsVerified || /(mda|dma|rera|verified|approval)/i.test(trimmedMessage)) {
      const searchRes = await searchPropertiesForNia(
        { ...state, selectedLocation: state.selectedLocation || "Moradabad" },
        { limit: 4 }
      );
      return NextResponse.json({
        ok: true,
        reply: "All listings on Bhoomi are verified. Government authority approved plots carry the '✓ MDA Approved' / '✓ DMA Approved' badge, and registered projects include verified RERA IDs.\nHere are verified listings from our database:",
        properties: searchRes.properties,
        quickReplies: [
          { label: "How to Contact Dealer", action: "start_contact_dealer_flow" },
          { label: "Submit Dealer Request", action: "start_submit_dealer_request" },
          { label: "Filter by Budget", action: "select_location", payload: { location: state.selectedLocation || "Moradabad" } },
          { label: "Start New Search", action: "reset" },
        ],
        conversationState: state,
      });
    }

    // Context-Aware Evaluation: Check what is missing in the step-by-step funnel
    if (!state.selectedPurpose) {
      state.currentStep = "welcome";
      return NextResponse.json({
        ok: true,
        reply: "Hi! I'm Nia, your Bhoomi AI assistant. 👋 What are you looking to do?",
        quickReplies: [
          { label: "Buy a Property", action: "select_purpose", payload: { purpose: "SALE", label: "Buy" } },
          { label: "Rent a Property", action: "select_purpose", payload: { purpose: "RENT", label: "Rent" } },
          { label: "Submit Dealer Request", action: "start_submit_dealer_request" },
          { label: "How to Contact Dealer", action: "start_contact_dealer_flow" },
          { label: "Sell a Property", action: "sell_property" },
        ],
        conversationState: state,
      });
    }

    if (!state.selectedPropertyType) {
      state.currentStep = "select_type";
      return NextResponse.json({
        ok: true,
        reply: `What type of property would you like to ${state.selectedPurpose === "RENT" ? "rent" : "buy"}?`,
        quickReplies: [
          ...PROPERTY_TYPE_OPTIONS.map((opt) => ({
            label: opt.label,
            action: "select_type",
            payload: { type: opt.value, label: opt.label },
          })),
          { label: "← Back", action: "reset" },
        ],
        conversationState: state,
      });
    }

    if (!state.selectedLocation) {
      state.currentStep = "select_location";
      return NextResponse.json({
        ok: true,
        reply: `In which city or area are you looking for a ${state.selectedPropertyTypeLabel || "property"}?`,
        quickReplies: [
          ...RECOMMENDED_CITIES.map((city) => ({
            label: city,
            action: "select_location",
            payload: { location: city },
          })),
          { label: "← Change Property Type", action: "select_purpose", payload: { purpose: state.selectedPurpose } },
        ],
        conversationState: state,
      });
    }

    if (!state.selectedBudget && !state.maxPrice) {
      state.currentStep = "select_budget";
      const budgetList = state.selectedPurpose === "RENT" ? RENT_BUDGET_OPTIONS : BUY_BUDGET_OPTIONS;
      return NextResponse.json({
        ok: true,
        reply: `What is your approximate budget for a ${state.selectedPropertyTypeLabel} in ${state.selectedLocation}?`,
        quickReplies: [
          ...budgetList.map((b) => ({
            label: b.label,
            action: "select_budget",
            payload: { budgetLabel: b.label, min: b.min, max: b.max },
          })),
          { label: "← Change Location", action: "select_type", payload: { type: state.selectedPropertyType, label: state.selectedPropertyTypeLabel } },
        ],
        conversationState: state,
      });
    }

    // If BHK is applicable and missing
    if (["FLAT", "HOUSE"].includes(state.selectedPropertyType) && !state.selectedBHK) {
      state.currentStep = "select_bhk";
      return NextResponse.json({
        ok: true,
        reply: `How many bedrooms (BHK) do you prefer in ${state.selectedLocation}?`,
        quickReplies: [
          ...BHK_OPTIONS.map((bhk) => ({
            label: bhk.label,
            action: "select_bhk",
            payload: { bhk: bhk.value, label: bhk.label },
          })),
          { label: "← Change Budget", action: "select_location", payload: { location: state.selectedLocation } },
        ],
        conversationState: state,
      });
    }

    // All necessary criteria collected: Execute Search
    state.currentStep = "completed";
    const searchRes = await searchPropertiesForNia(state, { limit: 6 });
    return respondWithProperties(state, searchRes);
  } catch (error) {
    console.error("NIA CHATBOT API ERROR:", error);
    return NextResponse.json(
      {
        ok: false,
        reply: "I'm having a brief issue processing your request. Would you like to connect directly with an area dealer or start over?",
        quickReplies: [
          { label: "Submit Dealer Request", action: "start_submit_dealer_request" },
          { label: "How to Contact Dealer", action: "start_contact_dealer_flow" },
          { label: "Start Over", action: "reset" },
        ],
      },
      { status: 500 }
    );
  }
}

/**
 * Generate Structured Dealer Request Summary & Confirmation
 */
function generateDealerRequestSummary(state) {
  state.currentStep = "dealer_confirmation";
  const cleanPhone = String(state.contactPhone || "").replace(/\D/g, "").slice(-10);

  const summaryText = `📋 **Your Dealer Request Summary**

• **Purpose:** ${state.selectedPurpose === "RENT" ? "Rent a Property" : "Buy a Property"}
• **Property Type:** ${state.selectedPropertyTypeLabel || state.selectedPropertyType || "Not Specified"}
• **Preferred Location:** ${state.selectedLocation || "Not Specified"}
• **Budget:** ${state.selectedBudget || "Flexible"}
• **Property Size / BHK:** ${state.dealerSize || "Flexible"}
• **Additional Requirements:** ${state.dealerAdditionalReq || "No Specific Preference"}
• **Name:** ${state.contactName || "User"}
• **Mobile Number:** +91 ${cleanPhone || "Not provided"}
• **Preferred Contact Method:** ${state.contactMethod || "WhatsApp"}

Please review your requirements above. Ready to send this to our regional dealer network?`;

  return NextResponse.json({
    ok: true,
    reply: summaryText,
    isDealerSummary: true,
    quickReplies: [
      { label: "✅ Confirm & Submit Request", action: "confirm_dealer_request" },
      { label: "✏️ Edit Details", action: "dealer_edit_details" },
      { label: "Cancel", action: "reset" },
    ],
    conversationState: state,
  });
}

/**
 * Helper to construct rich response with property cards & tailored guidance
 */
function respondWithProperties(state, searchRes) {
  const count = searchRes.properties.length;
  const loc = state.selectedLocation || "your preferred area";
  const type = state.selectedPropertyTypeLabel || "property";
  const budget = state.selectedBudget ? ` within ${state.selectedBudget}` : "";

  if (count > 0) {
    let note = "";
    if (searchRes.matchType === "price_relaxed") {
      note = ` (Here are the top available ${type}s in ${loc}; you can adjust your budget for more exact matches):`;
    } else if (searchRes.matchType === "nearby_fallback") {
      note = ` (No exact match in ${loc} right now, but here are top verified ${type}s in nearby areas):`;
    } else {
      note = `:`;
    }

    return NextResponse.json({
      ok: true,
      reply: `I found ${count} verified ${type} option${count > 1 ? "s" : ""} in ${loc}${budget}${note}`,
      properties: searchRes.properties,
      quickReplies: [
        { label: "Change Budget", action: "select_location", payload: { location: state.selectedLocation } },
        { label: "Change Location", action: "select_type", payload: { type: state.selectedPropertyType, label: state.selectedPropertyTypeLabel } },
        { label: "Submit Dealer Request", action: "start_submit_dealer_request" },
        { label: "How to Contact Dealer", action: "start_contact_dealer_flow" },
        { label: "Start New Search", action: "reset" },
      ],
      conversationState: state,
    });
  }

  // Zero properties fallback
  return NextResponse.json({
    ok: true,
    reply: `Currently, there are no active listings for ${type} in ${loc}${budget}.\n\nWould you like to submit a customized Dealer Request so our team can find one for you, or adjust your search?`,
    properties: [],
    quickReplies: [
      { label: "Submit Dealer Request", action: "start_submit_dealer_request" },
      { label: "How to Contact Dealer", action: "start_contact_dealer_flow" },
      { label: "Change Location", action: "select_type", payload: { type: state.selectedPropertyType, label: state.selectedPropertyTypeLabel } },
      { label: "Change Budget", action: "select_location", payload: { location: state.selectedLocation } },
      { label: "Start Over", action: "reset" },
    ],
    conversationState: state,
  });
}
