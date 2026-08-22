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
