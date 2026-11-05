// Area unit conversion factors to Square Feet (standard reference)
export const UNIT_CONVERSIONS_TO_SQFT = {
  sqft: 1,
  sqyard: 9,
  gaj: 9,
  sqmeter: 10.7639104,
  acre: 43560,
  hectare: 107639.104,
  bigha: 27225, // Default/standard standard PU/UP Pucca Bigha (3025 sq yards = 27225 sq ft)
  marla: 272.25, // Standard Northern India Marla (160th of Acre or 9th of Kanal = 272.25 sq ft)
  kanal: 5445, // Standard Northern India Kanal (20 Marlas = 5445 sq ft)
  ground: 2400, // South India / Tamil Nadu Ground (2400 sq ft)
  cent: 435.6, // South India Cent (1/100 of Acre = 435.6 sq ft)
};

// Regional Bigha factors (in Sq. Ft.)
export const REGIONAL_BIGHA_FACTORS = [
  { id: "UP_STANDARD", label: "UP / Punjab / Haryana (Pucca Bigha - 27,225 sq ft)", sqft: 27225 },
  { id: "UP_KACCHA", label: "Western UP (Kaccha Bigha - 9,075 sq ft)", sqft: 9075 },
  { id: "BIHAR", label: "Bihar (27,220 sq ft)", sqft: 27220 },
  { id: "BENGAL", label: "West Bengal / Assam (14,400 sq ft)", sqft: 14400 },
  { id: "RAJASTHAN", label: "Rajasthan (Pucca - 27,225 sq ft)", sqft: 27225 },
  { id: "RAJASTHAN_KACCHA", label: "Rajasthan (Kaccha - 17,424 sq ft)", sqft: 17424 },
  { id: "MP", label: "Madhya Pradesh (12,000 sq ft)", sqft: 12000 },
  { id: "GUJARAT", label: "Gujarat / Uttarakhand (17,424 sq ft)", sqft: 17424 },
  { id: "HP", label: "Himachal Pradesh (8,712 sq ft)", sqft: 8712 },
  { id: "CUSTOM", label: "Custom / Manual (Enter sq ft per Bigha)", sqft: null },
];

export const MEASUREMENT_UNITS = [
  { value: "sqft", label: "Per Sq. Ft. (Square Feet)", shortLabel: "sq ft", suffix: "/ sq ft" },
  { value: "sqyard", label: "Per Sq. Yard (Gaj)", shortLabel: "sq yard", suffix: "/ sq yard" },
  { value: "sqmeter", label: "Per Sq. Meter (Square Meter)", shortLabel: "sq meter", suffix: "/ sq m" },
  { value: "acre", label: "Per Acre", shortLabel: "acre", suffix: "/ acre" },
  { value: "hectare", label: "Per Hectare", shortLabel: "hectare", suffix: "/ hectare" },
  { value: "bigha", label: "Per Bigha", shortLabel: "bigha", suffix: "/ bigha", hasRegionalFactor: true },
  { value: "marla", label: "Per Marla", shortLabel: "marla", suffix: "/ marla" },
  { value: "kanal", label: "Per Kanal", shortLabel: "kanal", suffix: "/ kanal" },
  { value: "ground", label: "Per Ground", shortLabel: "ground", suffix: "/ ground" },
  { value: "cent", label: "Per Cent", shortLabel: "cent", suffix: "/ cent" },
];

/**
 * Normalizes any unit string to one of our standard keys.
 */
export function normalizeUnitKey(unit) {
  if (!unit) return "sqft";
  const u = String(unit).trim().toLowerCase().replace(/[\s\.\-_]/g, "");
  if (u.includes("yard") || u === "sqyd") return "sqyard";
  if (u === "gaj") return "sqyard"; // Or treat gaj as sqyard (1 gaj = 1 sq yard = 9 sqft)
  if (u.includes("meter") || u.includes("metre") || u === "sqm") return "sqmeter";
  if (u.includes("acre")) return "acre";
  if (u.includes("hectare")) return "hectare";
  if (u.includes("bigha")) return "bigha";
  if (u.includes("marla")) return "marla";
  if (u.includes("kanal")) return "kanal";
  if (u.includes("ground")) return "ground";
  if (u.includes("cent")) return "cent";
  return "sqft";
}

/**
 * Calculates the Estimated Unit Rate.
 * 
 * @param {number|string} price Total property price
 * @param {number|string} sizeValue Property area size
 * @param {string} sizeUnit Unit of the property area size (e.g. sqft, acre, gaj)
 * @param {string} targetUnit Unit user wants to see the rate in (e.g. sqft, acre, bigha)
 * @param {number} customBighaSqft Optional custom sqft per Bigha if selected
 * @returns {{ rate: number|null, targetUnit: string, shortLabel: string, suffix: string }}
 */
export function calculateEstimatedUnitRate({
  price,
  sizeValue,
  sizeUnit = "sqft",
  targetUnit = "sqft",
  customBighaSqft = null,
}) {
  const p = Number(price);
  const s = Number(sizeValue);
  if (!p || !s || p <= 0 || s <= 0 || isNaN(p) || isNaN(s)) {
    return { rate: null, targetUnit, shortLabel: targetUnit, suffix: "" };
  }

  const baseUnitKey = normalizeUnitKey(sizeUnit);
  const targetUnitKey = normalizeUnitKey(targetUnit);

  // Sqft per unit for base
  let baseFactor = UNIT_CONVERSIONS_TO_SQFT[baseUnitKey] || 1;
  if (baseUnitKey === "bigha" && customBighaSqft && customBighaSqft > 0) {
    baseFactor = Number(customBighaSqft);
  }

  // Total area in Sq Ft
  const totalAreaInSqFt = s * baseFactor;
  if (!totalAreaInSqFt || totalAreaInSqFt <= 0) {
    return { rate: null, targetUnit, shortLabel: targetUnit, suffix: "" };
  }

  // Rate per 1 Sq Ft
  const ratePerSqFt = p / totalAreaInSqFt;

  // Sqft per unit for target
  let targetFactor = UNIT_CONVERSIONS_TO_SQFT[targetUnitKey] || 1;
  if (targetUnitKey === "bigha" && customBighaSqft && customBighaSqft > 0) {
    targetFactor = Number(customBighaSqft);
  }

  // Rate per target unit = ratePerSqFt * targetFactor
  const finalRate = ratePerSqFt * targetFactor;

  const unitMeta = MEASUREMENT_UNITS.find((u) => u.value === targetUnitKey) || MEASUREMENT_UNITS[0];

  return {
    rate: Math.round(finalRate * 100) / 100,
    targetUnit: targetUnitKey,
    shortLabel: unitMeta.shortLabel,
    suffix: unitMeta.suffix,
  };
}

