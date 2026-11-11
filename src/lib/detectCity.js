/**
 * City-based Auto-Detection Module for Bhoomi
 *
 * Strict Fallback Order:
 * 1. localStorage "userCity" -> source: "saved"
 * 2. Browser Geolocation (enableHighAccuracy: false) + Nominatim reverse geocode (zoom=10) -> source: "gps"
 * 3. ipapi.co (last fallback) -> source: "ip"
 * 4. Fallback default ("Moradabad" / "Noida") -> source: "none"
 *
 * Output format:
 * {
 *   city: string,
 *   source: "saved" | "gps" | "ip" | "none"
 * }
 */

import { normalizeCityName, CITY_NAMES } from "@/constants/cities";

const STORAGE_KEY = "userCity";
const DEFAULT_FALLBACK_CITY = "Moradabad";

/**
 * Reverse geocode lat/lng to city using OpenStreetMap Nominatim with zoom=10
 */
async function reverseGeocodeWithNominatim(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&zoom=10&format=json&addressdetails=1`,
      {
        headers: {
          "User-Agent": "BhoomiRealEstate/2.0 (contact: support@bhoomiproperty.com)",
        },
      }
    );

    if (res.ok) {
      const data = await res.json();
      const addr = data.address || {};

      // Check city, town, or state_district as requested
      const candidate =
        addr.city ||
        addr.town ||
        addr.state_district ||
        addr.district ||
        addr.county ||
        addr.municipality ||
        null;

      if (candidate) {
        const normalized = normalizeCityName(candidate);
        if (normalized) return normalized;
        return candidate.trim();
      }
    }
  } catch (err) {
    console.warn("Nominatim reverse geocode error:", err);
  }
  return null;
}

/**
 * IP-based fallback detection via ipapi.co
 */
async function detectCityViaIp() {
  try {
    const res = await fetch("https://ipapi.co/json/");
    if (res.ok) {
      const data = await res.json();
      const rawCity = data.city || data.region;
      if (rawCity) {
        const normalized = normalizeCityName(rawCity);
        return normalized || rawCity.trim();
      }
    }
  } catch (err) {
    console.warn("ipapi fallback error:", err);
  }
  return null;
}

/**
 * Primary function: detectCity()
 * @param {Object} [options]
 * @param {boolean} [options.forceGps] - When true, bypasses localStorage to re-trigger live browser GPS
 */
export async function detectCity(options = {}) {
  // 1. Check localStorage first (unless user explicitly requested forceGps)
  if (!options.forceGps && typeof window !== "undefined") {
    try {
      const savedCity = localStorage.getItem(STORAGE_KEY);
      if (savedCity && savedCity.trim()) {
        const normalizedSaved = normalizeCityName(savedCity) || savedCity.trim();
        return {
          city: normalizedSaved,
          source: "saved",
        };
      }
    } catch (e) {
      // Storage access blocked or unavailable
    }
  }

  // 2. Browser Geolocation (with enableHighAccuracy: false)
  if (typeof window !== "undefined" && typeof navigator !== "undefined" && navigator.geolocation) {
    try {
      const gpsResult = await new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const lat = pos.coords?.latitude;
            const lng = pos.coords?.longitude;
            if (lat && lng) {
              const geocodedCity = await reverseGeocodeWithNominatim(lat, lng);
              if (geocodedCity) {
                return resolve({
                  city: geocodedCity,
                  source: "gps",
                });
              }
            }
            resolve(null);
          },
          (err) => {
            // Geolocation denied, timed out, or unavailable
            resolve(null);
          },
          {
            enableHighAccuracy: false,
            timeout: 6000,
            maximumAge: 300000,
          }
        );
      });

      if (gpsResult && gpsResult.city) {
        return gpsResult;
      }
    } catch (err) {
      console.warn("Geolocation detection failed:", err);
    }
  }

  // 3. IP-based fallback via ipapi.co
  const ipCity = await detectCityViaIp();
  if (ipCity) {
    return {
      city: ipCity,
      source: "ip",
    };
  }

  // 4. Default fallback when all fail
  return {
    city: DEFAULT_FALLBACK_CITY,
    source: "none",
  };
}

/**
 * Save user manually selected city to localStorage
 * (So auto-detect will not overwrite user's deliberate choice)
 */
export function saveUserCity(cityName) {
  if (typeof window !== "undefined" && cityName) {
    try {
      const normalized = normalizeCityName(cityName) || cityName.trim();
      localStorage.setItem(STORAGE_KEY, normalized);
      window.dispatchEvent(
        new CustomEvent("bhoomi-city-changed", {
          detail: { city: normalized },
        })
      );
      return normalized;
    } catch (e) {}
  }
  return cityName;
}

