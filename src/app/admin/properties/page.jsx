"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";

const filters = [
  ["ALL", "All"],
  ["DRAFT", "Draft"],
  ["PENDING", "Pending"],
  ["UNDER_REVIEW", "Under Review"],
  ["APPROVED", "Approved"],
  ["ACTIVE", "Active"],
  ["REJECTED", "Rejected"],
  ["INACTIVE", "Inactive"],
];

export default function PropertiesPage() {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("ALL");
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams({ status, q: query });
    fetch(`/api/admin/properties?${params}`)
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error);
        setData(result);
      })
      .catch((reason) => setError(reason.message));
  }, [status, query]);

  if (error) return <p className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm font-semibold text-red-700">{error}</p>;
  if (!data) return <p className="text-sm font-medium text-gray-500">Loading properties...</p>;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl font-extrabold text-gray-950">Properties</h2>
          <p className="mt-1 text-sm text-gray-500">Review and manage every listing across Bhoomi.</p>
        </div>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search property, owner, city..."
          className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 outline-none shadow-sm transition focus:border-green-700 focus:ring-2 focus:ring-green-100"
        />
      </div>

      <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
        {filters.map(([value, label]) => (
          <button
            key={value}
            onClick={() => setStatus(value)}
            className={`whitespace-nowrap rounded-xl px-4 py-2 text-xs font-bold transition duration-150 ${
              status === value
                ? "bg-green-700 text-white shadow-sm"
                : "border border-gray-200 bg-white text-gray-700 hover:border-green-600 hover:text-green-700"
            }`}
          >
            {label} {value !== "ALL" && `(${data.counts[value] || 0})`}
          </button>
        ))}
      </div>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-gray-500 border-b border-gray-200">
            <tr>
              <th className="p-4">Property</th>
              <th className="p-4">Owner</th>
              <th className="p-4">Location</th>
              <th className="p-4">Price</th>
              <th className="p-4">Status</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {data.listings.map((listing) => (
              <tr key={listing.id} className="border-t border-gray-100 hover:bg-slate-50/60 transition">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    {listing.photos[0] ? (
                      <img src={listing.photos[0].url} alt="" className="h-12 w-16 rounded-xl object-cover border border-gray-100" />
                    ) : (
                      <div className="grid h-12 w-16 place-items-center rounded-xl bg-gray-100 text-[10px] text-gray-400">No photo</div>
                    )}
                    <span className="font-bold text-gray-900 line-clamp-1">{listing.title}</span>
                  </div>
                </td>
                <td className="p-4">
                  <span className="font-semibold text-gray-800">{listing.owner.name}</span>
                  <br />
                  <span className="text-xs text-gray-500">{listing.owner.email}</span>
                </td>
                <td className="p-4 text-gray-600">{listing.area}, {listing.city}</td>
                <td className="p-4 font-bold text-gray-900">₹{Number(listing.price).toLocaleString("en-IN")}</td>
                <td className="p-4"><StatusBadge status={listing.status} /></td>
                <td className="p-4">
                  <Link href={`/admin/properties/${listing.id}`} className="font-bold text-green-700 hover:text-green-900 hover:underline">
                    Review →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!data.listings.length && <p className="p-10 text-center text-sm text-gray-400">No properties found.</p>}
      </div>
    </div>
  );
}
