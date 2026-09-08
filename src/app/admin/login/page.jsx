"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    let active = true;
    fetch("/api/admin/auth/me", { credentials: "include", cache: "no-store" })
      .then((response) => { if (response.ok) router.replace("/admin/dashboard"); })
      .catch(() => {})
      .finally(() => { if (active) setCheckingSession(false); });
    return () => { active = false; };
  }, [router]);

  async function login(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ email: email.trim(), password }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) return setMessage(data.error || "Invalid email or password.");
      router.replace("/admin/dashboard");
      router.refresh();
    } catch {
      setMessage("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (checkingSession) return <main className="flex min-h-screen items-center justify-center bg-emerald-50 text-sm text-slate-500">Checking secure session…</main>;

  return <main className="flex min-h-screen items-center justify-center bg-emerald-50 px-5 py-12"><section className="w-full max-w-md rounded-3xl border border-emerald-100 bg-white p-7 shadow-xl shadow-emerald-950/10 sm:p-10">
    <div className="mb-8 text-center"><div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-emerald-900 text-white"><ShieldCheck size={25} /></div><p className="text-xl font-bold tracking-wide text-emerald-950">BHOOMI ADMIN</p><h1 className="mt-2 font-display text-3xl text-slate-900">Admin Portal</h1><p className="mt-2 text-sm text-slate-500">Sign in to manage Bhoomi.</p></div>
    {message && <p role="alert" className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{message}</p>}
    <form onSubmit={login}><label className="mb-2 block text-sm font-semibold text-slate-700">Email address</label><input required autoComplete="username" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="admin@example.com" className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100" /><label className="mb-2 mt-5 block text-sm font-semibold text-slate-700">Password</label><input required autoComplete="current-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100" /><button disabled={loading} className="mt-6 w-full rounded-xl bg-emerald-900 py-3 font-semibold text-white hover:bg-emerald-800 disabled:opacity-60">{loading ? "Signing in…" : "Login"}</button></form>
  </section></main>;
}
