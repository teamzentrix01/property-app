/**
 * Fixed list of standard cities supported by Bhoomi.
 * Helps prevent spelling mismatches, handles normalization and proximity suggestions.
 */

export const CITIES = [
  // Uttar Pradesh & NCR Core
  { name: "Moradabad", state: "Uttar Pradesh", nearby: ["Rampur", "Sambhal", "Amroha", "Bareilly", "Meerut"] },
  { name: "Rampur", state: "Uttar Pradesh", nearby: ["Moradabad", "Bareilly", "Sambhal", "Rudrapur"] },
  { name: "Bareilly", state: "Uttar Pradesh", nearby: ["Rampur", "Moradabad", "Pilibhit", "Shahjahanpur"] },
  { name: "Meerut", state: "Uttar Pradesh", nearby: ["Ghaziabad", "Noida", "Muzaffarnagar", "Hapur", "Delhi"] },
  { name: "Agra", state: "Uttar Pradesh", nearby: ["Mathura", "Firozabad", "Aligarh", "Bharatpur", "Delhi"] },
  { name: "Mathura", state: "Uttar Pradesh", nearby: ["Agra", "Vrindavan", "Palwal", "Aligarh", "Delhi"] },
  { name: "Noida", state: "Uttar Pradesh", nearby: ["Greater Noida", "Ghaziabad", "Delhi", "Gurugram", "Faridabad"] },
  { name: "Greater Noida", state: "Uttar Pradesh", nearby: ["Noida", "Ghaziabad", "Delhi", "Bulandshahr", "Faridabad"] },
  { name: "Ghaziabad", state: "Uttar Pradesh", nearby: ["Noida", "Delhi", "Greater Noida", "Hapur", "Meerut"] },
  { name: "Delhi", state: "Delhi", nearby: ["Noida", "Gurugram", "Ghaziabad", "Faridabad", "Greater Noida"] },
  { name: "Gurugram", state: "Haryana", nearby: ["Delhi", "Faridabad", "Manesar", "Sohna", "Noida"] },
  { name: "Faridabad", state: "Haryana", nearby: ["Delhi", "Noida", "Gurugram", "Palwal"] },
  { name: "Lucknow", state: "Uttar Pradesh", nearby: ["Kanpur", "Barabanki", "Unnao", "Ayodhya"] },
  { name: "Kanpur", state: "Uttar Pradesh", nearby: ["Lucknow", "Unnao", "Fatehpur"] },
  { name: "Varanasi", state: "Uttar Pradesh", nearby: ["Prayagraj", "Mirzapur", "Jaunpur", "Chandauli"] },
  { name: "Prayagraj", state: "Uttar Pradesh", nearby: ["Varanasi", "Kaushambi", "Pratapgarh", "Mirzapur"] },
  { name: "Aligarh", state: "Uttar Pradesh", nearby: ["Mathura", "Agra", "Hathras", "Bulandshahr"] },
  { name: "Sambhal", state: "Uttar Pradesh", nearby: ["Moradabad", "Amroha", "Rampur", "Chandausi"] },
  { name: "Amroha", state: "Uttar Pradesh", nearby: ["Moradabad", "Sambhal", "Hapur", "Bijnor"] },
  { name: "Bijnor", state: "Uttar Pradesh", nearby: ["Meerut", "Muzaffarnagar", "Moradabad", "Haridwar"] },
  { name: "Almora", state: "Uttarakhand", nearby: ["Nainital", "Haldwani", "Ranikhet", "Bageshwar"] },
  { name: "Dehradun", state: "Uttarakhand", nearby: ["Haridwar", "Rishikesh", "Mussoorie", "Roorkee"] },
  { name: "Haridwar", state: "Uttarakhand", nearby: ["Rishikesh", "Dehradun", "Roorkee", "Bijnor"] },
  { name: "Jaipur", state: "Rajasthan", nearby: ["Ajmer", "Alwar", "Kota", "Delhi"] },
  { name: "Chandigarh", state: "Chandigarh", nearby: ["Mohali", "Panchkula", "Zirakpur", "Ambala"] },
];

export const CITY_NAMES = CITIES.map((c) => c.name);

// Aliases & spelling variations to standardize incoming geocoded names
const CITY_ALIASES = {
  bareily: "Bareilly",
  "new delhi": "Delhi",
  gurgaon: "Gurugram",
  allahabad: "Prayagraj",
  banaras: "Varanasi",
  kashi: "Varanasi",
  moraadabad: "Moradabad",
};

/**
 * Normalize any input string to matching fixed City name.
 * Returns null if no match found.
 */
export function normalizeCityName(rawInput) {
  if (!rawInput || typeof rawInput !== "string") return null;
  const cleaned = rawInput.trim().toLowerCase();
  if (!cleaned) return null;

  // Direct alias check
  if (CITY_ALIASES[cleaned]) {
    return CITY_ALIASES[cleaned];
  }

  // Exact match (case-insensitive)
  const exact = CITIES.find((c) => c.name.toLowerCase() === cleaned);
  if (exact) return exact.name;

  // Substring / partial match
  const partial = CITIES.find(
    (c) => cleaned.includes(c.name.toLowerCase()) || c.name.toLowerCase().includes(cleaned)
  );
  if (partial) return partial.name;

  return null;
}

/**
 * Get nearby city suggestions for a given city name
 */
export function getNearbyCitySuggestions(cityName) {
  const normalized = normalizeCityName(cityName) || cityName;
  const found = CITIES.find((c) => c.name.toLowerCase() === (normalized || "").toLowerCase());
  if (found && Array.isArray(found.nearby) && found.nearby.length > 0) {
    return found.nearby;
  }
  // Default suggestions if city is not in fixed list
  return ["Moradabad", "Noida", "Delhi", "Meerut", "Agra", "Bareilly"];
}

