"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  MapPin,
  Phone,
  Mail,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  Building2,
  Clock3,
  CheckCircle2,
} from "lucide-react";

const quickLinks = [
  { name: "Home", href: "/" },
  { name: "About Us", href: "/about-us" },
  { name: "Properties", href: "/properties" },
  { name: "Projects", href: "/projects" },
  { name: "Post Property", href: "/post-property" },
  { name: "Contact Us", href: "/contact-us" },
];

const propertyLinks = [
  { name: "Residential Properties", href: "/properties?propertyType=FLAT" },
  { name: "Commercial Properties", href: "/categories/commercial" },
  { name: "Luxury Properties", href: "/categories/luxury" },
  { name: "Plots", href: "/properties?propertyType=PLOT" },
  { name: "Flats", href: "/categories/apartment" },
  { name: "Villas", href: "/categories/villas" },
];

const popularLocations = [
  { name: "Gurugram", href: "/properties?city=Gurugram" },
  { name: "Delhi", href: "/properties?city=Delhi" },
  { name: "Noida", href: "/properties?city=Noida" },
  { name: "Greater Noida", href: "/properties?city=Greater+Noida" },
  { name: "Faridabad", href: "/properties?city=Faridabad" },
  { name: "Dubai", href: "/properties?city=Dubai" },
];

const legalLinks = [
  { name: "Privacy Policy", href: "/privacy-policy" },
  { name: "Terms & Conditions", href: "/terms-and-conditions" },
  { name: "Disclaimer", href: "/disclaimer" },
  { name: "Sitemap", href: "/sitemap" },
];

const socialLinks = [
  { name: "Facebook", short: "f", href: "https://facebook.com" },
  { name: "Instagram", short: "ig", href: "https://instagram.com" },
  { name: "LinkedIn", short: "in", href: "https://linkedin.com" },
  { name: "YouTube", short: "▶", href: "https://youtube.com" },
  { name: "Twitter", short: "𝕏", href: "https://x.com" },
];

const popularSearches = [
  { name: "Flats in Gurugram", href: "/properties?propertyType=FLAT&city=Gurugram" },
  { name: "Luxury Apartments", href: "/categories/luxury" },
  { name: "Plots in Gurugram", href: "/properties?propertyType=PLOT&city=Gurugram" },
  { name: "New Launch Projects", href: "/projects" },
  { name: "Commercial Properties", href: "/categories/commercial" },
  { name: "SCO Plots", href: "/properties?propertyType=PLOT&search=SCO" },
  { name: "Luxury Villas", href: "/categories/villas" },
  { name: "Properties in Delhi NCR", href: "/properties?city=Delhi" },
];

export default function Footer() {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setNewsletterStatus(true);
      setNewsletterEmail("");
      setTimeout(() => setNewsletterStatus(false), 5000);
    }
  };

  return (
    <footer className="site-footer w-full bg-[#111111] text-white">

      {/* =====================================================
          TOP CTA
      ===================================================== */}
      <div className="border-b border-white/10">
        <div className="mx-auto max-w-[1400px] px-5 py-10 sm:px-8 lg:px-10">

          <div className="relative overflow-hidden rounded-2xl bg-[#1c1c1c]">

            {/* Decorative circles */}
            <div className="absolute -right-20 -top-28 h-72 w-72 rounded-full border border-[#c41920]/20" />
            <div className="absolute -right-5 -top-10 h-48 w-48 rounded-full border border-[#c41920]/15" />

            <div className="relative z-10 flex flex-col gap-7 px-6 py-8 sm:px-9 lg:flex-row lg:items-center lg:justify-between lg:px-12 lg:py-10">

              <div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-[#ff4d4f]" />

                  <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#ff4d4f]">
                    Looking for your dream property?
                  </span>
                </div>

                <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
                  Let our property experts help you.
                </h2>

                <p className="mt-2 max-w-xl text-sm leading-6 text-white/50">
                  Get personalised property recommendations based on your
                  location, budget and lifestyle.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">

                <Link
                  href="/properties"
                  className="group flex items-center justify-center gap-2 rounded-lg bg-[#c41920] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#a51319]"
                >
                  Explore Properties
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>

                <a
                  href="tel:+918500900100"
                  className="flex items-center justify-center gap-2 rounded-lg border border-white/15 px-6 py-3.5 text-sm font-semibold text-white transition hover:border-[#c41920] hover:text-[#c41920]"
                >
                  <Phone className="h-4 w-4" />
                  Call Now
                </a>

              </div>
            </div>
          </div>

        </div>
      </div>

      {/* =====================================================
          MAIN FOOTER
      ===================================================== */}
      <div className="mx-auto max-w-[1400px] px-5 py-14 sm:px-8 lg:px-10">

        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1.1fr]">

          {/* =================================================
              COMPANY
          ================================================= */}
          <div>

            <Link
              href="/"
              className="inline-flex items-center gap-3"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#c41920]">
                <Building2 className="h-6 w-6 text-white" />
              </div>

              <div>
                <span className="block text-xl font-black tracking-tight text-white">
                  100<span className="text-[#c41920]">acress</span>
                </span>

                <span className="block text-[9px] font-semibold uppercase tracking-[0.2em] text-white/40">
                  Real Estate
                </span>
              </div>
            </Link>

            <p className="mt-6 max-w-sm text-sm leading-7 text-white/50">
              Your trusted destination for premium residential and
              commercial properties, new launches, luxury projects
              and real estate investments.
            </p>

            {/* Contact */}
            <div className="mt-7 space-y-4">

              <a
                href="tel:+918500900100"
                className="group flex items-center gap-3 text-sm text-white/60 transition hover:text-[#c41920]"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5">
                  <Phone className="h-4 w-4 text-[#c41920]" />
                </span>

                <span>+91 8500 900 100</span>
              </a>

              <a
                href="mailto:support@100acress.com"
                className="group flex items-center gap-3 text-sm text-white/60 transition hover:text-[#c41920]"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5">
                  <Mail className="h-4 w-4 text-[#c41920]" />
                </span>

                <span>support@100acress.com</span>
              </a>

              <div className="flex items-start gap-3 text-sm text-white/60">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5">
                  <MapPin className="h-4 w-4 text-[#c41920]" />
                </span>

                <span className="leading-6">
                  Gurugram, Haryana
                  <br />
                  India & Dubai, UAE
                </span>
              </div>
            </div>
          </div>

          {/* =================================================
              QUICK LINKS
          ================================================= */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-white">
              Quick Links
            </h3>

            <div className="mt-6 space-y-3.5">
              {quickLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="group flex items-center gap-2 text-sm text-white/50 transition hover:text-[#c41920]"
                >
                  <ChevronRight className="h-3.5 w-3.5 text-[#c41920] transition-transform group-hover:translate-x-1" />
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* =================================================
              PROPERTY
          ================================================= */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-white">
              Properties
            </h3>

            <div className="mt-6 space-y-3.5">
              {propertyLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="group flex items-center gap-2 text-sm text-white/50 transition hover:text-[#c41920]"
                >
                  <ChevronRight className="h-3.5 w-3.5 text-[#c41920] transition-transform group-hover:translate-x-1" />
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* =================================================
              LOCATIONS
          ================================================= */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-white">
              Popular Locations
            </h3>

            <div className="mt-6 space-y-3.5">
              {popularLocations.map((location) => (
                <Link
                  key={location.name}
                  href={location.href}
                  className="group flex items-center gap-2 text-sm text-white/50 transition hover:text-[#c41920]"
                >
                  <MapPin className="h-3.5 w-3.5 text-[#c41920]" />
                  {location.name}
                </Link>
              ))}
            </div>
          </div>

          {/* =================================================
              GET PROPERTY UPDATES
          ================================================= */}
          <div>

            <h3 className="text-sm font-bold uppercase tracking-[0.16em] text-white">
              Get Property Updates
            </h3>

            <p className="mt-6 text-sm leading-6 text-white/50">
              Stay updated with new launches, premium projects and
              exclusive property opportunities.
            </p>

            {/* Email Form */}
            <form onSubmit={handleSubscribe} className="mt-5">
              <div className="flex overflow-hidden rounded-lg border border-white/10 bg-white/[0.04]">
                <input
                  type="email"
                  required
                  placeholder="Your email address"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-white/30"
                />

                <button
                  type="submit"
                  aria-label="Subscribe to property updates"
                  className="flex w-12 shrink-0 items-center justify-center bg-[#c41920] transition hover:bg-[#a51319]"
                >
                  <ArrowRight className="h-4 w-4 text-white" />
                </button>
              </div>
              {newsletterStatus && (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-green-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Thank you for subscribing!</span>
                </div>
              )}
            </form>

            {/* Assistance */}
            <div className="mt-4 flex items-center gap-2 text-xs text-white/50">
              <Clock3 className="h-3.5 w-3.5 text-[#c41920]" />
              Expert assistance available
            </div>

            {/* Social */}
            <div className="mt-7">

              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-white/40">
                Follow Us
              </p>

              <div className="flex items-center gap-2">

                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.name}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-xs font-bold text-white/50 transition hover:border-[#c41920] hover:bg-[#c41920] hover:text-white"
                  >
                    {social.short}
                  </a>
                ))}

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          POPULAR SEARCHES
      ===================================================== */}
      <div className="border-y border-white/10 bg-[#0d0d0d]">

        <div className="mx-auto max-w-[1400px] px-5 py-8 sm:px-8 lg:px-10">

          <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-white/60">
            Popular Property Searches
          </h3>

          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3">

            {popularSearches.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-xs text-white/35 transition hover:text-[#c41920]"
              >
                {item.name}
              </Link>
            ))}

          </div>
        </div>
      </div>

      {/* =====================================================
          LEGAL / COPYRIGHT
      ===================================================== */}
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-10">

        <div className="flex flex-col gap-5 py-6 md:flex-row md:items-center md:justify-between">

          <p className="text-xs leading-5 text-white/35">
            © 2019–{new Date().getFullYear()} 100acress.com. All Rights Reserved.
            <span className="hidden sm:inline"> · </span>
            A Venture of Kaushraj Global LLP
          </p>

          <div className="flex flex-wrap gap-x-5 gap-y-2">

            {legalLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-xs text-white/35 transition hover:text-[#c41920]"
              >
                {link.name}
              </Link>
            ))}

          </div>
        </div>

        {/* Made in India */}
        <div className="border-t border-white/10 py-5 text-center">

          <p className="text-xs text-white/30">
            Made with{" "}
            <span className="text-[#c41920]">♥</span>{" "}
            in India
          </p>

        </div>
      </div>

    </footer>
  );
}
