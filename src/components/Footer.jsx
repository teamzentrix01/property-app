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
} from "lucide-react";

const quickLinks = [
  { name: "Home", href: "/" },
  { name: "About Us", href: "/about-us" },
  { name: "Properties", href: "/properties" },
  { name: "Projects", href: "/projects" },
  { name: "Post Property", href: "/listings/new" },
  { name: "Contact Us", href: "/contact-us" },
];

const propertyLinks = [
  { name: "Residential Properties", href: "/residential-property" },
  { name: "Commercial Properties", href: "/commercial-property" },
  { name: "Luxury Properties", href: "/luxury-properties" },
  { name: "Plots", href: "/plots" },
  { name: "Flats", href: "/flats" },
  { name: "Villas", href: "/villas" },
];

const popularLocations = [
  { name: "Gurugram", href: "/property-in-gurugram" },
  { name: "Delhi", href: "/property-in-delhi" },
  { name: "Noida", href: "/property-in-noida" },
  { name: "Greater Noida", href: "/property-in-greater-noida" },
  { name: "Faridabad", href: "/property-in-faridabad" },
  { name: "Dubai", href: "/property-in-dubai" },
];

const legalLinks = [
  { name: "Privacy Policy", href: "/privacy-policy" },
  { name: "Terms & Conditions", href: "/terms-and-conditions" },
  { name: "Disclaimer", href: "/disclaimer" },
  { name: "Sitemap", href: "/sitemap" },
];

const socialLinks = [
  { name: "Facebook", short: "f", href: "#" },
  { name: "Instagram", short: "ig", href: "#" },
  { name: "LinkedIn", short: "in", href: "#" },
  { name: "YouTube", short: "▶", href: "#" },
  { name: "Twitter", short: "𝕏", href: "#" },
];

export default function Footer() {
  const [user, setUser] = useState(undefined);
  useEffect(() => { fetch("/api/auth/me").then((response) => response.ok ? response.json() : { user: null }).then((data) => setUser(data.user)).catch(() => setUser(null)); }, []);
  return (
    <footer className="w-full bg-[#111111] text-white">

      {/* =====================================================
          TOP CTA
      ===================================================== */}
      <div className="border-b border-white/10">
        <div className="mx-auto max-w-[1400px] px-5 py-10 sm:px-8 lg:px-10">

          <div className="relative overflow-hidden rounded-2xl bg-[#1c1c1c]">

            {/* Decorative circles */}
            <div className="absolute -right-20 -top-28 h-72 w-72 rounded-full border border-[#b58a3a]/20" />

            <div className="absolute -right-5 -top-10 h-48 w-48 rounded-full border border-[#b58a3a]/15" />

            <div className="relative z-10 flex flex-col gap-7 px-6 py-8 sm:px-9 lg:flex-row lg:items-center lg:justify-between lg:px-12 lg:py-10">

              <div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-[#d3aa5d]" />

                  <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#d3aa5d]">
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
                  className="group flex items-center justify-center gap-2 rounded-lg bg-[#b58a3a] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#c69d50]"
                >
                  Explore Properties

                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>

                <a
                  href="tel:+918500900100"
                  className="flex items-center justify-center gap-2 rounded-lg border border-white/15 px-6 py-3.5 text-sm font-semibold text-white transition hover:border-[#b58a3a] hover:text-[#d3aa5d]"
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
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#b58a3a]">
                <Building2 className="h-6 w-6 text-white" />
              </div>

              <div>
                <span className="block text-xl font-black tracking-tight text-white">
                  100<span className="text-[#d3aa5d]">acress</span>
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
                className="group flex items-center gap-3 text-sm text-white/60 transition hover:text-[#d3aa5d]"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5">
                  <Phone className="h-4 w-4 text-[#b58a3a]" />
                </span>

                <span>+91 8500 900 100</span>
              </a>

              <a
                href="mailto:support@100acress.com"
                className="group flex items-center gap-3 text-sm text-white/60 transition hover:text-[#d3aa5d]"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5">
                  <Mail className="h-4 w-4 text-[#b58a3a]" />
                </span>

                <span>support@100acress.com</span>
              </a>

              <div className="flex items-start gap-3 text-sm text-white/60">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5">
                  <MapPin className="h-4 w-4 text-[#b58a3a]" />
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

              {quickLinks.filter((link) => user || link.name !== "Post Property").map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="group flex items-center gap-2 text-sm text-white/50 transition hover:text-[#d3aa5d]"
                >
                  <ChevronRight className="h-3.5 w-3.5 text-[#b58a3a] transition-transform group-hover:translate-x-1" />

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
                  className="group flex items-center gap-2 text-sm text-white/50 transition hover:text-[#d3aa5d]"
                >
                  <ChevronRight className="h-3.5 w-3.5 text-[#b58a3a] transition-transform group-hover:translate-x-1" />

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
                  className="group flex items-center gap-2 text-sm text-white/50 transition hover:text-[#d3aa5d]"
                >
                  <MapPin className="h-3.5 w-3.5 text-[#b58a3a]" />

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

            {/* Email */}
            <div className="mt-5 flex overflow-hidden rounded-lg border border-white/10 bg-white/[0.04]">

              <input
                type="email"
                placeholder="Your email address"
                className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-white/30"
              />

              <button
                type="button"
                aria-label="Subscribe"
                className="flex w-12 shrink-0 items-center justify-center bg-[#b58a3a] transition hover:bg-[#c69d50]"
              >
                <ArrowRight className="h-4 w-4 text-white" />
              </button>

            </div>

            {/* Assistance */}
            <div className="mt-4 flex items-center gap-2 text-xs text-white/35">
              <Clock3 className="h-3.5 w-3.5 text-[#b58a3a]" />

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
                    aria-label={social.name}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-xs font-bold text-white/50 transition hover:border-[#b58a3a] hover:bg-[#b58a3a] hover:text-white"
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

            {[
              "Flats in Gurugram",
              "Luxury Apartments",
              "Plots in Gurugram",
              "New Launch Projects",
              "Commercial Properties",
              "SCO Plots",
              "Luxury Villas",
              "Properties in Delhi NCR",
            ].map((item) => (
              <Link
                key={item}
                href="/properties"
                className="text-xs text-white/35 transition hover:text-[#d3aa5d]"
              >
                {item}
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
                className="text-xs text-white/35 transition hover:text-[#d3aa5d]"
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
            <span className="text-[#b58a3a]">♥</span>{" "}
            in India
          </p>

        </div>
      </div>

    </footer>
  );
}