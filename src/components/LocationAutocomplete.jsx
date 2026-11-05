"use client";

import React, { useState, useEffect, useRef } from "react";
import { MapPin, Search, X, Check, Building2 } from "lucide-react";
import { searchLocations } from "@/lib/indianLocations";

export default function LocationAutocomplete({
  value = "",
  onChange,
  onSelect,
  placeholder = "Search City, Locality, Sector, or PIN Code...",
  required = false,
  className = "",
  id = "preferred-location-input",
  name = "preferredLocation",
}) {
  const [query, setQuery] = useState(value || "");
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    setQuery(value || "");
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const text = e.target.value;
    setQuery(text);
    if (onChange) onChange(text);

    if (text.trim().length >= 1) {
      const results = searchLocations(text, 7);
      setSuggestions(results);
      setIsOpen(true);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
  };

  const handleSelect = (item) => {
    setQuery(item.fullAddress || item.label);
    setSelectedItem(item);
    setIsOpen(false);

    if (onSelect) {
      onSelect(item);
    } else if (onChange) {
      onChange(item.fullAddress || item.label, item);
    }
  };

  const handleClear = () => {
    setQuery("");
    setSelectedItem(null);
    setSuggestions([]);
    setIsOpen(false);
    if (onChange) onChange("");
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <div className="relative flex items-center">
        <MapPin
          className="absolute left-3.5 h-4 w-4 text-[#c41920] pointer-events-none transition-colors"
          aria-hidden="true"
        />

        <input
          id={id}
          name={name}
          type="text"
          autoComplete="off"
          required={required}
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            if (query.trim().length >= 1) {
              setSuggestions(searchLocations(query, 7));
              setIsOpen(true);
            }
          }}
          placeholder={placeholder}
          className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-9 text-sm text-[#180e0f] placeholder:text-gray-400 focus:border-[#c41920] focus:outline-none focus:ring-2 focus:ring-[#c41920]/15 shadow-2xs transition"
        />

        {query && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear location input"
            className="absolute right-3 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <ul className="absolute z-50 mt-1.5 w-full max-h-64 overflow-y-auto rounded-2xl border border-gray-100 bg-white py-1.5 shadow-xl transition animate-in fade-in-50 zoom-in-95">
          <li className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-400">
            Suggested Locations
          </li>
          {suggestions.map((item) => (
            <li
              key={item.id}
              onClick={() => handleSelect(item)}
              className="flex items-center justify-between px-3.5 py-2.5 text-xs text-gray-800 hover:bg-[#fff1f2] hover:text-[#c41920] cursor-pointer transition rounded-lg mx-1"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500 group-hover:bg-[#c41920]/10 group-hover:text-[#c41920]">
                  <Building2 className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0 text-left">
                  <p className="font-semibold truncate text-[#180e0f]">{item.label}</p>
                  <p className="text-[11px] text-gray-500 truncate">
                    {item.city}
                    {item.state ? `, ${item.state}` : ""}
                    {item.pincode ? ` (${item.pincode})` : ""}
                  </p>
                </div>
              </div>
              {item.type && (
                <span className="ml-2 shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600 capitalize">
                  {item.type}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

