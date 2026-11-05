/**
 * Comprehensive Indian Location Intelligence Dataset & Helper Module
 * Provides normalized city & locality data, coordinates, Haversine distance calculations,
 * and autocomplete search across Indian cities, sectors, and PIN codes.
 */

export const INDIAN_CITIES = [
  // Delhi NCR
  {
    city: "Delhi",
    state: "Delhi",
    lat: 28.6139,
    lng: 77.209,
    pincode: "110001",
    nearby: ["Noida", "Greater Noida", "Ghaziabad", "Gurugram", "Faridabad", "Sonipat"],
    localities: [
      { name: "Connaught Place", pincode: "110001", lat: 28.6315, lng: 77.2167 },
      { name: "Dwarka", pincode: "110075", lat: 28.5921, lng: 77.046 },
      { name: "Rohini", pincode: "110085", lat: 28.7166, lng: 77.1147 },
      { name: "Saket", pincode: "110017", lat: 28.5244, lng: 77.2177 },
      { name: "Vasant Kunj", pincode: "110070", lat: 28.5284, lng: 77.1472 },
      { name: "Lajpat Nagar", pincode: "110024", lat: 28.5677, lng: 77.2433 },
      { name: "Karol Bagh", pincode: "110005", lat: 28.6517, lng: 77.1906 },
      { name: "Janakpuri", pincode: "110058", lat: 28.6219, lng: 77.0878 },
      { name: "Mayur Vihar", pincode: "110091", lat: 28.6096, lng: 77.3031 },
      { name: "Pitampura", pincode: "110034", lat: 28.699, lng: 77.1384 },
      { name: "Hauz Khas", pincode: "110016", lat: 28.5494, lng: 77.2001 },
      { name: "Greater Kailash", pincode: "110048", lat: 28.5367, lng: 77.2384 },
    ],
  },
  {
    city: "Noida",
    state: "Uttar Pradesh",
    lat: 28.5355,
    lng: 77.391,
    pincode: "201301",
    nearby: ["Greater Noida", "Delhi", "Ghaziabad", "Faridabad", "Gurugram"],
    localities: [
      { name: "Sector 15", pincode: "201301", lat: 28.5839, lng: 77.3117 },
      { name: "Sector 18", pincode: "201301", lat: 28.5708, lng: 77.326 },
      { name: "Sector 62", pincode: "201309", lat: 28.6279, lng: 77.3649 },
      { name: "Sector 50", pincode: "201301", lat: 28.5772, lng: 77.3639 },
      { name: "Sector 75", pincode: "201301", lat: 28.5752, lng: 77.3789 },
      { name: "Sector 76", pincode: "201301", lat: 28.5662, lng: 77.3821 },
      { name: "Sector 137", pincode: "201305", lat: 28.5097, lng: 77.4111 },
      { name: "Sector 150", pincode: "201310", lat: 28.4357, lng: 77.4883 },
      { name: "Sector 128", pincode: "201304", lat: 28.5312, lng: 77.3745 },
      { name: "Noida Expressway", pincode: "201304", lat: 28.5144, lng: 77.3951 },
    ],
  },
  {
    city: "Greater Noida",
    state: "Uttar Pradesh",
    lat: 28.4744,
    lng: 77.504,
    pincode: "201310",
    nearby: ["Noida", "Ghaziabad", "Delhi", "Faridabad", "Bulandshahr"],
    localities: [
      { name: "Pari Chowk", pincode: "201310", lat: 28.4682, lng: 77.5096 },
      { name: "Greater Noida West", pincode: "201306", lat: 28.5982, lng: 77.4332 },
      { name: "Alpha 1", pincode: "201310", lat: 28.4721, lng: 77.514 },
      { name: "Beta 1", pincode: "201310", lat: 28.481, lng: 77.518 },
      { name: "Gamma 1", pincode: "201310", lat: 28.4876, lng: 77.5091 },
      { name: "Omega 1", pincode: "201310", lat: 28.4629, lng: 77.5255 },
      { name: "Knowledge Park", pincode: "201310", lat: 28.4611, lng: 77.4947 },
      { name: "Techzone 4", pincode: "201306", lat: 28.5833, lng: 77.4478 },
    ],
  },
  {
    city: "Ghaziabad",
    state: "Uttar Pradesh",
    lat: 28.6692,
    lng: 77.4538,
    pincode: "201001",
    nearby: ["Noida", "Greater Noida", "Delhi", "Hapur", "Meerut"],
    localities: [
      { name: "Indirapuram", pincode: "201014", lat: 28.6433, lng: 77.367 },
      { name: "Vaishali", pincode: "201010", lat: 28.6477, lng: 77.3382 },
      { name: "Vasundhara", pincode: "201012", lat: 28.6601, lng: 77.3712 },
      { name: "Raj Nagar Extension", pincode: "201017", lat: 28.7188, lng: 77.436 },
      { name: "Crossings Republik", pincode: "201016", lat: 28.6318, lng: 77.4419 },
      { name: "Kaushambi", pincode: "201010", lat: 28.6382, lng: 77.3242 },
      { name: "Siddharth Vihar", pincode: "201009", lat: 28.6534, lng: 77.412 },
    ],
  },
  {
    city: "Gurugram",
    state: "Haryana",
    lat: 28.4595,
    lng: 77.0266,
    pincode: "122001",
    nearby: ["Delhi", "Faridabad", "Manesar", "Sohna", "Noida"],
    localities: [
      { name: "DLF Phase 1", pincode: "122002", lat: 28.4777, lng: 77.0988 },
      { name: "DLF Phase 2", pincode: "122002", lat: 28.4878, lng: 77.0865 },
      { name: "DLF Phase 5", pincode: "122009", lat: 28.4531, lng: 77.0967 },
      { name: "Golf Course Road", pincode: "122002", lat: 28.4578, lng: 77.0998 },
      { name: "Golf Course Extension", pincode: "122018", lat: 28.4087, lng: 77.0754 },
      { name: "Sohna Road", pincode: "122018", lat: 28.4145, lng: 77.0392 },
      { name: "Cyber City", pincode: "122002", lat: 28.4951, lng: 77.0894 },
      { name: "Sector 56", pincode: "122011", lat: 28.4276, lng: 77.1009 },
      { name: "Sector 57", pincode: "122003", lat: 28.4298, lng: 77.0832 },
      { name: "Sector 82", pincode: "122004", lat: 28.3976, lng: 76.9654 },
      { name: "New Gurgaon", pincode: "122004", lat: 28.3912, lng: 76.9532 },
    ],
  },
  {
    city: "Faridabad",
    state: "Haryana",
    lat: 28.4089,
    lng: 77.3178,
    pincode: "121001",
    nearby: ["Delhi", "Gurugram", "Noida", "Palwal"],
    localities: [
      { name: "Sector 15", pincode: "121007", lat: 28.411, lng: 77.3245 },
      { name: "Sector 16", pincode: "121002", lat: 28.418, lng: 77.329 },
      { name: "Sector 21C", pincode: "121001", lat: 28.4298, lng: 77.3012 },
      { name: "NIT", pincode: "121001", lat: 28.3912, lng: 77.3023 },
      { name: "Green Field Colony", pincode: "121010", lat: 28.4578, lng: 77.3014 },
      { name: "Neharpar (Greater Faridabad)", pincode: "121002", lat: 28.4023, lng: 77.3512 },
    ],
  },

  // Uttar Pradesh
  {
    city: "Moradabad",
    state: "Uttar Pradesh",
    lat: 28.8386,
    lng: 78.7733,
    pincode: "244001",
    nearby: ["Rampur", "Sambhal", "Amroha", "Bareilly", "Meerut", "Noida"],
    localities: [
      { name: "Sector 12", pincode: "244001", lat: 28.8412, lng: 78.765 },
      { name: "Civil Lines", pincode: "244001", lat: 28.845, lng: 78.768 },
      { name: "Buddhi Vihar", pincode: "244001", lat: 28.832, lng: 78.745 },
      { name: "MDA Colony", pincode: "244001", lat: 28.841, lng: 78.752 },
      { name: "Kanth Road", pincode: "244001", lat: 28.868, lng: 78.742 },
      { name: "Majhola", pincode: "244001", lat: 28.825, lng: 78.732 },
      { name: "Mansarovar Colony", pincode: "244001", lat: 28.852, lng: 78.759 },
      { name: "Ram Ganga Vihar", pincode: "244001", lat: 28.861, lng: 78.755 },
      { name: "Delhi Road", pincode: "244001", lat: 28.821, lng: 78.721 },
    ],
  },
  {
    city: "Meerut",
    state: "Uttar Pradesh",
    lat: 28.9845,
    lng: 77.7064,
    pincode: "250001",
    nearby: ["Modinagar", "Ghaziabad", "Hapur", "Muzaffarnagar", "Noida", "Delhi"],
    localities: [
      { name: "Shastri Nagar", pincode: "250004", lat: 28.968, lng: 77.732 },
      { name: "Modipuram", pincode: "250110", lat: 29.071, lng: 77.708 },
      { name: "Ganga Nagar", pincode: "250001", lat: 28.995, lng: 77.758 },
      { name: "Pallavpuram", pincode: "250110", lat: 29.052, lng: 77.712 },
      { name: "Saket", pincode: "250001", lat: 28.988, lng: 77.718 },
      { name: "Civil Lines", pincode: "250001", lat: 28.985, lng: 77.711 },
    ],
  },
  {
    city: "Lucknow",
    state: "Uttar Pradesh",
    lat: 26.8467,
    lng: 80.9462,
    pincode: "226001",
    nearby: ["Kanpur", "Barabanki", "Unnao", "Ayodhya", "Raebareli"],
    localities: [
      { name: "Gomti Nagar", pincode: "226010", lat: 26.852, lng: 80.999 },
      { name: "Gomti Nagar Extension", pincode: "226010", lat: 26.839, lng: 81.025 },
      { name: "Hazratganj", pincode: "226001", lat: 26.853, lng: 80.945 },
      { name: "Aliganj", pincode: "226024", lat: 26.892, lng: 80.941 },
      { name: "Indira Nagar", pincode: "226016", lat: 26.879, lng: 80.985 },
      { name: "Vibhuti Khand", pincode: "226010", lat: 26.862, lng: 81.002 },
      { name: "Sushant Golf City", pincode: "226030", lat: 26.778, lng: 80.988 },
      { name: "Amar Shaheed Path", pincode: "226002", lat: 26.801, lng: 80.975 },
    ],
  },
  {
    city: "Kanpur",
    state: "Uttar Pradesh",
    lat: 26.4499,
    lng: 80.3319,
    pincode: "208001",
    nearby: ["Lucknow", "Unnao", "Fatehpur", "Kannauj"],
    localities: [
      { name: "Civil Lines", pincode: "208001", lat: 26.472, lng: 80.345 },
      { name: "Swaroop Nagar", pincode: "208002", lat: 26.481, lng: 80.318 },
      { name: "Kakadeo", pincode: "208025", lat: 26.485, lng: 80.298 },
      { name: "Kalyanpur", pincode: "208017", lat: 26.505, lng: 80.258 },
      { name: "Kidwai Nagar", pincode: "208011", lat: 26.428, lng: 80.334 },
    ],
  },
  {
    city: "Agra",
    state: "Uttar Pradesh",
    lat: 27.1767,
    lng: 78.0081,
    pincode: "282001",
    nearby: ["Mathura", "Firozabad", "Bharatpur", "Aligarh", "Gwalior"],
    localities: [
      { name: "Sector 11/12", pincode: "282007", lat: 27.205, lng: 77.962 },
      { name: "Taj Nagari", pincode: "282001", lat: 27.158, lng: 78.058 },
      { name: "Dayalbagh", pincode: "282005", lat: 27.228, lng: 78.012 },
      { name: "Kamla Nagar", pincode: "282004", lat: 27.215, lng: 78.028 },
      { name: "Sanjay Place", pincode: "282002", lat: 27.198, lng: 77.998 },
      { name: "Fatehabad Road", pincode: "282001", lat: 27.162, lng: 78.045 },
    ],
  },
  {
    city: "Bareilly",
    state: "Uttar Pradesh",
    lat: 28.367,
    lng: 79.4304,
    pincode: "243001",
    nearby: ["Moradabad", "Rampur", "Pilibhit", "Shahjahanpur", "Budaun"],
    localities: [
      { name: "Civil Lines", pincode: "243001", lat: 28.365, lng: 79.418 },
      { name: "Rajendra Nagar", pincode: "243122", lat: 28.385, lng: 79.438 },
      { name: "DD Puram", pincode: "243006", lat: 28.375, lng: 79.428 },
      { name: "Pilibhit Bypass Road", pincode: "243006", lat: 28.395, lng: 79.458 },
    ],
  },
  {
    city: "Rampur",
    state: "Uttar Pradesh",
    lat: 28.8154,
    lng: 79.0257,
    pincode: "244901",
    nearby: ["Moradabad", "Bareilly", "Bilaspur", "Suar", "Rudrapur"],
    localities: [
      { name: "Civil Lines", pincode: "244901", lat: 28.812, lng: 79.031 },
      { name: "Avas Vikas Colony", pincode: "244901", lat: 28.825, lng: 79.021 },
      { name: "Jwala Nagar", pincode: "244901", lat: 28.805, lng: 79.015 },
    ],
  },
  {
    city: "Jaipur",
    state: "Rajasthan",
    lat: 26.9124,
    lng: 75.7873,
    pincode: "302001",
    nearby: ["Ajmer", "Alwar", "Kota", "Delhi", "Gurugram"],
    localities: [
      { name: "Malviya Nagar", pincode: "302017", lat: 26.854, lng: 75.815 },
      { name: "Mansarovar", pincode: "302020", lat: 26.862, lng: 75.768 },
      { name: "Vaishali Nagar", pincode: "302021", lat: 26.905, lng: 75.742 },
      { name: "Jagatpura", pincode: "302017", lat: 26.828, lng: 75.845 },
      { name: "C Scheme", pincode: "302001", lat: 26.911, lng: 75.798 },
      { name: "Tonk Road", pincode: "302018", lat: 26.845, lng: 75.798 },
    ],
  },
  {
    city: "Mumbai",
    state: "Maharashtra",
    lat: 19.076,
    lng: 72.8777,
    pincode: "400001",
    nearby: ["Thane", "Navi Mumbai", "Kalyan", "Mira Bhayandar", "Pune"],
    localities: [
      { name: "Bandra West", pincode: "400050", lat: 19.0596, lng: 72.8295 },
      { name: "Andheri West", pincode: "400053", lat: 19.1363, lng: 72.8277 },
      { name: "Andheri East", pincode: "400069", lat: 19.1136, lng: 72.8697 },
      { name: "Powai", pincode: "400076", lat: 19.1176, lng: 72.906 },
      { name: "Worli", pincode: "400018", lat: 19.0166, lng: 72.8169 },
      { name: "Juhu", pincode: "400049", lat: 19.1075, lng: 72.8263 },
      { name: "Goregaon East", pincode: "400063", lat: 19.1663, lng: 72.8623 },
    ],
  },
  {
    city: "Bengaluru",
    state: "Karnataka",
    lat: 12.9716,
    lng: 77.5946,
    pincode: "560001",
    nearby: ["Hosur", "Tumakuru", "Mysuru"],
    localities: [
      { name: "Whitefield", pincode: "560066", lat: 12.9698, lng: 77.75 },
      { name: "Koramangala", pincode: "560034", lat: 12.9352, lng: 77.6245 },
      { name: "Indiranagar", pincode: "560038", lat: 12.9784, lng: 77.6408 },
      { name: "HSR Layout", pincode: "560102", lat: 12.9121, lng: 77.6446 },
      { name: "Bellandur", pincode: "560103", lat: 12.9304, lng: 77.6784 },
      { name: "Electronic City", pincode: "560100", lat: 12.8452, lng: 77.6602 },
    ],
  },
  {
    city: "Pune",
    state: "Maharashtra",
    lat: 18.5204,
    lng: 73.8567,
    pincode: "411001",
    nearby: ["Pimpri-Chinchwad", "Mumbai", "Lonavala", "Satara"],
    localities: [
      { name: "Hinjewadi", pincode: "411057", lat: 18.5913, lng: 73.7389 },
      { name: "Wakad", pincode: "411057", lat: 18.5987, lng: 73.7667 },
      { name: "Baner", pincode: "411045", lat: 18.559, lng: 73.7868 },
      { name: "Kothrud", pincode: "411038", lat: 18.5074, lng: 73.8077 },
      { name: "Kharadi", pincode: "411014", lat: 18.5516, lng: 73.9344 },
    ],
  },
  {
    city: "Chandigarh",
    state: "Chandigarh",
    lat: 30.7333,
    lng: 76.7794,
    pincode: "160017",
    nearby: ["Mohali", "Panchkula", "Zirakpur", "Kharar", "Ambala"],
    localities: [
      { name: "Sector 17", pincode: "160017", lat: 30.7415, lng: 76.779 },
      { name: "Sector 35", pincode: "160035", lat: 30.725, lng: 76.762 },
      { name: "Sector 43", pincode: "160043", lat: 30.715, lng: 76.745 },
      { name: "Aerocity (Mohali)", pincode: "140306", lat: 30.648, lng: 76.785 },
      { name: "VIP Road (Zirakpur)", pincode: "140603", lat: 30.642, lng: 76.818 },
    ],
  },
  {
    city: "Dehradun",
    state: "Uttarakhand",
    lat: 30.3165,
    lng: 78.0322,
    pincode: "248001",
    nearby: ["Mussoorie", "Rishikesh", "Haridwar", "Roorkee", "Saharanpur"],
    localities: [
      { name: "Rajpur Road", pincode: "248009", lat: 30.345, lng: 78.058 },
      { name: "Sahastradhara Road", pincode: "248013", lat: 30.355, lng: 78.082 },
      { name: "GMS Road", pincode: "248001", lat: 30.312, lng: 78.012 },
      { name: "Vasant Vihar", pincode: "248006", lat: 30.319, lng: 78.005 },
    ],
  },
];

/**
 * Calculate Great-Circle distance between two coordinates using Haversine formula
 * @param {number} lat1
 * @param {number} lon1
 * @param {number} lat2
 * @param {number} lon2
 * @returns {number} distance in kilometers
 */
export function getDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Autocomplete location search across Indian cities, localities, sectors, and PIN codes.
 * Returns up to `limit` structured suggestions.
 */
export function searchLocations(query, limit = 8) {
  if (!query || typeof query !== "string") return [];
  const q = query.trim().toLowerCase();
  if (q.length === 0) return [];

  const results = [];
  const seenLabels = new Set();

  // Helper to add suggestion
  function addResult(item) {
    if (!seenLabels.has(item.label.toLowerCase())) {
      seenLabels.add(item.label.toLowerCase());
      results.push(item);
    }
  }

  // 1. Search localities
  for (const cityObj of INDIAN_CITIES) {
    for (const loc of cityObj.localities || []) {
      const matchLocality = loc.name.toLowerCase().includes(q);
      const matchPincode = loc.pincode && loc.pincode.includes(q);
      const matchCombined = `${loc.name} ${cityObj.city}`.toLowerCase().includes(q);

      if (matchLocality || matchPincode || matchCombined) {
        addResult({
          id: `${loc.name}-${cityObj.city}`,
          label: `${loc.name}, ${cityObj.city}`,
          fullAddress: `${loc.name}, ${cityObj.city}, ${cityObj.state}${loc.pincode ? ` - ${loc.pincode}` : ""}`,
          locality: loc.name,
          city: cityObj.city,
          state: cityObj.state,
          pincode: loc.pincode || cityObj.pincode,
          lat: loc.lat || cityObj.lat,
          lng: loc.lng || cityObj.lng,
          type: "locality",
        });
      }
      if (results.length >= limit) return results;
    }
  }

  // 2. Search cities
  for (const cityObj of INDIAN_CITIES) {
    const matchCity = cityObj.city.toLowerCase().includes(q);
    const matchState = cityObj.state.toLowerCase().includes(q);
    const matchPincode = cityObj.pincode && cityObj.pincode.startsWith(q);

    if (matchCity || matchState || matchPincode) {
      addResult({
        id: cityObj.city,
        label: `${cityObj.city}, ${cityObj.state}`,
        fullAddress: `${cityObj.city}, ${cityObj.state}${cityObj.pincode ? ` - ${cityObj.pincode}` : ""}`,
        locality: "",
        city: cityObj.city,
        state: cityObj.state,
        pincode: cityObj.pincode,
        lat: cityObj.lat,
        lng: cityObj.lng,
        type: "city",
      });
    }
    if (results.length >= limit) return results;
  }

  // 3. Fallback custom suggestion if user types a specific location not in dataset
  if (results.length === 0 && q.length >= 2) {
    const capitalized = query
      .trim()
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

    results.push({
      id: "custom-" + q,
      label: capitalized,
      fullAddress: capitalized,
      locality: capitalized,
      city: capitalized,
      state: "",
      pincode: "",
      lat: null,
      lng: null,
      type: "custom",
    });
  }

  return results.slice(0, limit);
}

/**
 * Normalizes any free-form location text into structured components
 */
export function parseLocationString(text) {
  if (!text || typeof text !== "string") {
    return { city: null, locality: null, state: null, pincode: null, lat: null, lng: null };
  }

  const clean = text.trim();
  const lower = clean.toLowerCase();

  // Try matching known locality first
  for (const cityObj of INDIAN_CITIES) {
    for (const loc of cityObj.localities || []) {
      if (lower.includes(loc.name.toLowerCase())) {
        return {
          city: cityObj.city,
          locality: loc.name,
          state: cityObj.state,
          pincode: loc.pincode || cityObj.pincode,
          lat: loc.lat || cityObj.lat,
          lng: loc.lng || cityObj.lng,
        };
      }
    }
  }

  // Try matching known city
  for (const cityObj of INDIAN_CITIES) {
    if (lower.includes(cityObj.city.toLowerCase())) {
      // Check if there is a locality before the city name
      const parts = clean.split(/[,–-]/).map((p) => p.trim());
      const locality = parts.length > 1 && parts[0].toLowerCase() !== cityObj.city.toLowerCase() ? parts[0] : null;

      return {
        city: cityObj.city,
        locality,
        state: cityObj.state,
        pincode: cityObj.pincode,
        lat: cityObj.lat,
        lng: cityObj.lng,
      };
    }
  }

  // Fallback: take first part as locality/city
  const parts = clean.split(/[,–-]/).map((p) => p.trim());
  return {
    city: parts[parts.length > 1 ? 1 : 0] || clean,
    locality: parts.length > 1 ? parts[0] : clean,
    state: null,
    pincode: null,
    lat: null,
    lng: null,
  };
}

/**
 * Get nearby cities for any city dynamically using GPS coordinates & distance
 * Fallback to known adjacency list.
 */
export function getNearbyCities(cityName, maxDistanceKm = 80) {
  if (!cityName) return [];
  const normalized = cityName.trim().toLowerCase();
  const currentCityObj = INDIAN_CITIES.find(
    (c) => c.city.toLowerCase() === normalized
  );

  const nearbySet = new Set();

  // 1. Add static proximity list if present
  if (currentCityObj?.nearby) {
    currentCityObj.nearby.forEach((c) => nearbySet.add(c));
  }

  // 2. Add dynamically by Haversine distance
  if (currentCityObj?.lat && currentCityObj?.lng) {
    const sorted = INDIAN_CITIES.filter(
      (c) => c.city.toLowerCase() !== normalized && c.lat && c.lng
    )
      .map((c) => ({
        city: c.city,
        distance: getDistanceKm(currentCityObj.lat, currentCityObj.lng, c.lat, c.lng),
      }))
      .filter((c) => c.distance !== null && c.distance <= maxDistanceKm)
      .sort((a, b) => a.distance - b.distance);

    sorted.forEach((item) => nearbySet.add(item.city));
  }

  return Array.from(nearbySet);
}

