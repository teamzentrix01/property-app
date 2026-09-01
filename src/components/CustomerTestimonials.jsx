"use client";

import React, { useState } from "react";
import {
  Star,
  Quote,
  MapPin,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Rahul Sharma",
    role: "Property Buyer",
    location: "Gurugram, Haryana",
    rating: 5,
    initials: "RS",
    text: "The property search experience was very smooth. I was able to compare different projects and locations easily before making my decision.",
  },
  {
    id: 2,
    name: "Neha Kapoor",
    role: "Home Buyer",
    location: "Delhi NCR",
    rating: 5,
    initials: "NK",
    text: "I was looking for a property in Gurugram and found the project information very useful. The overall experience was simple and convenient.",
  },
  {
    id: 3,
    name: "Amit Verma",
    role: "Real Estate Investor",
    location: "Noida, Uttar Pradesh",
    rating: 5,
    initials: "AV",
    text: "The wide range of residential and commercial options made it much easier to shortlist properties according to my investment requirements.",
  },
  {
    id: 4,
    name: "Priya Malhotra",
    role: "Home Buyer",
    location: "South Delhi",
    rating: 5,
    initials: "PM",
    text: "The website has a good selection of properties and projects. I particularly liked being able to explore different BHK options and locations.",
  },
  {
    id: 5,
    name: "Vikas Gupta",
    role: "Property Investor",
    location: "Gurugram, Haryana",
    rating: 5,
    initials: "VG",
    text: "A helpful platform for anyone exploring property in Delhi NCR. The project details helped me understand my options before contacting the developer.",
  },
  {
    id: 6,
    name: "Ananya Singh",
    role: "Property Buyer",
    location: "Faridabad, Haryana",
    rating: 5,
    initials: "AS",
    text: "Finding suitable properties became much easier. The categories and project sections made the search experience organised and straightforward.",
  },
];

export default function CustomerTestimonials() {
  const [active, setActive] = useState(0);

  const visibleTestimonials = testimonials.slice(active, active + 3);

  const nextSlide = () => {
    setActive((prev) => {
      if (prev >= testimonials.length - 3) {
        return 0;
      }
      return prev + 1;
    });
  };

  const prevSlide = () => {
    setActive((prev) => {
      if (prev <= 0) {
        return testimonials.length - 3;
      }
      return prev - 1;
    });
  };

  return (
    <section className="w-full bg-[#f7f6f3] py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-[1400px] px-5 sm:px-8 lg:px-10">

        {/* ================= HEADER ================= */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">

          <div>
            {/* Label */}
            <div className="mb-3 flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-[#b58a3a]" />

              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#a17a2d]">
                What Our Customers Say
              </span>
            </div>

            {/* Heading */}
            <h2 className="text-3xl font-bold tracking-tight text-[#171717] sm:text-4xl lg:text-[42px]">
              Customer{" "}
              <span className="text-[#b2873a]">
                Testimonials
              </span>
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500 sm:text-base">
              Hear from property buyers and investors who explored their
              real estate journey with us.
            </p>
          </div>

          {/* Rating */}
          <div className="flex w-fit items-center gap-3 rounded-xl border border-[#e5dccb] bg-white px-5 py-3 shadow-sm">

            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className="h-4 w-4 fill-[#b58a3a] text-[#b58a3a]"
                />
              ))}
            </div>

            <div className="h-5 w-px bg-gray-200" />

            <div>
              <p className="text-sm font-bold text-[#171717]">
                4.9/5
              </p>

              <p className="text-[10px] text-gray-400">
                Customer Rating
              </p>
            </div>
          </div>
        </div>

        {/* ================= TESTIMONIAL CARDS ================= */}
        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">

          {visibleTestimonials.map((testimonial) => (
            <article
              key={testimonial.id}
              className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-[0_5px_22px_rgba(0,0,0,0.05)] transition-all duration-300 hover:-translate-y-1 hover:border-[#dccba8] hover:shadow-[0_18px_40px_rgba(0,0,0,0.09)]"
            >

              {/* Quote Icon */}
              <div className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full bg-[#f8f2e7]">
                <Quote className="h-5 w-5 text-[#b58a3a]" />
              </div>

              {/* Stars */}
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className="h-4 w-4 fill-[#b58a3a] text-[#b58a3a]"
                  />
                ))}
              </div>

              {/* Review */}
              <p className="mt-6 min-h-[120px] text-sm leading-7 text-gray-600">
                "{testimonial.text}"
              </p>

              {/* Divider */}
              <div className="my-5 h-px bg-gray-100" />

              {/* Customer */}
              <div className="flex items-center gap-3">

                {/* Avatar */}
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#b58a3a] text-sm font-bold text-white shadow-sm">
                  {testimonial.initials}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">

                    <h3 className="truncate text-sm font-bold text-[#171717]">
                      {testimonial.name}
                    </h3>

                    <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-green-600" />
                  </div>

                  <p className="mt-0.5 text-xs text-gray-400">
                    {testimonial.role}
                  </p>

                  <div className="mt-1 flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-[#b58a3a]" />

                    <span className="text-[10px] text-gray-400">
                      {testimonial.location}
                    </span>
                  </div>
                </div>
              </div>

              {/* Gold hover line */}
              <div className="absolute bottom-0 left-0 h-1 w-0 bg-[#b58a3a] transition-all duration-500 group-hover:w-full" />
            </article>
          ))}
        </div>

        {/* ================= CONTROLS ================= */}
        <div className="mt-8 flex items-center justify-between">

          {/* Pagination */}
          <div className="flex items-center gap-1.5">
            {testimonials.slice(0, testimonials.length - 2).map((_, index) => (
              <button
                key={index}
                onClick={() => setActive(index)}
                aria-label={`Go to testimonial ${index + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  active === index
                    ? "w-8 bg-[#b58a3a]"
                    : "w-2 bg-gray-300"
                }`}
              />
            ))}
          </div>

          {/* Arrows */}
          <div className="flex items-center gap-2">

            <button
              onClick={prevSlide}
              aria-label="Previous testimonials"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition hover:border-[#b58a3a] hover:bg-[#b58a3a] hover:text-white"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <button
              onClick={nextSlide}
              aria-label="Next testimonials"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition hover:border-[#b58a3a] hover:bg-[#b58a3a] hover:text-white"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

          </div>
        </div>

        {/* ================= CTA ================= */}
        <div className="relative mt-10 overflow-hidden rounded-2xl bg-[#181818]">

          {/* Decorative circles */}
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full border border-[#b58a3a]/20" />

          <div className="absolute -right-5 -top-10 h-44 w-44 rounded-full border border-[#b58a3a]/15" />

          <div className="relative z-10 flex flex-col gap-6 px-6 py-8 sm:px-9 lg:flex-row lg:items-center lg:justify-between lg:px-12">

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#d3aa5d]">
                Your Property Journey
              </p>

              <h3 className="mt-2 text-2xl font-bold text-white">
                Ready to find your perfect property?
              </h3>

              <p className="mt-2 text-sm text-white/50">
                Start exploring homes and projects that match your lifestyle.
              </p>
            </div>

            <button className="group flex shrink-0 items-center justify-center gap-2 rounded-lg bg-[#b58a3a] px-7 py-3.5 text-sm font-bold text-white transition hover:bg-[#c69d50]">
              Explore Properties

              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>

          </div>
        </div>

      </div>
    </section>
  );
}