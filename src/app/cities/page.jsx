"use client";

import React from "react";

const Navbar = () => {
  return (
    <nav className="bg-white shadow-md relative z-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="h-20 flex items-center">

          {/* ================= CITIES ================= */}
          <div className="relative h-full flex items-center group">

            <button
              type="button"
              className="text-gray-800 font-semibold text-[16px]"
            >
              Cities
            </button>

            {/* ================= BLANK DROPDOWN ================= */}
            <div
              className="
                absolute
                top-full
                left-0

                w-[650px]
                h-[350px]

                bg-white
                rounded-[15px]

                border
                border-gray-200

                shadow-[0_10px_35px_rgba(0,0,0,0.20)]

                opacity-0
                invisible
                translate-y-2

                group-hover:opacity-100
                group-hover:visible
                group-hover:translate-y-0

                transition-all
                duration-200

                z-[9999]
              "
            >
            </div>
          </div>

          {/* ================= OTHER NAV ITEMS ================= */}
          <div className="flex items-center gap-8 ml-10">

            <span className="font-semibold text-gray-700">
              Budget
            </span>

            <span className="font-semibold text-gray-700">
              Property Type
            </span>

            <span className="font-semibold text-gray-700">
              Project Status
            </span>

            <span className="font-semibold text-gray-700">
              Resale
            </span>

            <span className="font-semibold text-gray-700">
              Rental
            </span>

            <span className="font-semibold text-gray-700">
              Insights
            </span>

          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;