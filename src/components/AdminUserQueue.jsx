"use client";

import { useEffect, useState } from "react";

export default function AdminUserQueue({ type }) {
  const [users, setUsers] = useState(null);
  const [error, setError] = useState("");
  const path = `/api/admin/users/${type}`;
  useEffect(() => { fetch(path).then(async (response) => { const data = await response.json(); if (!response.ok) throw new Error(data.error); setUsers(data.users); }).catch((reason) => setError(reason.message)); }, [path]);
  if (error) return <p className="rounded-xl bg-red-50 p-4 text-red-700">{error}</p>;
  if (!users) return <p className="text-sm text-slate-500">Loading users...</p>;
  return <section className="overflow-x-auto rounded-2xl border border-amber-100 bg-white"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-amber-50 text-xs uppercase text-slate-500"><tr><th className="p-4">Name</th><th className="p-4">Contact</th><th className="p-4">Registered / verified</th><th className="p-4">Documents</th><th className="p-4">Action</th></tr></thead><tbody>{users.map((user) => <tr key={user.id} className="border-t border-slate-100"><td className="p-4 font-semibold">{user.name}</td><td className="p-4">{user.email}<br />{user.phone}</td><td className="p-4 text-slate-500">{new Date(user.verifiedAt || user.createdAt).toLocaleDateString("en-IN")}</td><td className="p-4">{type === "pending" ? `${user.documentCount} uploaded · ${user.verifiedDocuments} verified · ${user.pendingDocuments} pending · ${user.rejectedDocuments} rejected` : `${user.documentsVerified} verified`}</td><td className="p-4"><a href={`/admin/documents?userId=${user.id}`} className="font-semibold text-amber-800 hover:underline">View documents</a></td></tr>)}</tbody></table>{!users.length && <p className="p-10 text-center text-sm text-slate-500">No {type} users.</p>}</section>;
}
