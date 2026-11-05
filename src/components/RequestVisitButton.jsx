"use client";

import React from "react";
import { MessageCircle, Calendar } from "lucide-react";

export default function RequestVisitButton({ phone, whatsappMessage, listingId }) {
  const triggerInquiry = () => {
    // Dispatch standard event to trigger the Property Inquiry / Visit modal
    window.dispatchEvent(new CustomEvent("open-property-inquiry"));
  };

  return (
    <button
      type="button"
      onClick={triggerInquiry}
      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#c41920] px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#a51319] hover:shadow-md active:scale-95 cursor-pointer"
    >
      <Calendar className="h-4 w-4 text-amber-300" />
      <span>Request Visit</span>
    </button>
  );
}

