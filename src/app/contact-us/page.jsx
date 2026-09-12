"use client";

import { useState } from "react";
import Link from "next/link";
import { Phone, Mail, MapPin, Clock, Send, CheckCircle2 } from "lucide-react";

export default function ContactUsPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "General Inquiry",
    message: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  const offices = [
    {
      city: "Gurugram (Corporate Office)",
      address: "Golf Course Extension Road, Sector 65, Gurugram, Haryana - 122018",
      phone: "+91 8500 900 100",
      email: "support@100acress.com",
    },
    {
      city: "Dubai (International Office)",
      address: "Business Bay, Downtown Dubai, United Arab Emirates",
      phone: "+971 4 000 0000",
      email: "dubai@100acress.com",
    },
    {
      city: "Moradabad (Regional Office)",
      address: "Civil Lines, Delhi Road, Moradabad, Uttar Pradesh - 244001",
      phone: "+91 9999 999 999",
      email: "moradabad@100acress.com",
    },
  ];

  return (
    <main className="min-h-screen flex-1 bg-[#f7f7f3]">
      {/* Hero */}
      <section className="bg-[#111111] px-5 py-16 text-white sm:px-8">
        <div className="mx-auto max-w-6xl">
          <p className="inline-block rounded-full bg-[#c41920]/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#ff4d4f]">
            We're Here For You
          </p>
          <h1 className="mt-3 font-display text-4xl sm:text-5xl font-bold">Contact Our Property Advisors</h1>
          <p className="mt-4 max-w-2xl text-base text-white/70">
            Have questions about buying, selling, or renting properties? Our team of real estate experts is ready to assist you.
          </p>
        </div>
      </section>

      {/* Main Content: Form & Direct Details */}
      <section className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr]">
          {/* Contact Form */}
          <div className="rounded-3xl border border-ink/8 bg-white p-7 sm:p-10 shadow-sm">
            <h2 className="text-2xl font-bold text-[#180e0f]">Send us a message</h2>
            <p className="mt-2 text-sm text-ink-soft">
              Fill out the form below and one of our area managers will call or WhatsApp you within 2 hours.
            </p>

            {submitted ? (
              <div className="mt-8 rounded-2xl bg-[#fff1f2] p-8 text-center border border-[#fecdd3]">
                <CheckCircle2 className="mx-auto h-12 w-12 text-[#c41920]" />
                <h3 className="mt-4 text-xl font-bold text-[#180e0f]">Thank You for Reaching Out!</h3>
                <p className="mt-2 text-sm text-ink-soft">
                  Your inquiry has been received. A senior advisor will contact you at {form.phone || form.email || "your provided details"}.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setForm({ name: "", email: "", phone: "", subject: "General Inquiry", message: "" });
                  }}
                  className="mt-6 rounded-xl bg-[#c41920] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[#a51319]"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-ink-soft mb-2">
                      Full Name *
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Rahul Sharma"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#c41920] focus:ring-1 focus:ring-[#c41920]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-ink-soft mb-2">
                      Phone Number *
                    </label>
                    <input
                      required
                      type="tel"
                      placeholder="e.g. 9876543210"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#c41920] focus:ring-1 focus:ring-[#c41920]"
                    />
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-ink-soft mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. rahul@example.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#c41920] focus:ring-1 focus:ring-[#c41920]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-ink-soft mb-2">
                      Topic / Requirement
                    </label>
                    <select
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#c41920] focus:ring-1 focus:ring-[#c41920]"
                    >
                      <option value="Buy Residential Property">Buy Residential Property</option>
                      <option value="Commercial / SCO Investment">Commercial / SCO Investment</option>
                      <option value="Post or Sell My Property">Post or Sell My Property</option>
                      <option value="Renting / Leasing">Renting / Leasing</option>
                      <option value="Legal & RERA Verification">Legal & RERA Verification</option>
                      <option value="General Inquiry">General Inquiry</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink-soft mb-2">
                    Message / Preferred City & Budget
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Tell us what you're looking for (e.g. 3 BHK in Gurugram under 1.5 Cr)..."
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full rounded-xl border border-ink/15 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#c41920] focus:ring-1 focus:ring-[#c41920]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#c41920] px-8 py-3.5 text-sm font-bold text-white transition hover:bg-[#a51319] disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  {loading ? "Sending..." : "Submit Inquiry"}
                </button>
              </form>
            )}
          </div>

          {/* Direct Contact Cards */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-ink/8 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-[#180e0f]">Quick Contact</h3>
              <div className="mt-5 space-y-4">
                <a
                  href="tel:+918500900100"
                  className="flex items-center gap-3.5 rounded-xl border border-ink/8 p-3.5 transition hover:bg-[#fff1f2] hover:border-[#fecdd3]"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#fff1f2] text-[#c41920]">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-ink-soft">Toll-Free Helpline</p>
                    <p className="text-sm font-bold text-[#180e0f]">+91 8500 900 100</p>
                  </div>
                </a>

                <a
                  href="mailto:support@100acress.com"
                  className="flex items-center gap-3.5 rounded-xl border border-ink/8 p-3.5 transition hover:bg-[#fff1f2] hover:border-[#fecdd3]"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#fff1f2] text-[#c41920]">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-ink-soft">Email Support</p>
                    <p className="text-sm font-bold text-[#180e0f]">support@100acress.com</p>
                  </div>
                </a>

                <div className="flex items-center gap-3.5 rounded-xl border border-ink/8 p-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#fff1f2] text-[#c41920]">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-ink-soft">Working Hours</p>
                    <p className="text-sm font-bold text-[#180e0f]">Mon - Sun: 9:00 AM - 8:00 PM</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Office Locations */}
            <div className="rounded-3xl border border-ink/8 bg-white p-6 shadow-sm">
              <h3 className="text-lg font-bold text-[#180e0f]">Our Presence</h3>
              <div className="mt-4 space-y-4">
                {offices.map((off) => (
                  <div key={off.city} className="border-b border-ink/8 pb-3.5 last:border-0 last:pb-0">
                    <div className="flex items-start gap-2.5">
                      <MapPin className="h-4 w-4 shrink-0 text-[#c41920] mt-1" />
                      <div>
                        <p className="text-xs font-bold text-[#180e0f]">{off.city}</p>
                        <p className="mt-1 text-xs text-ink-soft">{off.address}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
