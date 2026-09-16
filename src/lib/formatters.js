export function formatPrice(price, purpose) {
  const n = Number(price);
  const value = n >= 10000000
    ? `₹${(n / 10000000).toFixed(n % 10000000 ? 2 : 0)} Cr`
    : n >= 100000
      ? `₹${(n / 100000).toFixed(n % 100000 ? 2 : 0)} L`
      : `₹${n.toLocaleString("en-IN")}`;
  return purpose === "RENT" ? `${value}/month` : value;
}

export function serializeForClient(value) {
  return JSON.parse(JSON.stringify(value));
}

export function formatPhoneNumber(phone) {
  if (!phone) return "";
  const cleaned = String(phone).trim();
  const digits = cleaned.replace(/\D/g, "");
  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  if (digits.length === 12 && digits.startsWith("91")) {
    const last10 = digits.slice(2);
    return `+91 ${last10.slice(0, 5)} ${last10.slice(5)}`;
  }
  return cleaned;
}

