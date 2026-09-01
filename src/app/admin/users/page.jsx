"use client";

import { useEffect, useState } from "react";

const ROLES = ["BUYER", "OWNER", "BROKER", "AREA_ADMIN", "SUPER_ADMIN"];

export default function ManageUsers() {
  const [users, setUsers] = useState(undefined);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/users").then(async (r) => {
      const data = await r.json();
      if (!r.ok) return setError(data.error || "Not authorized");
      setUsers(data.users);
    });
  }, []);

  async function update(userId, patch) {
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, ...patch }),
    });
    const data = await res.json();
    if (res.ok) setUsers((us) => us.map((u) => (u.id === userId ? data.user : u)));
  }

  if (error) return <main className="flex-1 px-6 py-16 text-center">{error}</main>;
  if (!users) return <main className="flex-1 px-6 py-16">Loading…</main>;

  return (
    <main className="flex-1 max-w-5xl mx-auto px-6 py-12 w-full">
      <h1 className="font-display text-3xl mb-2">Manage users</h1>
      <p className="text-ink-soft mb-8">Promote a user to area admin and set the city they moderate, or manage any role.</p>

      <div className="bg-paper text-ink rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-paper-dim font-data text-xs uppercase text-ink-soft">
            <tr>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Contact</th>
              <th className="text-left p-3">Role</th>
              <th className="text-left p-3">Admin area</th>
              <th className="text-left p-3">Verified</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-ink/10">
                <td className="p-3">{u.name}</td>
                <td className="p-3 font-data text-xs">{u.email}<br />{u.phone}</td>
                <td className="p-3">
                  <select value={u.role} onChange={(e) => {
                    const role = e.target.value;
                    if (role === "AREA_ADMIN") {
                      const adminArea = window.prompt("City this admin can moderate:", u.adminArea || "");
                      if (!adminArea?.trim()) return;
                      update(u.id, { role, adminArea });
                      return;
                    }
                    update(u.id, { role, adminArea: null });
                  }}
                    className="rounded-lg px-2 py-1 border border-ink/10 font-data text-xs">
                    {ROLES.map((r) => <option key={r} value={r}>{r.replaceAll("_", " ")}</option>)}
                  </select>
                </td>
                <td className="p-3">
                  <input defaultValue={u.adminArea || ""} placeholder="e.g. Moradabad"
                    onBlur={(e) => update(u.id, { adminArea: e.target.value })}
                    disabled={u.role !== "AREA_ADMIN"}
                    className="rounded-lg px-2 py-1 border border-ink/10 text-xs w-32 disabled:opacity-40" />
                </td>
                <td className="p-3">
                  <input type="checkbox" checked={u.verified} onChange={(e) => update(u.id, { verified: e.target.checked })} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
