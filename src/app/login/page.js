"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ emailOrPhone: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setError(data.error || "Login failed");
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="flex-1 flex items-center justify-center px-6 py-16">
      <form onSubmit={onSubmit} className="w-full max-w-sm bg-paper text-ink rounded-2xl p-8">
        <h1 className="font-display text-2xl mb-6">Log in</h1>
        {error && <p className="text-red-700 text-sm mb-4">{error}</p>}
        <input required placeholder="Email or phone" className="w-full mb-3 rounded-lg px-3 py-2 border border-ink/10"
          value={form.emailOrPhone} onChange={(e) => setForm({ ...form, emailOrPhone: e.target.value })} />
        <input required type="password" placeholder="Password" className="w-full mb-5 rounded-lg px-3 py-2 border border-ink/10"
          value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <button disabled={loading} className="w-full bg-ink text-paper rounded-full py-3 font-medium hover:bg-moss-deep transition disabled:opacity-50">
          {loading ? "Logging in…" : "Log in"}
        </button>
        <p className="text-sm text-ink/70 mt-4">
          New here? <Link href="/signup" className="text-moss-deep font-medium">Create an account</Link>
        </p>
      </form>
    </main>
  );
}
