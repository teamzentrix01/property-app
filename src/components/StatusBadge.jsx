const STATUS_META = {
  DRAFT: ["Draft", "bg-gray-100 text-gray-700"],
  PENDING: ["Pending", "bg-yellow-100 text-yellow-800"],
  UNDER_REVIEW: ["Under Review", "bg-blue-100 text-blue-800"],
  APPROVED: ["Approved", "bg-green-100 text-green-800"],
  ACTIVE: ["Active", "bg-green-200 text-green-900"],
  REJECTED: ["Rejected", "bg-red-100 text-red-700"],
  INACTIVE: ["Inactive", "bg-gray-200 text-gray-700"],
  EXPIRED: ["Expired", "bg-gray-200 text-gray-700"],
};

export function statusLabel(status) {
  return STATUS_META[status]?.[0] || "Unknown";
}

export default function StatusBadge({ status }) {
  const [label, color] = STATUS_META[status] || ["Unknown", "bg-gray-100 text-gray-700"];
  return <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${color}`}>{label}</span>;
}