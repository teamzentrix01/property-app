"use client";

import React, { useEffect, useState } from "react";
import {
  Search,
  MapPin,
  ChevronDown,
  Home,
  Building2,
  KeyRound,
  Ruler,
  BedDouble,
  Layers3,
  Car,
  Bath,
  Wallet,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  LandPlot,
  Route,
  Compass,
  SquareDashed,
} from "lucide-react";

export default function HeroSection() {
  const [activeTab, setActiveTab] = useState("Buy");
  const [propertyType, setPropertyType] = useState("");
  const [location, setLocation] = useState("");
  const [user, setUser] = useState(undefined);
  const [showLocations, setShowLocations] = useState(false);

  const emptyRequirements = {
    bhk: "",
    floor: "",
    minArea: "",
    maxArea: "",
    areaUnit: "sq.ft",
    bathrooms: "",
    parking: "",
    furnishing: "",
    facing: "",
    possession: "",
    minBudget: "",
    maxBudget: "",
    rent: "",
    totalFloors: "",
    plotArea: "",
    builtUpArea: "",
    availability: "",

    // PLOT
    plotType: "",
    roadWidth: "",
    cornerPlot: "",
    gatedSociety: "",
  };

  const [requirements, setRequirements] = useState(emptyRequirements);

  const propertyTypes = {
    Buy: ["Plot", "House", "Flat", "Builder Floor"],
    Rent: ["Flat", "House", "Plot", "PG / Room"],
  };

  const locations = {
    Moradabad: [
      "New Moradabad",
      "Ram Ganga Vihar",
      "Ram Ganga Vihar Phase 2",
      "Kashiram Nagar",
      "Buddhi Vihar",
      "Civil Lines",
      "Harthala",
      "Kanth Road",
      "Delhi Road",
      "Rampur Road",
      "Majhola",
      "Pakwara",
      "Ashiyana Colony",
    ],

    Meerut: [
      "Shastri Nagar",
      "Ganga Nagar",
      "Pallavpuram",
      "Modipuram",
      "Saket",
      "Civil Lines",
      "Garh Road",
      "Delhi Road",
      "Rohta Road",
      "Kanker Khera",
      "Lohia Nagar",
    ],

    Delhi: [
      "Dwarka",
      "Rohini",
      "Pitampura",
      "Janakpuri",
      "Laxmi Nagar",
      "Mayur Vihar",
      "Saket",
      "Vasant Kunj",
      "Greater Kailash",
      "Rajouri Garden",
    ],

    Noida: [
      "Sector 15",
      "Sector 18",
      "Sector 50",
      "Sector 51",
      "Sector 62",
      "Sector 75",
      "Sector 76",
      "Sector 78",
      "Sector 137",
      "Sector 150",
    ],

    "Greater Noida": [
      "Alpha 1",
      "Alpha 2",
      "Beta 1",
      "Beta 2",
      "Gamma",
      "Pari Chowk",
      "Greater Noida West",
      "Techzone",
      "Gaur City",
      "Knowledge Park",
    ],

    Ghaziabad: [
      "Indirapuram",
      "Vaishali",
      "Vasundhara",
      "Raj Nagar",
      "Raj Nagar Extension",
      "Crossings Republik",
      "Kaushambi",
      "Shalimar Garden",
    ],

    Lucknow: [
      "Gomti Nagar",
      "Gomti Nagar Extension",
      "Hazratganj",
      "Aliganj",
      "Indira Nagar",
      "Faizabad Road",
      "Sushant Golf City",
      "Shaheed Path",
    ],
  };

  /* =========================================================
     LOCATION SEARCH
  ========================================================= */

  const getLocationSuggestions = () => {
    if (!location.trim()) return [];

    const searchValue = location.toLowerCase().trim();
    let suggestions = [];

    Object.keys(locations).forEach((city) => {
      if (city.toLowerCase().includes(searchValue)) {
        suggestions.push({
          name: city,
          type: "City",
        });

        locations[city].forEach((area) => {
          suggestions.push({
            name: area,
            type: "Area",
            city,
          });
        });
      }

      locations[city].forEach((area) => {
        if (area.toLowerCase().includes(searchValue)) {
          suggestions.push({
            name: area,
            type: "Area",
            city,
          });
        }
      });
    });

    const uniqueSuggestions = suggestions.filter(
      (item, index, self) =>
        index ===
        self.findIndex(
          (x) => x.name === item.name && x.city === item.city
        )
    );

    return uniqueSuggestions.slice(0, 10);
  };

  const locationSuggestions = getLocationSuggestions();

  /* =========================================================
     AUTH
  ========================================================= */

  useEffect(() => {
    fetch("/api/auth/me")
      .then((response) =>
        response.ok ? response.json() : { user: null }
      )
      .then((data) => setUser(data.user))
      .catch(() => setUser(null));
  }, []);

  /* =========================================================
     HELPERS
  ========================================================= */

  const resetRequirements = () => {
    setRequirements({ ...emptyRequirements });
  };

  const updateRequirement = (field, value) => {
    setRequirements((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPropertyType("");
    setLocation("");
    setShowLocations(false);
    resetRequirements();
  };

  const handlePropertyTypeChange = (type) => {
    setPropertyType(type);
    resetRequirements();
  };

  const handleLocationSelect = (selectedLocation) => {
    setLocation(selectedLocation.name);
    setShowLocations(false);
  };

  const handleSearch = () => {
    if (!location || !propertyType) return;

    const searchData = {
      purpose: activeTab,
      propertyType,
      location,
      requirements,
    };

    console.log("PROPERTY SEARCH:", searchData);
  };

  /* =========================================================
     INPUT FIELD
  ========================================================= */

  const InputField = ({
    label,
    placeholder,
    value,
    onChange,
    type = "text",
    icon,
  }) => {
    return (
      <div className="group rounded-2xl border border-slate-200 bg-white px-4 py-3.5 transition-all duration-200 hover:border-[#e5a92f]/60 hover:shadow-md focus-within:border-[#d99a1f] focus-within:ring-4 focus-within:ring-[#e5a92f]/10">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
            {label}
          </label>

          {icon && (
            <span className="text-[#d99a1f] opacity-70">
              {icon}
            </span>
          )}
        </div>

        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="mt-2 w-full bg-transparent text-[15px] font-semibold text-slate-800 outline-none placeholder:text-slate-400"
        />
      </div>
    );
  };

  /* =========================================================
     SELECT FIELD
  ========================================================= */

  const SelectField = ({
    label,
    value,
    onChange,
    options,
    placeholder,
    icon,
  }) => {
    return (
      <div className="group rounded-2xl border border-slate-200 bg-white px-4 py-3.5 transition-all duration-200 hover:border-[#e5a92f]/60 hover:shadow-md focus-within:border-[#d99a1f] focus-within:ring-4 focus-within:ring-[#e5a92f]/10">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
            {label}
          </label>

          {icon && (
            <span className="text-[#d99a1f] opacity-70">
              {icon}
            </span>
          )}
        </div>

        <div className="relative">
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="mt-2 w-full cursor-pointer appearance-none bg-transparent pr-7 text-[15px] font-semibold text-slate-800 outline-none"
          >
            <option value="">{placeholder}</option>

            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          <ChevronDown className="pointer-events-none absolute right-0 bottom-0.5 h-4 w-4 text-slate-400" />
        </div>
      </div>
    );
  };

  /* =========================================================
     SECTION TITLE
  ========================================================= */

  const SectionTitle = ({ icon, title, description }) => {
    return (
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#e5a92f]/10 text-[#d99a1f]">
          {icon}
        </div>

        <div>
          <h4 className="text-sm font-extrabold text-slate-800">
            {title}
          </h4>

          {description && (
            <p className="mt-0.5 text-[11px] text-slate-400">
              {description}
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <section className="relative w-full overflow-visible bg-slate-950">

      {/* =====================================================
          BACKGROUND
      ====================================================== */}

      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2200&q=90')",
        }}
      />

      {/* DARK OVERLAY */}

      <div className="absolute inset-0 bg-slate-950/55" />

      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-950/40 to-slate-950/95" />

      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/50 via-transparent to-slate-950/40" />

      {/* GOLD GLOW */}

      <div className="pointer-events-none absolute -left-40 top-32 h-96 w-96 rounded-full bg-[#e5a92f]/10 blur-3xl" />

      <div className="pointer-events-none absolute -right-40 bottom-20 h-96 w-96 rounded-full bg-[#e5a92f]/10 blur-3xl" />

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-12 pt-24 sm:px-6 lg:px-8">

        {/* BADGE */}

        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold text-white backdrop-blur-xl">
            <span className="relative flex h-2 w-2">
              <span className="absolute h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative h-2 w-2 rounded-full bg-emerald-400" />
            </span>

            <ShieldCheck className="h-4 w-4 text-[#f4c35b]" />

            Verified Properties Across India
          </div>
        </div>

        {/* HEADING */}

        <div className="mx-auto mt-7 max-w-4xl text-center">
          <h1 className="text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
            Find Your
            <span className="block bg-gradient-to-r from-[#f7c95c] via-[#fff1b8] to-[#e5a92f] bg-clip-text text-transparent">
              Dream Property
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-white/75 sm:text-base">
            Discover verified homes, apartments, plots and properties
            at the right price and the right location.
          </p>
        </div>

        {/* =====================================================
            SEARCH CARD
        ====================================================== */}

        <div className="mx-auto mt-9 w-full max-w-6xl rounded-[30px] border border-white/70 bg-white p-3 shadow-2xl sm:p-5">

          {/* BUY / RENT */}

          <div className="flex justify-center sm:justify-start">
            <div className="inline-flex rounded-xl bg-slate-100 p-1">
              {["Buy", "Rent"].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => handleTabChange(tab)}
                  className={`flex min-w-[110px] items-center justify-center gap-2 rounded-lg px-6 py-2.5 text-sm font-bold transition-all ${
                    activeTab === tab
                      ? "bg-white text-[#c88915] shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {tab === "Buy" ? (
                    <Home className="h-4 w-4" />
                  ) : (
                    <KeyRound className="h-4 w-4" />
                  )}

                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* =================================================
              LOCATION + PROPERTY TYPE
          ================================================== */}

          <div className="mt-5 grid gap-4 lg:grid-cols-2">

            {/* LOCATION */}

            <div className="relative rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 transition-all hover:border-[#e5a92f]/60 focus-within:border-[#d99a1f] focus-within:ring-4 focus-within:ring-[#e5a92f]/10">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e5a92f]/10">
                  <MapPin className="h-5 w-5 text-[#d99a1f]" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    Location
                  </p>

                  <input
                    type="text"
                    value={location}
                    onChange={(e) => {
                      setLocation(e.target.value);
                      setShowLocations(true);
                    }}
                    onFocus={() => {
                      if (location.trim()) {
                        setShowLocations(true);
                      }
                    }}
                    placeholder="Search city, locality or project"
                    className="mt-1.5 w-full bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400 sm:text-base"
                  />
                </div>

                {location && (
                  <span className="hidden rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-600 sm:block">
                    Selected
                  </span>
                )}
              </div>

              {/* LOCATION DROPDOWN */}

              {showLocations && locationSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-[82px] z-[100] max-h-72 overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl">

                  <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-4 py-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                      Suggested Locations
                    </p>

                    <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-500">
                      {locationSuggestions.length} results
                    </span>
                  </div>

                  {locationSuggestions.map((item, index) => (
                    <button
                      key={`${item.name}-${item.city || ""}-${index}`}
                      type="button"
                      onClick={() => handleLocationSelect(item)}
                      className="group flex w-full items-center gap-3 border-b border-slate-50 px-4 py-3 text-left last:border-0 hover:bg-[#fffaf0]"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 group-hover:bg-[#e5a92f]/10">
                        <MapPin className="h-4 w-4 text-slate-400 group-hover:text-[#d99a1f]" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-slate-800">
                          {item.name}
                        </p>

                        <p className="mt-0.5 text-xs text-slate-400">
                          {item.type === "City"
                            ? "City"
                            : item.city}
                        </p>
                      </div>

                      <ArrowRight className="h-4 w-4 text-slate-300 group-hover:translate-x-1 group-hover:text-[#d99a1f]" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* PROPERTY TYPE */}

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 transition-all hover:border-[#e5a92f]/60 focus-within:border-[#d99a1f] focus-within:ring-4 focus-within:ring-[#e5a92f]/10">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e5a92f]/10">
                  <Home className="h-5 w-5 text-[#d99a1f]" />
                </div>

                <div className="relative flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                    Property Type
                  </p>

                  <select
                    value={propertyType}
                    onChange={(e) =>
                      handlePropertyTypeChange(e.target.value)
                    }
                    className="mt-1.5 w-full cursor-pointer appearance-none bg-transparent pr-8 text-sm font-semibold text-slate-800 outline-none sm:text-base"
                  >
                    <option value="">
                      Select Property Type
                    </option>

                    {propertyTypes[activeTab].map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>

                  <ChevronDown className="pointer-events-none absolute right-1 bottom-0 h-5 w-5 text-slate-400" />
                </div>
              </div>
            </div>
          </div>

          {/* =================================================
              DYNAMIC REQUIREMENTS
          ================================================== */}

          {propertyType && (
            <div className="mt-5 rounded-[26px] border border-slate-200 bg-[#fafafa] p-5 sm:p-7">

              {/* HEADER */}

              <div className="mb-7 flex items-center gap-3 border-b border-slate-200 pb-5">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#e5a92f]/10 text-[#d99a1f]">
                  {propertyType === "Plot" ? (
                    <LandPlot className="h-5 w-5" />
                  ) : (
                    <Sparkles className="h-5 w-5" />
                  )}
                </div>

                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    {activeTab} {propertyType} Requirements
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Tell us what you are looking for
                  </p>
                </div>
              </div>

              {/* =================================================
                  PLOT
              ================================================== */}

              {propertyType === "Plot" && (
                <div className="space-y-7">

                  {/* PLOT DETAILS */}

                  <div>
                    <SectionTitle
                      icon={<LandPlot className="h-4 w-4" />}
                      title="Plot Details"
                      description="Choose your preferred plot type and size"
                    />

                    <div className="grid gap-4 sm:grid-cols-2">

                      <SelectField
                        label="Plot Type"
                        placeholder="Select Plot Type"
                        value={requirements.plotType}
                        onChange={(value) =>
                          updateRequirement("plotType", value)
                        }
                        options={[
                          "Residential Plot",
                          "Commercial Plot",
                          "Agricultural Land",
                          "Industrial Plot",
                        ]}
                        icon={<LandPlot className="h-4 w-4" />}
                      />

                      <InputField
                        label="Minimum Area"
                        placeholder="e.g. 1000"
                        type="number"
                        value={requirements.minArea}
                        onChange={(value) =>
                          updateRequirement("minArea", value)
                        }
                        icon={<Ruler className="h-4 w-4" />}
                      />

                      <InputField
                        label="Maximum Area"
                        placeholder="e.g. 2000"
                        type="number"
                        value={requirements.maxArea}
                        onChange={(value) =>
                          updateRequirement("maxArea", value)
                        }
                      />

                      <SelectField
                        label="Area Unit"
                        placeholder="Select Unit"
                        value={requirements.areaUnit}
                        onChange={(value) =>
                          updateRequirement("areaUnit", value)
                        }
                        options={[
                          "sq.ft",
                          "sq.yd",
                          "sq.m",
                          "Bigha",
                          "Acre",
                        ]}
                        icon={<SquareDashed className="h-4 w-4" />}
                      />
                    </div>
                  </div>

                  {/* PLOT PREFERENCE */}

                  <div className="border-t border-slate-200 pt-7">

                    <SectionTitle
                      icon={<Compass className="h-4 w-4" />}
                      title="Plot Preference"
                      description="Select facing, road and plot preferences"
                    />

                    <div className="grid gap-4 sm:grid-cols-2">

                      <SelectField
                        label="Facing"
                        placeholder="Any Facing"
                        value={requirements.facing}
                        onChange={(value) =>
                          updateRequirement("facing", value)
                        }
                        options={[
                          "East",
                          "West",
                          "North",
                          "South",
                          "North-East",
                          "North-West",
                          "South-East",
                          "South-West",
                        ]}
                        icon={<Compass className="h-4 w-4" />}
                      />

                      <SelectField
                        label="Road Width"
                        placeholder="Any Width"
                        value={requirements.roadWidth}
                        onChange={(value) =>
                          updateRequirement("roadWidth", value)
                        }
                        options={[
                          "20 ft",
                          "25 ft",
                          "30 ft",
                          "40 ft",
                          "50 ft",
                          "60 ft+",
                        ]}
                        icon={<Route className="h-4 w-4" />}
                      />

                      <SelectField
                        label="Corner Plot"
                        placeholder="Any"
                        value={requirements.cornerPlot}
                        onChange={(value) =>
                          updateRequirement("cornerPlot", value)
                        }
                        options={[
                          "Yes - Corner Plot",
                          "No",
                          "Any",
                        ]}
                        icon={<SquareDashed className="h-4 w-4" />}
                      />

                      <SelectField
                        label="Gated Society"
                        placeholder="Any"
                        value={requirements.gatedSociety}
                        onChange={(value) =>
                          updateRequirement("gatedSociety", value)
                        }
                        options={[
                          "Yes",
                          "No",
                          "Any",
                        ]}
                      />
                    </div>
                  </div>

                  {/* BUDGET / RENT */}

                  <div className="border-t border-slate-200 pt-7">

                    <SectionTitle
                      icon={<Wallet className="h-4 w-4" />}
                      title={
                        activeTab === "Buy"
                          ? "Budget"
                          : "Rental Preference"
                      }
                      description={
                        activeTab === "Buy"
                          ? "Set your preferred property budget"
                          : "Set your preferred monthly rent"
                      }
                    />

                    <div className="grid gap-4 sm:grid-cols-2">

                      {activeTab === "Buy" ? (
                        <>
                          <InputField
                            label="Minimum Budget"
                            placeholder="₹ Min"
                            type="number"
                            value={requirements.minBudget}
                            onChange={(value) =>
                              updateRequirement(
                                "minBudget",
                                value
                              )
                            }
                            icon={
                              <Wallet className="h-4 w-4" />
                            }
                          />

                          <InputField
                            label="Maximum Budget"
                            placeholder="₹ Max"
                            type="number"
                            value={requirements.maxBudget}
                            onChange={(value) =>
                              updateRequirement(
                                "maxBudget",
                                value
                              )
                            }
                          />
                        </>
                      ) : (
                        <>
                          <InputField
                            label="Monthly Rent"
                            placeholder="₹ e.g. 15000"
                            type="number"
                            value={requirements.rent}
                            onChange={(value) =>
                              updateRequirement(
                                "rent",
                                value
                              )
                            }
                            icon={
                              <Wallet className="h-4 w-4" />
                            }
                          />

                          <SelectField
                            label="Availability"
                            placeholder="Any"
                            value={requirements.availability}
                            onChange={(value) =>
                              updateRequirement(
                                "availability",
                                value
                              )
                            }
                            options={[
                              "Immediately",
                              "Within 15 Days",
                              "Within 1 Month",
                            ]}
                          />
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* =================================================
                  HOUSE
              ================================================== */}

              {propertyType === "House" && (
                <div className="space-y-7">

                  {/* BASIC DETAILS */}

                  <div>
                    <SectionTitle
                      icon={<Home className="h-4 w-4" />}
                      title="Basic Details"
                      description="Tell us about the house you need"
                    />

                    <div className="grid gap-4 sm:grid-cols-2">

                      <SelectField
                        label="BHK"
                        placeholder="Select BHK"
                        value={requirements.bhk}
                        onChange={(value) =>
                          updateRequirement("bhk", value)
                        }
                        options={[
                          "1 BHK",
                          "2 BHK",
                          "3 BHK",
                          "4 BHK",
                          "5 BHK",
                          "5+ BHK",
                        ]}
                        icon={
                          <BedDouble className="h-4 w-4" />
                        }
                      />

                      <InputField
                        label="Built-up Area"
                        placeholder="e.g. 1500 sq.ft"
                        type="number"
                        value={requirements.builtUpArea}
                        onChange={(value) =>
                          updateRequirement(
                            "builtUpArea",
                            value
                          )
                        }
                        icon={
                          <Ruler className="h-4 w-4" />
                        }
                      />

                      <InputField
                        label="Plot Area"
                        placeholder="e.g. 1000 sq.ft"
                        type="number"
                        value={requirements.plotArea}
                        onChange={(value) =>
                          updateRequirement(
                            "plotArea",
                            value
                          )
                        }
                      />

                      <SelectField
                        label="Bathrooms"
                        placeholder="Any"
                        value={requirements.bathrooms}
                        onChange={(value) =>
                          updateRequirement(
                            "bathrooms",
                            value
                          )
                        }
                        options={[
                          "1",
                          "2",
                          "3",
                          "4",
                          "5+",
                        ]}
                        icon={<Bath className="h-4 w-4" />}
                      />
                    </div>
                  </div>

                  {/* FEATURES */}

                  <div className="border-t border-slate-200 pt-7">

                    <SectionTitle
                      icon={<Sparkles className="h-4 w-4" />}
                      title="Property Features"
                      description="Choose your preferred features"
                    />

                    <div className="grid gap-4 sm:grid-cols-2">

                      <SelectField
                        label="Floors"
                        placeholder="Any"
                        value={requirements.totalFloors}
                        onChange={(value) =>
                          updateRequirement(
                            "totalFloors",
                            value
                          )
                        }
                        options={[
                          "Ground Floor",
                          "G+1",
                          "G+2",
                          "G+3",
                          "G+4",
                          "G+5+",
                        ]}
                        icon={
                          <Layers3 className="h-4 w-4" />
                        }
                      />

                      <SelectField
                        label="Parking"
                        placeholder="Any"
                        value={requirements.parking}
                        onChange={(value) =>
                          updateRequirement(
                            "parking",
                            value
                          )
                        }
                        options={[
                          "No Parking",
                          "1 Car",
                          "2 Cars",
                          "3+ Cars",
                        ]}
                        icon={<Car className="h-4 w-4" />}
                      />

                      <SelectField
                        label="Furnishing"
                        placeholder="Any"
                        value={requirements.furnishing}
                        onChange={(value) =>
                          updateRequirement(
                            "furnishing",
                            value
                          )
                        }
                        options={[
                          "Unfurnished",
                          "Semi Furnished",
                          "Fully Furnished",
                        ]}
                      />

                      <SelectField
                        label="Facing"
                        placeholder="Any Facing"
                        value={requirements.facing}
                        onChange={(value) =>
                          updateRequirement(
                            "facing",
                            value
                          )
                        }
                        options={[
                          "East",
                          "West",
                          "North",
                          "South",
                          "North-East",
                          "North-West",
                          "South-East",
                          "South-West",
                        ]}
                        icon={
                          <Compass className="h-4 w-4" />
                        }
                      />
                    </div>
                  </div>

                  {/* BUDGET */}

                  <div className="border-t border-slate-200 pt-7">

                    <SectionTitle
                      icon={<Wallet className="h-4 w-4" />}
                      title={
                        activeTab === "Buy"
                          ? "Budget"
                          : "Rental Preference"
                      }
                      description={
                        activeTab === "Buy"
                          ? "Set your preferred budget"
                          : "Set your monthly rent preference"
                      }
                    />

                    <div className="grid gap-4 sm:grid-cols-2">

                      {activeTab === "Buy" ? (
                        <>
                          <InputField
                            label="Minimum Budget"
                            placeholder="₹ Min"
                            type="number"
                            value={requirements.minBudget}
                            onChange={(value) =>
                              updateRequirement(
                                "minBudget",
                                value
                              )
                            }
                            icon={
                              <Wallet className="h-4 w-4" />
                            }
                          />

                          <InputField
                            label="Maximum Budget"
                            placeholder="₹ Max"
                            type="number"
                            value={requirements.maxBudget}
                            onChange={(value) =>
                              updateRequirement(
                                "maxBudget",
                                value
                              )
                            }
                          />
                        </>
                      ) : (
                        <>
                          <InputField
                            label="Monthly Rent"
                            placeholder="₹ e.g. 20000"
                            type="number"
                            value={requirements.rent}
                            onChange={(value) =>
                              updateRequirement(
                                "rent",
                                value
                              )
                            }
                            icon={
                              <Wallet className="h-4 w-4" />
                            }
                          />

                          <SelectField
                            label="Availability"
                            placeholder="Any"
                            value={requirements.availability}
                            onChange={(value) =>
                              updateRequirement(
                                "availability",
                                value
                              )
                            }
                            options={[
                              "Immediately",
                              "Within 15 Days",
                              "Within 1 Month",
                            ]}
                          />
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* =================================================
                  FLAT
              ================================================== */}

              {propertyType === "Flat" && (
                <div className="space-y-7">

                  {/* BASIC */}

                  <div>
                    <SectionTitle
                      icon={<Home className="h-4 w-4" />}
                      title="Basic Details"
                      description="Choose your preferred flat"
                    />

                    <div className="grid gap-4 sm:grid-cols-2">

                      <SelectField
                        label="BHK"
                        placeholder="Select BHK"
                        value={requirements.bhk}
                        onChange={(value) =>
                          updateRequirement("bhk", value)
                        }
                        options={[
                          "1 BHK",
                          "2 BHK",
                          "3 BHK",
                          "4 BHK",
                          "5 BHK",
                          "5+ BHK",
                        ]}
                        icon={
                          <BedDouble className="h-4 w-4" />
                        }
                      />

                      <SelectField
                        label="Preferred Floor"
                        placeholder="Any Floor"
                        value={requirements.floor}
                        onChange={(value) =>
                          updateRequirement("floor", value)
                        }
                        options={[
                          "Ground Floor",
                          "1st Floor",
                          "2nd Floor",
                          "3rd Floor",
                          "4th Floor",
                          "5th Floor",
                          "6th Floor",
                          "7th Floor",
                          "8th Floor",
                          "9th Floor",
                          "10th Floor",
                          "11th Floor",
                          "12th Floor",
                          "13th Floor",
                          "14th Floor",
                          "15th Floor",
                          "16th Floor",
                          "17th Floor",
                          "18th Floor",
                          "19th Floor",
                          "20th Floor",
                          "21st+ Floor",
                        ]}
                        icon={
                          <Layers3 className="h-4 w-4" />
                        }
                      />

                      <InputField
                        label="Min Carpet Area"
                        placeholder="e.g. 800"
                        type="number"
                        value={requirements.minArea}
                        onChange={(value) =>
                          updateRequirement(
                            "minArea",
                            value
                          )
                        }
                        icon={
                          <Ruler className="h-4 w-4" />
                        }
                      />

                      <InputField
                        label="Max Carpet Area"
                        placeholder="e.g. 1500"
                        type="number"
                        value={requirements.maxArea}
                        onChange={(value) =>
                          updateRequirement(
                            "maxArea",
                            value
                          )
                        }
                      />
                    </div>
                  </div>

                  {/* FEATURES */}

                  <div className="border-t border-slate-200 pt-7">

                    <SectionTitle
                      icon={<Sparkles className="h-4 w-4" />}
                      title="Property Features"
                      description="Select additional preferences"
                    />

                    <div className="grid gap-4 sm:grid-cols-2">

                      <SelectField
                        label="Bathrooms"
                        placeholder="Any"
                        value={requirements.bathrooms}
                        onChange={(value) =>
                          updateRequirement(
                            "bathrooms",
                            value
                          )
                        }
                        options={[
                          "1",
                          "2",
                          "3",
                          "4",
                          "5+",
                        ]}
                        icon={<Bath className="h-4 w-4" />}
                      />

                      <SelectField
                        label="Parking"
                        placeholder="Any"
                        value={requirements.parking}
                        onChange={(value) =>
                          updateRequirement(
                            "parking",
                            value
                          )
                        }
                        options={[
                          "No Parking",
                          "1 Car",
                          "2 Cars",
                          "3+ Cars",
                        ]}
                        icon={<Car className="h-4 w-4" />}
                      />

                      <SelectField
                        label="Furnishing"
                        placeholder="Any"
                        value={requirements.furnishing}
                        onChange={(value) =>
                          updateRequirement(
                            "furnishing",
                            value
                          )
                        }
                        options={[
                          "Unfurnished",
                          "Semi Furnished",
                          "Fully Furnished",
                        ]}
                      />

                      {activeTab === "Buy" && (
                        <SelectField
                          label="Possession"
                          placeholder="Any"
                          value={requirements.possession}
                          onChange={(value) =>
                            updateRequirement(
                              "possession",
                              value
                            )
                          }
                          options={[
                            "Ready to Move",
                            "Within 3 Months",
                            "Within 6 Months",
                            "Under Construction",
                            "New Launch",
                          ]}
                        />
                      )}
                    </div>
                  </div>

                  {/* BUDGET */}

                  <div className="border-t border-slate-200 pt-7">

                    <SectionTitle
                      icon={<Wallet className="h-4 w-4" />}
                      title={
                        activeTab === "Buy"
                          ? "Budget"
                          : "Rental Preference"
                      }
                      description={
                        activeTab === "Buy"
                          ? "Set your preferred budget"
                          : "Set your monthly rent"
                      }
                    />

                    <div className="grid gap-4 sm:grid-cols-2">

                      {activeTab === "Buy" ? (
                        <>
                          <InputField
                            label="Minimum Budget"
                            placeholder="₹ Min"
                            type="number"
                            value={requirements.minBudget}
                            onChange={(value) =>
                              updateRequirement(
                                "minBudget",
                                value
                              )
                            }
                            icon={
                              <Wallet className="h-4 w-4" />
                            }
                          />

                          <InputField
                            label="Maximum Budget"
                            placeholder="₹ Max"
                            type="number"
                            value={requirements.maxBudget}
                            onChange={(value) =>
                              updateRequirement(
                                "maxBudget",
                                value
                              )
                            }
                          />
                        </>
                      ) : (
                        <>
                          <InputField
                            label="Monthly Rent"
                            placeholder="₹ e.g. 20000"
                            type="number"
                            value={requirements.rent}
                            onChange={(value) =>
                              updateRequirement(
                                "rent",
                                value
                              )
                            }
                            icon={
                              <Wallet className="h-4 w-4" />
                            }
                          />

                          <SelectField
                            label="Availability"
                            placeholder="Any"
                            value={requirements.availability}
                            onChange={(value) =>
                              updateRequirement(
                                "availability",
                                value
                              )
                            }
                            options={[
                              "Immediately",
                              "Within 15 Days",
                              "Within 1 Month",
                            ]}
                          />
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* =================================================
                  BUILDER FLOOR
              ================================================== */}

              {activeTab === "Buy" &&
                propertyType === "Builder Floor" && (
                  <div className="space-y-7">

                    <div>
                      <SectionTitle
                        icon={<Building2 className="h-4 w-4" />}
                        title="Basic Details"
                        description="Choose your preferred builder floor"
                      />

                      <div className="grid gap-4 sm:grid-cols-2">

                        <SelectField
                          label="BHK"
                          placeholder="Select BHK"
                          value={requirements.bhk}
                          onChange={(value) =>
                            updateRequirement(
                              "bhk",
                              value
                            )
                          }
                          options={[
                            "1 BHK",
                            "2 BHK",
                            "3 BHK",
                            "4 BHK",
                            "5 BHK",
                          ]}
                          icon={
                            <BedDouble className="h-4 w-4" />
                          }
                        />

                        <SelectField
                          label="Preferred Floor"
                          placeholder="Any Floor"
                          value={requirements.floor}
                          onChange={(value) =>
                            updateRequirement(
                              "floor",
                              value
                            )
                          }
                          options={[
                            "Ground Floor",
                            "1st Floor",
                            "2nd Floor",
                            "3rd Floor",
                            "4th Floor",
                            "5th Floor",
                          ]}
                          icon={
                            <Layers3 className="h-4 w-4" />
                          }
                        />

                        <InputField
                          label="Carpet Area"
                          placeholder="e.g. 1200"
                          type="number"
                          value={requirements.minArea}
                          onChange={(value) =>
                            updateRequirement(
                              "minArea",
                              value
                            )
                          }
                          icon={
                            <Ruler className="h-4 w-4" />
                          }
                        />

                        <SelectField
                          label="Bathrooms"
                          placeholder="Any"
                          value={requirements.bathrooms}
                          onChange={(value) =>
                            updateRequirement(
                              "bathrooms",
                              value
                            )
                          }
                          options={[
                            "1",
                            "2",
                            "3",
                            "4",
                            "5+",
                          ]}
                          icon={
                            <Bath className="h-4 w-4" />
                          }
                        />
                      </div>
                    </div>

                    <div className="border-t border-slate-200 pt-7">

                      <SectionTitle
                        icon={<Sparkles className="h-4 w-4" />}
                        title="Property Features"
                        description="Choose your preferred features"
                      />

                      <div className="grid gap-4 sm:grid-cols-2">

                        <SelectField
                          label="Parking"
                          placeholder="Any"
                          value={requirements.parking}
                          onChange={(value) =>
                            updateRequirement(
                              "parking",
                              value
                            )
                          }
                          options={[
                            "No Parking",
                            "1 Car",
                            "2 Cars",
                            "3+ Cars",
                          ]}
                          icon={
                            <Car className="h-4 w-4" />
                          }
                        />

                        <SelectField
                          label="Furnishing"
                          placeholder="Any"
                          value={requirements.furnishing}
                          onChange={(value) =>
                            updateRequirement(
                              "furnishing",
                              value
                            )
                          }
                          options={[
                            "Unfurnished",
                            "Semi Furnished",
                            "Fully Furnished",
                          ]}
                        />

                        <InputField
                          label="Minimum Budget"
                          placeholder="₹ Min"
                          type="number"
                          value={requirements.minBudget}
                          onChange={(value) =>
                            updateRequirement(
                              "minBudget",
                              value
                            )
                          }
                          icon={
                            <Wallet className="h-4 w-4" />
                          }
                        />

                        <InputField
                          label="Maximum Budget"
                          placeholder="₹ Max"
                          type="number"
                          value={requirements.maxBudget}
                          onChange={(value) =>
                            updateRequirement(
                              "maxBudget",
                              value
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>
                )}

              {/* =================================================
                  PG / ROOM
              ================================================== */}

              {activeTab === "Rent" &&
                propertyType === "PG / Room" && (
                  <div className="space-y-7">

                    <div>
                      <SectionTitle
                        icon={<BedDouble className="h-4 w-4" />}
                        title="Room Details"
                        description="Tell us about your room preference"
                      />

                      <div className="grid gap-4 sm:grid-cols-2">

                        <SelectField
                          label="Room Type"
                          placeholder="Select Room"
                          value={requirements.bhk}
                          onChange={(value) =>
                            updateRequirement(
                              "bhk",
                              value
                            )
                          }
                          options={[
                            "Single Room",
                            "Double Sharing",
                            "Triple Sharing",
                            "1 BHK",
                            "2 BHK",
                          ]}
                          icon={
                            <BedDouble className="h-4 w-4" />
                          }
                        />

                        <InputField
                          label="Monthly Rent"
                          placeholder="₹ e.g. 10000"
                          type="number"
                          value={requirements.rent}
                          onChange={(value) =>
                            updateRequirement(
                              "rent",
                              value
                            )
                          }
                          icon={
                            <Wallet className="h-4 w-4" />
                          }
                        />

                        <SelectField
                          label="Furnishing"
                          placeholder="Any"
                          value={requirements.furnishing}
                          onChange={(value) =>
                            updateRequirement(
                              "furnishing",
                              value
                            )
                          }
                          options={[
                            "Unfurnished",
                            "Semi Furnished",
                            "Fully Furnished",
                          ]}
                        />

                        <SelectField
                          label="Availability"
                          placeholder="Any"
                          value={requirements.availability}
                          onChange={(value) =>
                            updateRequirement(
                              "availability",
                              value
                            )
                          }
                          options={[
                            "Immediately",
                            "Within 15 Days",
                            "Within 1 Month",
                          ]}
                        />

                        <SelectField
                          label="Parking"
                          placeholder="Any"
                          value={requirements.parking}
                          onChange={(value) =>
                            updateRequirement(
                              "parking",
                              value
                            )
                          }
                          options={[
                            "No Parking",
                            "1 Car",
                            "2 Cars",
                          ]}
                          icon={
                            <Car className="h-4 w-4" />
                          }
                        />
                      </div>
                    </div>
                  </div>
                )}
            </div>
          )}

          {/* =================================================
              SEARCH BUTTON
          ================================================== */}

          <button
            type="button"
            onClick={handleSearch}
            disabled={!location || !propertyType}
            className={`group mt-5 flex min-h-[62px] w-full items-center justify-center gap-3 rounded-2xl text-sm font-extrabold transition-all duration-300 ${
              location && propertyType
                ? "bg-gradient-to-r from-[#c88915] via-[#e5a92f] to-[#f0c451] text-white shadow-lg shadow-[#d99a1f]/25 hover:-translate-y-0.5 hover:shadow-xl"
                : "cursor-not-allowed bg-slate-100 text-slate-400"
            }`}
          >
            <Search className="h-5 w-5 transition-transform group-hover:scale-110" />

            Search Properties

            {location && propertyType && (
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            )}
          </button>

          {/* =================================================
              SEARCH SUMMARY
          ================================================== */}

          {(propertyType || location) && (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">

              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">

                <span>Searching for</span>

                <span className="rounded-full bg-slate-900 px-3 py-1 font-bold text-white">
                  {activeTab}
                </span>

                {propertyType && (
                  <>
                    <span className="text-slate-300">
                      •
                    </span>

                    <span className="rounded-full bg-[#e5a92f]/10 px-3 py-1 font-bold text-[#b77d0e]">
                      {propertyType}
                    </span>
                  </>
                )}

                {location && (
                  <>
                    <span className="text-slate-300">
                      •
                    </span>

                    <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 font-bold text-emerald-700">
                      <MapPin className="h-3 w-3" />
                      {location}
                    </span>
                  </>
                )}
              </div>

              {/* FLAT SUMMARY */}

              {propertyType === "Flat" &&
                requirements.bhk && (
                  <div className="mt-2 text-xs font-medium text-slate-500">
                    {requirements.bhk}

                    {requirements.floor &&
                      ` • ${requirements.floor}`}

                    {requirements.minArea &&
                      ` • ${requirements.minArea}+ sq.ft`}

                    {activeTab === "Rent" &&
                      requirements.rent &&
                      ` • ₹${requirements.rent}/month`}

                    {activeTab === "Buy" &&
                      requirements.maxBudget &&
                      ` • Budget ₹${requirements.maxBudget}`}
                  </div>
                )}

              {/* PLOT SUMMARY */}

              {propertyType === "Plot" &&
                (requirements.minArea ||
                  requirements.plotType ||
                  requirements.facing ||
                  requirements.maxBudget ||
                  requirements.rent) && (
                  <div className="mt-3 flex flex-wrap gap-1.5">

                    {requirements.plotType && (
                      <span className="rounded-full bg-[#e5a92f]/10 px-2.5 py-1 font-semibold text-[#a8730e]">
                        {requirements.plotType}
                      </span>
                    )}

                    {requirements.minArea && (
                      <span className="rounded-full bg-white px-2.5 py-1 font-semibold text-slate-600">
                        {requirements.minArea}

                        {requirements.maxArea
                          ? ` - ${requirements.maxArea}`
                          : "+"}{" "}

                        {requirements.areaUnit}
                      </span>
                    )}

                    {requirements.facing && (
                      <span className="rounded-full bg-white px-2.5 py-1 font-semibold text-slate-600">
                        {requirements.facing} Facing
                      </span>
                    )}

                    {requirements.roadWidth && (
                      <span className="rounded-full bg-white px-2.5 py-1 font-semibold text-slate-600">
                        {requirements.roadWidth} Road
                      </span>
                    )}

                    {requirements.cornerPlot ===
                      "Yes - Corner Plot" && (
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-700">
                        Corner Plot
                      </span>
                    )}

                    {requirements.gatedSociety === "Yes" && (
                      <span className="rounded-full bg-blue-50 px-2.5 py-1 font-semibold text-blue-700">
                        Gated Society
                      </span>
                    )}

                    {activeTab === "Rent" &&
                      requirements.rent && (
                        <span className="rounded-full bg-[#e5a92f]/10 px-2.5 py-1 font-semibold text-[#a8730e]">
                          ₹{requirements.rent}/month
                        </span>
                      )}

                    {activeTab === "Buy" &&
                      requirements.maxBudget && (
                        <span className="rounded-full bg-[#e5a92f]/10 px-2.5 py-1 font-semibold text-[#a8730e]">
                          Budget ₹{requirements.maxBudget}
                        </span>
                      )}
                  </div>
                )}

              {/* HOUSE SUMMARY */}

              {propertyType === "House" &&
                requirements.bhk && (
                  <div className="mt-2 text-xs font-medium text-slate-500">
                    {requirements.bhk}

                    {requirements.builtUpArea &&
                      ` • ${requirements.builtUpArea} sq.ft built-up`}

                    {activeTab === "Rent" &&
                      requirements.rent &&
                      ` • ₹${requirements.rent}/month`}
                  </div>
                )}

              {/* BUILDER FLOOR SUMMARY */}

              {propertyType === "Builder Floor" &&
                requirements.bhk && (
                  <div className="mt-2 text-xs font-medium text-slate-500">
                    {requirements.bhk}

                    {requirements.floor &&
                      ` • ${requirements.floor}`}

                    {requirements.minArea &&
                      ` • ${requirements.minArea} sq.ft`}
                  </div>
                )}

              {/* PG SUMMARY */}

              {propertyType === "PG / Room" &&
                requirements.rent && (
                  <div className="mt-2 text-xs font-medium text-slate-500">
                    ₹{requirements.rent}/month
                  </div>
                )}
            </div>
          )}
        </div>

        {/* =====================================================
            QUICK ACTIONS
        ====================================================== */}

        <div className="mt-7 flex flex-wrap justify-center gap-3">

          <button
            type="button"
            onClick={() => {
              setActiveTab("Buy");
              setPropertyType("");
              setLocation("");
              resetRequirements();
            }}
            className="group flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:bg-white hover:text-slate-900"
          >
            <Building2 className="h-4 w-4" />

            New Projects
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("Buy");
              setPropertyType("House");
              setLocation("");
              resetRequirements();
            }}
            className="group flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:bg-white hover:text-slate-900"
          >
            <KeyRound className="h-4 w-4" />

            Resale Properties
          </button>

          {user?.verificationStatus === "ACTIVE" && (
            <button
              type="button"
              onClick={() =>
                window.location.assign("/listings/new")
              }
              className="group flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-slate-900 shadow-xl transition-all hover:-translate-y-0.5 hover:bg-[#e5a92f] hover:text-white"
            >
              Post Property FREE

              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          )}
        </div>

        {/* =====================================================
            STATS
        ====================================================== */}

        <div className="mx-auto mt-10 max-w-2xl rounded-2xl border border-white/10 bg-black/20 px-5 py-5 backdrop-blur-md">

          <div className="grid grid-cols-3 divide-x divide-white/10">

            <div className="text-center">
              <p className="text-xl font-black text-white sm:text-2xl">
                50K+
              </p>

              <p className="mt-1 text-[9px] font-semibold uppercase tracking-wider text-white/50 sm:text-xs">
                Properties
              </p>
            </div>

            <div className="text-center">
              <p className="text-xl font-black text-white sm:text-2xl">
                25K+
              </p>

              <p className="mt-1 text-[9px] font-semibold uppercase tracking-wider text-white/50 sm:text-xs">
                Happy Customers
              </p>
            </div>

            <div className="text-center">
              <p className="text-xl font-black text-white sm:text-2xl">
                100%
              </p>

              <p className="mt-1 text-[9px] font-semibold uppercase tracking-wider text-white/50 sm:text-xs">
                Verified
              </p>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}