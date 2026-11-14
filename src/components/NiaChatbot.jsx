"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  X,
  Minimize2,
  Maximize2,
  Send,
  Sparkles,
  MapPin,
  Building,
  Phone,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  RotateCcw,
  MessageCircle,
  ChevronLeft,
} from "lucide-react";
import { formatPrice } from "@/lib/formatters";

// Nia 3D Cartoon AI Property Consultant Avatar
const NIA_CARTOON_FEMALE = "/nia-avatar.jpg";

export default function NiaChatbot() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Initial welcome state
  const initialConversationState = {
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
    contactName: null,
    contactPhone: null,
    contactMethod: "WhatsApp",
    dealerRequestSubmitted: false,
  };

  const [conversationState, setConversationState] = useState(initialConversationState);

  const initialWelcomeMessage = {
    id: "welcome",
    role: "assistant",
    content: "Hi! I'm Nia, your Bhoomi AI assistant. 👋 I can help you find verified properties across India, check prices, connect with dealers, or submit customized requirements.\n\nWhat are you looking to do today?",
    quickReplies: [
      { label: "Buy a Property", action: "select_purpose", payload: { purpose: "SALE", label: "Buy" } },
      { label: "Rent a Property", action: "select_purpose", payload: { purpose: "RENT", label: "Rent" } },
      { label: "Submit Dealer Request", action: "start_submit_dealer_request" },
      { label: "How to Contact Dealer", action: "start_contact_dealer_flow" },
      { label: "Sell a Property", action: "sell_property" },
    ],
  };

  const [messages, setMessages] = useState([initialWelcomeMessage]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Inquiry Form State
  const [inquiryModal, setInquiryModal] = useState({
    show: false,
    property: null,
  });
  const [inquiryForm, setInquiryForm] = useState({
    name: "",
    phone: "",
    email: "",
    location: "",
    message: "",
  });
  const [inquirySubmitting, setInquirySubmitting] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState(false);
  const [inquiryError, setInquiryError] = useState("");

  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, inquiryModal.show, isLoading]);

  // Fetch logged-in user profile to prefill inquiries
  useEffect(() => {
    fetch("/api/auth/me", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) {
          setCurrentUser(data.user);
          setInquiryForm((prev) => ({
            ...prev,
            name: data.user.name || "",
            phone: data.user.phone || "",
            email: data.user.email || "",
            location: data.user.preferredLocation || data.user.preferredCity || "",
          }));
        }
      })
      .catch(() => {});
  }, []);

  // Send Action Trigger (from quick replies)
  const handleQuickReplyClick = async (option) => {
    if (isLoading) return;

    if (option.url) {
      setIsOpen(false);
      router.push(option.url);
      return;
    }

    // Add user selection bubble to chat
    const userMsg = {
      id: `user-${Date.now()}`,
      role: "user",
      content: option.label,
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/nia-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: option.action,
          payload: option.payload || null,
          conversationState,
        }),
      });

      const data = await res.json();

      if (data.conversationState) {
        setConversationState(data.conversationState);
      }

      const assistantMsg = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.reply,
        properties: data.properties || [],
        quickReplies: data.quickReplies || [],
        showInquiryForm: data.showInquiryForm || false,
      };

      setMessages((prev) => [...prev, assistantMsg]);

      if (data.showInquiryForm) {
        setInquiryModal({
          show: true,
          property: data.properties?.[0] || null,
        });
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: "I'm having a brief connection issue. Please feel free to try again or submit a dealer inquiry.",
          quickReplies: [{ label: "Start Over", action: "reset" }],
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Send Typed Text Message
  const handleSendMessage = async () => {
    const text = inputText.trim();
    if (!text || isLoading) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsLoading(true);

    try {
      const historyPayload = messages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/nia-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history: historyPayload,
          conversationState,
        }),
      });

      const data = await res.json();

      if (data.conversationState) {
        setConversationState(data.conversationState);
      }

      const assistantMsg = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.reply,
        properties: data.properties || [],
        quickReplies: data.quickReplies || [],
        showInquiryForm: data.showInquiryForm || false,
      };

      setMessages((prev) => [...prev, assistantMsg]);

      if (data.showInquiryForm) {
        setInquiryModal({
          show: true,
          property: data.properties?.[0] || null,
        });
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: "I'm having a little trouble connecting right now. Would you like to connect directly with a property dealer?",
          showInquiryForm: true,
          quickReplies: [{ label: "Start Over", action: "reset" }],
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset Chat completely
  const handleResetChat = async () => {
    setConversationState(initialConversationState);
    setMessages([initialWelcomeMessage]);
    setInquiryModal({ show: false, property: null });
  };

  // Submit Inquiry Form
  const handleInquirySubmit = async (e) => {
    e.preventDefault();
    if (!inquiryForm.name || !inquiryForm.phone) {
      setInquiryError("Please enter your name and phone number");
      return;
    }

    setInquirySubmitting(true);
    setInquiryError("");

    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: inquiryForm.name,
          phone: inquiryForm.phone,
          email: inquiryForm.email,
          message: `[NIA CHATBOT INQUIRY] Preferred Location: ${inquiryForm.location || "Not specified"}\nMessage: ${inquiryForm.message || "User requested dealer connection via Nia AI Assistant"}`,
          listingId: inquiryModal.property?.id || null,
          type: "PROPERTY",
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to submit inquiry");
      }

      setInquirySuccess(true);
      setTimeout(() => {
        setInquiryModal({ show: false, property: null });
        setInquirySuccess(false);
        setMessages((prev) => [
          ...prev,
          {
            id: `inq-success-${Date.now()}`,
            role: "assistant",
            content: "Thank you! Your inquiry has been submitted successfully. Our property dealer will contact you soon. 📞",
            quickReplies: [
              { label: "Search more properties", action: "reset" },
            ],
          },
        ]);
      }, 2000);
    } catch (err) {
      setInquiryError(err.message || "Failed to submit inquiry. Please try again.");
    } finally {
      setInquirySubmitting(false);
    }
  };

  return (
    <div className="fixed bottom-10 right-6 sm:bottom-12 sm:right-8 z-50 font-sans">
      {/* ── FLOATING BUTTON (When closed) ── */}
      {!isOpen && (
        <div className="flex items-center gap-2.5">
          {/* Tooltip / Prompt Badge */}
          <div
            onClick={() => setIsOpen(true)}
            className="hidden sm:flex cursor-pointer items-center gap-2 rounded-full border border-red-100 bg-white/95 px-3.5 py-1.5 shadow-lg backdrop-blur-md transition-all hover:scale-105 hover:border-[#c41920]/40"
          >
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-gray-800">
              Ask <span className="font-bold text-[#c41920]">Nia</span> – AI Property Assistant
            </span>
          </div>

          {/* Trigger Icon Button with Female Avatar */}
          <button
            onClick={() => setIsOpen(true)}
            aria-label="Open Nia AI Assistant"
            className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-[#c41920] p-0.5 shadow-xl shadow-red-900/25 transition-transform duration-300 hover:scale-110 active:scale-95 ring-2 ring-[#c41920]"
          >
            <div className="absolute -inset-1 rounded-full bg-[#c41920]/25 animate-ping opacity-75 pointer-events-none" />
            <img
              src={NIA_CARTOON_FEMALE}
              alt="Nia AI Property Assistant"
              className="h-full w-full rounded-full object-cover object-top border-2 border-white"
            />
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-white">
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
            </span>
          </button>
        </div>
      )}

      {/* ── CHAT WINDOW ── */}
      {isOpen && (
        <div
          className={`flex flex-col overflow-hidden rounded-2xl border border-gray-200/90 bg-white shadow-2xl transition-all duration-300 ${
            isExpanded
              ? "fixed inset-3 sm:inset-auto sm:right-8 sm:bottom-12 sm:h-[680px] sm:w-[520px]"
              : "fixed bottom-10 right-4 left-4 sm:left-auto sm:right-8 sm:bottom-12 sm:h-[600px] sm:w-[410px]"
          }`}
        >
          {/* 1. Header */}
          <div className="flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-[#180e0f] via-[#241315] to-[#c41920] px-4 py-3.5 text-white">
            <div className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-full ring-2 ring-white/30 overflow-visible">
                <img
                  src={NIA_CARTOON_FEMALE}
                  alt="Nia AI Assistant"
                  className="h-10 w-10 rounded-full object-cover object-top border border-white/50"
                />
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-[#180e0f]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold tracking-tight">Nia</h3>
                  <span className="rounded-full bg-white/20 px-1.5 py-0.2 text-[9px] font-semibold uppercase tracking-wider text-amber-200">
                    AI Assistant
                  </span>
                </div>
                <p className="text-[11px] text-gray-300">Bhoomi Real Estate Consultant</p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-gray-300">
              {/* Reset Chat button */}
              <button
                onClick={handleResetChat}
                title="Restart Conversation"
                className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white/10 hover:text-white transition"
              >
                <RotateCcw size={15} />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? "Restore" : "Expand"}
                className="hidden sm:flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white/10 hover:text-white transition"
              >
                {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close"
                className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white/10 hover:text-white transition"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* 2. Messages List */}
          <div className="flex-1 overflow-y-auto bg-slate-50/60 p-4 space-y-4">
            {messages.map((msg, index) => {
              const isLastMessage = index === messages.length - 1;

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
                >
                  <div className="flex items-start gap-2 max-w-[92%]">
                    {msg.role === "assistant" && (
                      <img
                        src={NIA_CARTOON_FEMALE}
                        alt="Nia"
                        className="h-7 w-7 rounded-full object-cover object-top shrink-0 border border-gray-200 mt-0.5 shadow-2xs"
                      />
                    )}
                    <div
                      className={`rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed shadow-2xs whitespace-pre-line ${
                        msg.role === "user"
                          ? "bg-[#c41920] text-white rounded-br-xs ml-auto"
                          : "bg-white text-gray-800 border border-gray-200/80 rounded-bl-xs"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>

                  {/* Render Embedded Properties if any */}
                  {msg.properties?.length > 0 && (
                    <div className="mt-3 grid w-full gap-2.5 sm:grid-cols-2">
                      {msg.properties.map((prop) => {
                        const firstPhoto = prop.photos?.[0]?.url;
                        const locationText = [prop.area, prop.city].filter(Boolean).join(", ");
                        const formattedPrice = formatPrice(prop.price, prop.purpose);

                        return (
                          <div
                            key={prop.id}
                            className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs transition hover:border-[#c41920] hover:shadow-md"
                          >
                            <div className="relative h-28 w-full bg-gray-100 overflow-hidden">
                              {firstPhoto ? (
                                <img
                                  src={firstPhoto}
                                  alt={prop.title}
                                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                />
                              ) : (
                                <div className="grid h-full place-items-center text-[10px] text-gray-400">
                                  No photo available
                                </div>
                              )}
                              <span className="absolute left-1.5 top-1.5 rounded-md bg-black/75 px-2 py-0.5 text-[10px] font-extrabold text-white">
                                {formattedPrice}
                              </span>
                              {prop.authorityApproved && (
                                <span className="absolute right-1.5 top-1.5 rounded-md bg-teal-600/90 px-1.5 py-0.5 text-[9px] font-bold text-white shadow-xs">
                                  ✓ Approved
                                </span>
                              )}
                            </div>

                            <div className="flex flex-1 flex-col p-2.5">
                              <h4 className="line-clamp-1 text-xs font-bold text-gray-950 group-hover:text-[#c41920]">
                                {prop.title}
                              </h4>
                              <p className="mt-0.5 flex items-center gap-1 text-[11px] text-gray-500">
                                <MapPin size={11} className="text-[#c41920] shrink-0" />
                                <span className="truncate">{locationText}</span>
                              </p>

                              {/* Specs tags */}
                              <div className="mt-1.5 flex items-center gap-2 text-[10px] text-gray-600 font-semibold">
                                {prop.bedrooms && <span>{prop.bedrooms} BHK</span>}
                                {prop.sizeValue && (
                                  <span>
                                    {prop.sizeValue} {prop.sizeUnit || "sqft"}
                                  </span>
                                )}
                                <span className="capitalize">{prop.propertyType?.toLowerCase()}</span>
                              </div>

                              <div className="mt-2.5 flex items-center justify-between gap-1.5 border-t border-gray-100 pt-2">
                                <Link
                                  href={`/listings/${prop.id}`}
                                  onClick={() => setIsOpen(false)}
                                  className="rounded-lg bg-gray-50 px-2 py-1 text-[10px] font-bold text-[#c41920] border border-gray-200/80 hover:bg-red-50 hover:border-red-200 transition"
                                >
                                  View Details →
                                </Link>
                                <button
                                  onClick={() =>
                                    setInquiryModal({
                                      show: true,
                                      property: prop,
                                    })
                                  }
                                  className="rounded-lg bg-[#c41920] px-2 py-1 text-[10px] font-bold text-white hover:bg-[#a51319] transition shadow-2xs"
                                >
                                  Contact Dealer
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Render Suggested Action Buttons (Only for the active assistant message) */}
                  {msg.quickReplies?.length > 0 && isLastMessage && (
                    <div className="mt-3 flex flex-wrap gap-2 pl-9">
                      {msg.quickReplies.map((reply, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleQuickReplyClick(reply)}
                          className="rounded-full border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-800 shadow-2xs transition-all duration-200 hover:border-[#c41920] hover:bg-red-50/70 hover:text-[#c41920] active:scale-95"
                        >
                          {reply.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-gray-500 pl-9">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-[#c41920]" />
                <span>Nia is thinking...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* 3. Dealer Inquiry Form Slide-up Modal */}
          {inquiryModal.show && (
            <div className="border-t border-gray-200 bg-white p-4 shadow-lg animate-in slide-in-from-bottom duration-200">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100 mb-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-900">
                  <Phone size={13} className="text-[#c41920]" />
                  <span>Connect with Property Dealer</span>
                </div>
                <button
                  onClick={() => setInquiryModal({ show: false, property: null })}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              </div>

              {inquirySuccess ? (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-semibold text-emerald-800">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span>Thank you! Your inquiry has been submitted. Our dealer will call you soon.</span>
                </div>
              ) : (
                <form onSubmit={handleInquirySubmit} className="space-y-2.5 text-xs">
                  {inquiryModal.property && (
                    <div className="rounded-lg bg-gray-50 p-2 text-[11px] text-gray-700">
                      <span className="font-semibold text-gray-900">Property: </span>
                      {inquiryModal.property.title} ({inquiryModal.property.city})
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <input
                        type="text"
                        placeholder="Full Name *"
                        required
                        value={inquiryForm.name}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, name: e.target.value })}
                        className="w-full rounded-lg border border-gray-200 p-2 text-xs outline-none focus:border-[#c41920]"
                      />
                    </div>
                    <div>
                      <input
                        type="tel"
                        placeholder="Mobile Number *"
                        required
                        value={inquiryForm.phone}
                        onChange={(e) => setInquiryForm({ ...inquiryForm, phone: e.target.value })}
                        className="w-full rounded-lg border border-gray-200 p-2 text-xs outline-none focus:border-[#c41920]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={inquiryForm.email}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, email: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 p-2 text-xs outline-none focus:border-[#c41920]"
                    />
                    <input
                      type="text"
                      placeholder="Preferred Location"
                      value={inquiryForm.location}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, location: e.target.value })}
                      className="w-full rounded-lg border border-gray-200 p-2 text-xs outline-none focus:border-[#c41920]"
                    />
                  </div>

                  <textarea
                    rows={2}
                    placeholder="Message / Requirement (e.g. want to visit tomorrow, budget 50L)"
                    value={inquiryForm.message}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, message: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 p-2 text-xs outline-none focus:border-[#c41920] resize-none"
                  />

                  {inquiryError && (
                    <p className="text-[11px] text-red-600 font-semibold">{inquiryError}</p>
                  )}

                  <button
                    type="submit"
                    disabled={inquirySubmitting}
                    className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#c41920] py-2 text-xs font-bold text-white transition hover:bg-red-700 disabled:opacity-60"
                  >
                    {inquirySubmitting ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Inquiry"
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* 4. Input Footer */}
          <div className="border-t border-gray-200 bg-white p-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Type your question or requirement..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isLoading}
                className="flex-1 rounded-xl border border-gray-200 bg-gray-50/70 px-3.5 py-2 text-xs sm:text-sm text-gray-800 outline-none transition focus:border-[#c41920] focus:bg-white focus:ring-2 focus:ring-[#c41920]/10"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isLoading}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#c41920] text-white shadow-xs transition hover:bg-red-700 disabled:opacity-40"
              >
                <Send size={15} />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
