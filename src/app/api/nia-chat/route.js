import { NextResponse } from "next/server";
import { currentUser } from "@/lib/serverAuth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/formatters";
import {
  extractPropertySearchCriteria,
  searchPropertiesForNia,
  BHOOMI_KNOWLEDGE,
} from "@/lib/niaEngine";

/**
 * Handle LLM via Gemini or OpenAI if API keys are set in .env
 */
async function callLLMIfAvailable({ systemPrompt, messages, propertiesContext }) {
  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (geminiKey) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
      const contents = [
        {
          role: "user",
          parts: [{ text: `${systemPrompt}\n\nAvailable Database Context:\n${propertiesContext}` }],
        },
        ...messages.map((m) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        })),
      ];

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents }),
      });

      if (res.ok) {
        const json = await res.json();
        const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text.trim();
      }
    } catch (e) {
      console.warn("Gemini call error:", e.message);
    }
  }

  if (openaiKey) {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: `${systemPrompt}\n\n${propertiesContext}` },
            ...messages.map((m) => ({ role: m.role, content: m.content })),
          ],
          temperature: 0.7,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        const text = json.choices?.[0]?.message?.content;
        if (text) return text.trim();
      }
    } catch (e) {
      console.warn("OpenAI call error:", e.message);
    }
  }

  return null;
}

/**
 * Rule-Based Intelligent Fallback when no external LLM API key is configured
 */
function generateIntelligentResponse({
  userMessage,
  criteria,
  searchResults,
  currentProperty,
  isHindi,
  pageContext,
}) {
  const text = userMessage.toLowerCase();

  // 1. Dealer / Contact / Visit / Agent queries
  if (criteria.wantsInquiry || /(dealer|contact|agent|broker|visit|phone|call|owner number|talk to)/i.test(text)) {
    if (isHindi) {
      return {
        reply: "Ji bilkul! Main aapko property dealer / owner se directly connect kar sakti hoon. Kripya neeche diye gaye inquiry form mein apna naam aur contact details bharein, hamari team aapse jaldi contact karegi.",
        showInquiryForm: true,
      };
    }
    return {
      reply: "I can help you connect directly with the property dealer / owner. Please share your details in the form below, and our team will get back to you shortly.",
      showInquiryForm: true,
    };
  }

  // 2. Questions about current property being viewed
  if (currentProperty && /(price|location|rera|facing|area|size|dealer|visit|details|owner|dma|mda)/i.test(text)) {
    const formattedPrice = formatPrice(currentProperty.price, currentProperty.purpose);
    const details = [
      `Title: ${currentProperty.title}`,
      `Price: ${formattedPrice}`,
      `Location: ${currentProperty.area ? `${currentProperty.area}, ` : ""}${currentProperty.city}`,
      currentProperty.sizeValue ? `Size: ${currentProperty.sizeValue} ${currentProperty.sizeUnit || "sqft"}` : null,
      currentProperty.bedrooms ? `Configuration: ${currentProperty.bedrooms} BHK` : null,
      currentProperty.authorityApproved ? "Government Authority Approved: Yes (✓ MDA / DMA Approved)" : null,
      currentProperty.reraNumber ? `RERA: ${currentProperty.reraNumber}` : null,
    ].filter(Boolean).join("\n• ");

    if (/(contact|dealer|phone|visit|talk)/i.test(text)) {
      return {
        reply: `You can schedule a site visit or contact the dealer for "${currentProperty.title}" using the form below:`,
        showInquiryForm: true,
      };
    }

    if (isHindi) {
      return {
        reply: `Aap abhi "${currentProperty.title}" dekh rahe hain:\n• ${details}\n\nKya aap is property ki site visit schedule karna chahenge ya dealer se baat karna chahte hain?`,
        suggestedActions: ["Schedule Visit", "Contact Dealer", "Show Similar Properties"],
      };
    }

    return {
      reply: `Here are the details for the property you're viewing:\n• ${details}\n\nWould you like to schedule a site visit or connect with the dealer?`,
      suggestedActions: ["Schedule Visit", "Contact Dealer", "Show Similar Properties"],
    };
  }

  // 3. Post property question
  if (/(post property|list property|sell property|rent out|apna makan bechna|property add)/i.test(text)) {
    if (isHindi) {
      return {
        reply: "Bhoomi par apni property list karna bahut aasan hai! Aap upar diye gaye 'Post Property' button par click karke ya /post-property par jaakar apni property ke photos, price aur details add kar sakte hain. Verified property jald hi live ho jayegi.",
        suggestedActions: ["Go to Post Property", "What documents are required?", "Contact Support"],
      };
    }
    return {
      reply: "Listing your property on Bhoomi is simple! Just click the 'Post Property' button in the navigation bar or visit /post-property to upload your photos, set your price, and specify location details. Once verified by our team, it will be published.",
      suggestedActions: ["Go to Post Property", "Required Documents", "Contact Support"],
    };
  }

  // 4. Verification / DMA / RERA
  if (/(dma|mda|rera|verified|safe|approval|authority)/i.test(text)) {
    if (isHindi) {
      return {
        reply: "Bhoomi par sabhi properties hamari team dwara manually check ki jaati hain. Government approved plots aur projects par '✓ MDA Approved' / '✓ DMA Approved' badge aur RERA verified projects par unka RERA Registration Number clearly display hota hai.",
        suggestedActions: ["Show Verified Properties", "MDA Approved Plots", "Contact Dealer"],
      };
    }
    return {
      reply: "Every listing on Bhoomi undergoes manual verification. Government development authority approved plots & projects display the '✓ MDA Approved' / '✓ DMA Approved' badge, and registered projects clearly show their official RERA registration number.",
      suggestedActions: ["Show Verified Properties", "MDA Approved Plots", "Contact Dealer"],
    };
  }

  // 5. Account / Login / Register
  if (/(login|signup|register|account|password|otp)/i.test(text)) {
    if (isHindi) {
      return {
        reply: "Aap Bhoomi par apna account 'Sign Up' page se 1 minute mein bana sakte hain. Register karne par aap apni pasand ki property save kar sakte hain, inquiries track kar sakte hain aur personalized recommendations pa sakte hain.",
        suggestedActions: ["Go to Sign Up", "Go to Login", "Forgot Password"],
      };
    }
    return {
      reply: "You can create a free Bhoomi account in under a minute via the Sign Up page. Having an account allows you to save favorite listings, track your inquiries, and receive tailored property recommendations.",
      suggestedActions: ["Go to Sign Up", "Go to Login", "Forgot Password"],
    };
  }

  // 6. Property search results available
  if (searchResults?.properties?.length > 0) {
    const count = searchResults.properties.length;
    let cityText = searchResults.city ? ` in ${searchResults.city}` : "";
    let matchNote = "";

    if (searchResults.matchType === "same_city") {
      matchNote = isHindi
        ? ` (Exact sector mein nahi mili, lekin ${searchResults.city} ki best matching properties ye rahi)`
        : ` (Showing the best matching verified options across ${searchResults.city})`;
    } else if (searchResults.matchType === "nearby_fallback") {
      matchNote = isHindi
        ? ` (Aapki exact location par listing available nahi thi, isliye paas ki top properties dikha rahi hoon)`
        : ` (We found related verified properties in nearby locations)`;
    }

    if (isHindi) {
      return {
        reply: `Maine aapke liye ${count} verified properties dhundhi hain${cityText}${matchNote}:`,
        properties: searchResults.properties,
        suggestedActions: ["Contact Dealer", "Filter by Budget", "Change City"],
      };
    }

    return {
      reply: `Here are ${count} verified properties matching your requirements${cityText}${matchNote}:`,
      properties: searchResults.properties,
      suggestedActions: ["Contact Dealer", "Filter by Budget", "Change City"],
    };
  }

  // 7. Conversational follow-ups for property discovery
  if (criteria.propertyType && !criteria.city) {
    if (isHindi) {
      return {
        reply: `Zaroor! Aap kis city ya area mein ${criteria.propertyType.toLowerCase()} dekh rahe hain? (Jaise Moradabad, Meerut, Rampur, Noida, etc.)`,
        suggestedActions: ["Moradabad", "Meerut", "Rampur", "Noida", "Gurugram"],
      };
    }
    return {
      reply: `Great! In which city or location are you looking for a ${criteria.propertyType.toLowerCase()}? (e.g. Moradabad, Meerut, Rampur, Noida, Gurugram)`,
      suggestedActions: ["Moradabad", "Meerut", "Rampur", "Noida", "Gurugram"],
    };
  }

  if (criteria.city && !criteria.propertyType && !criteria.maxPrice) {
    if (isHindi) {
      return {
        reply: `${criteria.city} mein aap kis tarah ki property dekh rahe hain? Flat, Plot, House ya Commercial Space?`,
        suggestedActions: ["Residential Plot", "Apartment / Flat", "Independent House", "Commercial"],
      };
    }
    return {
      reply: `What type of property are you interested in around ${criteria.city}? Plots, Flats, Independent Houses, or Commercial?`,
      suggestedActions: ["Residential Plot", "Apartment / Flat", "Independent House", "Commercial"],
    };
  }

  // 8. General Greetings & Help
  if (/(hi|hello|hey|namaste|hlo|helo|kaise ho)/i.test(text)) {
    if (isHindi) {
      return {
        reply: "Namaste! Main Nia hoon, aapki Bhoomi AI Property Assistant. 🙏 Main aapko verified flats, plots, houses dhundhne ya dealers se contact karne mein kaise madad kar sakti hoon?",
        suggestedActions: ["Find plots near me", "Flats in Moradabad", "Contact a Dealer", "Post Property"],
      };
    }
    return {
      reply: "Hi! I'm Nia, your Bhoomi AI Property Assistant. 👋 I can help you search verified plots, homes, and commercial properties, or connect you with trusted regional dealers. How can I help you today?",
      suggestedActions: ["Find properties near me", "Show plots in Moradabad", "Connect with Dealer", "How to Post Property"],
    };
  }

  // 9. Default fallback with inquiry option
  if (isHindi) {
    return {
      reply: "Main Bhoomi par verified plots, flats, houses aur commercial properties dhundhne mein aapki poori madad kar sakti hoon. Aap mujhe apni pasandida location ya budget bata sakte hain, ya dealer se direct baat karne ke liye neeche form bhar sakte hain.",
      suggestedActions: ["Find properties in Moradabad", "Flats under 50 Lakh", "Contact Dealer"],
    };
  }

  return {
    reply: "I'm here to help you discover verified properties across India, check approvals, or connect with authorized dealers. Feel free to specify your preferred city, property type, or budget, or connect with our dealer team directly.",
    suggestedActions: ["Find properties in Moradabad", "Plots under 40 Lakhs", "Contact Dealer", "Post a Property"],
  };
}

export async function POST(req) {
  try {
    const user = await currentUser();
    const body = await req.json().catch(() => ({}));
    const {
      message = "",
      history = [],
      currentProperty = null,
      pageContext = {},
    } = body;

    const trimmedMessage = String(message || "").trim();
    if (!trimmedMessage) {
      return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });
    }

    // Detect language preference (Hindi / Hinglish vs English)
    const isHindi = /(namaste|kya|hai|batao|chahiye|kitne|kaha|kaise|plot|zameen|ghar|makan|bhoomi|dhundo|acha|kripya|sahayata)/i.test(
      trimmedMessage
    );

    // 1. Extract natural language search criteria
    const criteria = extractPropertySearchCriteria(trimmedMessage, history);

    // If current property page, inherit city/type context if user asks relative questions
    if (currentProperty && !criteria.city) {
      criteria.currentPropertyId = currentProperty.id;
    }

    // 2. Query actual properties from database
    let searchResults = { properties: [], matchType: "none", count: 0 };
    if (criteria.propertyType || criteria.city || criteria.minPrice || criteria.maxPrice || criteria.bedrooms) {
      searchResults = await searchPropertiesForNia(criteria, { limit: 4 });
    }

    // 3. Attempt LLM generation if API Key is configured in environment
    const systemPrompt = `You are Nia, the intelligent, friendly, and professional AI Property Assistant for Bhoomi, India's trusted real estate platform.
Keep answers concise, helpful, and natural. Support English and Hinglish seamlessly.
Never invent fake properties or false RERA/pricing details. Rely strictly on the provided real Bhoomi database listings.
If the user wants to contact a dealer, schedule a visit, or requests contact details, kindly encourage them to submit an inquiry using the built-in inquiry form.`;

    const propertiesContext = searchResults.properties.length > 0
      ? `Real Database Listings:\n` + searchResults.properties.map((p) => `- ${p.title}: ₹${p.price} in ${p.area}, ${p.city} (Type: ${p.propertyType}, Status: ${p.status}) [ID: ${p.id}]`).join("\n")
      : "No specific property search executed for this turn.";

    let aiReply = await callLLMIfAvailable({
      systemPrompt,
      messages: [...history, { role: "user", content: trimmedMessage }],
      propertiesContext,
    });

    // 4. If no LLM configured or failed, use Nia's built-in intelligent engine
    if (!aiReply) {
      const generated = generateIntelligentResponse({
        userMessage: trimmedMessage,
        criteria,
        searchResults,
        currentProperty,
        isHindi,
        pageContext,
      });

      return NextResponse.json({
        ok: true,
        reply: generated.reply,
        properties: generated.properties || searchResults.properties || [],
        showInquiryForm: generated.showInquiryForm || false,
        suggestedActions: generated.suggestedActions || [],
        criteria,
      });
    }

    return NextResponse.json({
      ok: true,
      reply: aiReply,
      properties: searchResults.properties,
      showInquiryForm: criteria.wantsInquiry,
      criteria,
    });
  } catch (error) {
    console.error("NIA CHATBOT API ERROR:", error);
    return NextResponse.json(
      {
        ok: false,
        reply: "I'm having trouble processing that right now, but our property dealers are always here to help you. Would you like to submit a quick inquiry?",
        showInquiryForm: true,
      },
      { status: 500 }
    );
  }
}

