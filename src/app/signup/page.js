"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", role: "BUYER" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setError(data.error || "Signup failed");
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="flex-1 flex items-center justify-center px-6 py-16">
      <form onSubmit={onSubmit} className="w-full max-w-sm bg-paper text-ink rounded-2xl p-8">
        <h1 className="font-display text-2xl mb-6">Create account</h1>
        {error && <p className="text-red-700 text-sm mb-4">{error}</p>}
        <input required placeholder="Full name" className="w-full mb-3 rounded-lg px-3 py-2 border border-ink/10"
          value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input required type="email" placeholder="Email" className="w-full mb-3 rounded-lg px-3 py-2 border border-ink/10"
          value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input required placeholder="Phone" className="w-full mb-3 rounded-lg px-3 py-2 border border-ink/10"
          value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <input required type="password" placeholder="Password" className="w-full mb-3 rounded-lg px-3 py-2 border border-ink/10"
          value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <label className="block text-sm text-ink/70 mb-1">I am a</label>
        <select className="w-full mb-5 rounded-lg px-3 py-2 border border-ink/10"
          value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
          <option value="BUYER">Buyer / Renter</option>
          <option value="OWNER">Owner</option>
          <option value="BROKER">Broker / Dealer</option>
        </select>
        <button disabled={loading} className="w-full bg-ink text-paper rounded-full py-3 font-medium hover:bg-moss-deep transition disabled:opacity-50">
          {loading ? "Creating…" : "Create account"}
        </button>
        <p className="text-sm text-ink/70 mt-4">
          Already have an account? <Link href="/login" className="text-moss-deep font-medium">Log in</Link>
        </p>
      </form>
    </main>
  );
}
