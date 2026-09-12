"use client";
import PropertyCard from "@/components/PropertyCard";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, FileText, Heart, Home, Lock, LogOut, MapPin, Menu, Pencil, UserRound, X } from "lucide-react";
import { formatPrice } from "@/lib/formatters";
import UserDocuments from "@/components/UserDocuments";

const roleLabel = { BUYER: "Buyer", OWNER: "Property Owner", BROKER: "Property Broker" };
const nav = [["overview", "Overview", Home], ["profile", "My Profile", UserRound], ["saved", "Saved Properties", Heart], ["documents", "My Documents", FileText], ["posted", "My Posted Properties", Building2], ["preferences", "Buyer / Renter Details", MapPin]];
const blank = { name: "", phone: "", preferredCity: "", preferredLocation: "", preferredPropertyType: "", budgetRange: "", preferredBhk: "", searchPurpose: "" };
const date = (value) => value ? new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

export default function UserProfileDashboard() {
  const router = useRouter();
  const [section, setSection] = useState("overview");
  const [menu, setMenu] = useState(false);
  const [profile, setProfile] = useState(null);
  const [counts, setCounts] = useState({ saved: 0, posted: 0, documents: 0 });
  const [saved, setSaved] = useState([]); const [docs, setDocs] = useState([]); const [posted, setPosted] = useState([]);
  const [editing, setEditing] = useState(false); const [form, setForm] = useState(blank); const [notice, setNotice] = useState(""); const [error, setError] = useState("");
  const [lockedNotice, setLockedNotice] = useState(false);
  const load = async () => {
    const options = { credentials: "include", cache: "no-store" };
    const [p, s, d, l] = await Promise.all([fetch("/api/profile", options), fetch("/api/profile/saved-properties", options), fetch("/api/profile/documents", options), fetch("/api/profile/posted-properties", options)]);
    if (p.status === 401) return router.replace("/login?next=/dashboard");
    const profileData = await p.json(); setProfile(profileData.user); setCounts(profileData.counts || {}); setForm({ ...blank, ...profileData.user });
    setSaved((await s.json().catch(() => ({}))).listings || []); setDocs((await d.json().catch(() => ({}))).documents || []); setPosted((await l.json().catch(() => ({}))).listings || []);
  };
  // The dashboard has a one-time authenticated data load on mount.
  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
  useEffect(() => { load().catch(() => setError("We could not load your dashboard. Please refresh and try again.")); }, []);
  const selectSection = (key) => { setSection(key); setMenu(false); setNotice(""); };
  const saveProfile = async (event) => { event.preventDefault(); setError(""); const r = await fetch("/api/profile", { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) }); const data = await r.json(); if (!r.ok) return setError(data.error || "Could not save your profile"); setProfile(data.user); setForm({ ...blank, ...data.user }); setEditing(false); setNotice("Profile updated successfully."); };
  const removeSaved = async (id) => { const r = await fetch(`/api/profile/saved-properties?listingId=${encodeURIComponent(id)}`, { method: "DELETE", credentials: "include" }); if (r.ok) { setSaved((items) => items.filter((item) => item.id !== id)); setCounts((value) => ({ ...value, saved: Math.max(0, value.saved - 1) })); setNotice("Property removed from saved properties."); } };
  const deleteListing = async (id) => { if (!window.confirm("Delete this property listing?")) return; const r = await fetch(`/api/listings/${id}`, { method: "DELETE", credentials: "include" }); if (r.ok) { setPosted((items) => items.filter((item) => item.id !== id)); setCounts((value) => ({ ...value, posted: Math.max(0, value.posted - 1) })); } else setError("Could not delete the listing."); };
  const logout = async () => { await fetch("/api/auth/logout", { method: "POST", credentials: "include" }); router.push("/"); router.refresh(); };
  if (!profile) return <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-12"><div className="h-64 animate-pulse rounded-3xl bg-white" /></main>;
  const accountType = roleLabel[profile.role] || profile.role;
  const isVerified = profile.verificationStatus === "ACTIVE" || ["AREA_ADMIN", "SUPER_ADMIN"].includes(profile.role);
  return (
    <main className="flex-1 bg-slate-50">
      <div className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 lg:py-10">
        <div className="mb-6 flex items-center justify-between lg:hidden">
          <button
            onClick={() => setMenu(!menu)}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm font-semibold text-gray-800 shadow-sm"
          >
            {menu ? <X size={17}/> : <Menu size={17}/>} Account Menu
          </button>
          <span className="rounded-full bg-green-50 border border-green-200 px-3 py-1 text-xs font-bold text-green-800">{accountType}</span>
        </div>
        <div className="flex flex-col gap-6 lg:flex-row">
          <DashboardSidebar menu={menu} profile={profile} accountType={accountType} section={section} selectSection={selectSection} logout={logout}/>
          <section className="min-w-0 flex-1">
            {notice && <p className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-800">{notice}</p>}
            {error && <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}

            {section === "overview" && (
              <>
                <div className="rounded-2xl border border-green-200 bg-white p-6 text-gray-900 shadow-sm sm:p-8">
                  <p className="text-xs font-bold uppercase tracking-[.18em] text-green-700">Your Bhoomi Account</p>
                  <h1 className="mt-2 font-display text-3xl font-extrabold text-gray-950 sm:text-4xl">Welcome back, {profile.name.split(" ")[0]}</h1>
                  <p className="mt-2 text-sm text-gray-500">Manage your saved properties, documents, and listings from your personal dashboard.</p>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {[
                    [Heart, "Saved Properties", counts.saved, "text-red-600"],
                    [Building2, "My Properties", counts.posted, "text-green-700"],
                    [FileText, "Documents", counts.documents, "text-green-700"],
                    [UserRound, "Account Type", accountType, "text-green-700"]
                  ].map(([Icon, label, value, iconColor]) => (
                    <button
                      key={label}
                      onClick={() => label === "Saved Properties" ? selectSection("saved") : label === "My Properties" ? selectSection("posted") : label === "Documents" ? selectSection("documents") : selectSection("profile")}
                      className="rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm transition duration-200 hover:-translate-y-1 hover:border-green-300 hover:shadow-md"
                    >
                      <Icon className={iconColor || "text-green-700"} size={22} />
                      <p className="mt-4 text-xs font-bold uppercase tracking-wider text-gray-500">{label}</p>
                      <p className="mt-1 font-display text-2xl font-extrabold text-gray-900">{value}</p>
                    </button>
                  ))}
                </div>

                <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h3 className="font-bold text-gray-900">Account Overview</h3>
                  <div className="mt-4 grid gap-3 text-sm text-gray-600 sm:grid-cols-2">
                    <p><span className="font-medium text-gray-400">Email:</span> {profile.email}</p>
                    <p><span className="font-medium text-gray-400">Mobile:</span> {profile.phone || "Not provided"}</p>
                    <p><span className="font-medium text-gray-400">Member Since:</span> {date(profile.createdAt)}</p>
                    <p><span className="font-medium text-gray-400">Status:</span> <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${profile.verificationStatus === "ACTIVE" ? "bg-green-50 text-green-800" : profile.verificationStatus === "REJECTED" ? "bg-red-50 text-red-700 border border-red-200" : "bg-amber-50 text-amber-800"}`}>{profile.verificationStatus}</span></p>
                  </div>
                  {profile.verificationStatus === "REJECTED" && (
                    <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-800">
                      <strong className="font-bold">Account Verification Rejected:</strong>{" "}
                      {profile.rejectionReason || "Your account verification was rejected. Please re-upload clear and valid documents."}
                    </div>
                  )}
                </div>
              </>
            )}

            {section === "profile" && (
              <>
                <Header title="My Profile" action={!editing && (
                  <button onClick={() => setEditing(true)} className="inline-flex items-center gap-2 rounded-xl bg-green-700 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-green-800">
                    <Pencil size={15}/>Edit Profile
                  </button>
                )}/>
                {editing ? (
                  <ProfileForm form={form} setForm={setForm} onSubmit={saveProfile} onCancel={() => setEditing(false)}/>
                ) : (
                  <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="grid h-16 w-16 place-items-center rounded-2xl bg-[#DCFCE7] font-display text-2xl font-extrabold text-[#15803D]">
                        {profile.name[0]}
                      </div>
                      <div>
                        <p className="font-display text-2xl font-bold text-gray-900">{profile.name}</p>
                        <p className="text-sm text-gray-500">{profile.email}</p>
                      </div>
                    </div>
                    <Details values={[["Mobile Number", profile.phone], ["Account Type", accountType], ["Registration Date", date(profile.createdAt)], ["Account Status", profile.verificationStatus]]}/>
                  </div>
                )}
              </>
            )}

            {section === "preferences" && (
              <>
                <Header title="Buyer / Renter Preferences" action={
                  <button onClick={() => { setEditing(true); setSection("profile"); }} className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-800 shadow-sm hover:border-green-600 hover:text-green-700">
                    Edit Preferences
                  </button>
                }/>
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <p className="text-sm text-gray-500">Your property preferences help tailor our recommendations.</p>
                  <Details values={[
                    ["Looking to", profile.searchPurpose === "RENT" ? "Rent" : profile.searchPurpose === "SALE" ? "Buy" : "Not specified"],
                    ["Preferred City", profile.preferredCity || "Not specified"],
                    ["Preferred Locality", profile.preferredLocation || "Not specified"],
                    ["Property Type", profile.preferredPropertyType || "Not specified"],
                    ["Budget Range", profile.budgetRange || "Not specified"],
                    ["BHK", profile.preferredBhk || "Not specified"]
                  ]}/>
                </div>
              </>
            )}

            {section === "saved" && (
              <>
                <Header title={`Saved Properties (${saved.length})`}/>
                {saved.length ? (
                  <div className="flex flex-wrap gap-5">
                    {saved.map((l) => (
                      <ListingCard key={l.id} listing={l} actions={
                        <>
                          <Link href={`/listings/${l.id}`} className="flex-1 text-center rounded-xl bg-green-700 px-3 py-2 text-xs font-bold text-white transition hover:bg-green-800">
                            View Property
                          </Link>
                          <button onClick={() => removeSaved(l.id)} className="flex-1 text-center rounded-xl border border-red-200 px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50">
                            Remove
                          </button>
                        </>
                      }/>
                    ))}
                  </div>
                ) : (
                  <EmptyState href="/properties" action="Explore Properties">No saved properties yet.</EmptyState>
                )}
              </>
            )}

            {section === "documents" && (
              <>
                <Header title={`My Documents (${docs.length})`}/>
                <UserDocuments />
              </>
            )}

            {section === "posted" && (
              <>
                <Header title={`My Posted Properties (${posted.length})`} action={
                  isVerified ? (
                    <Link href="/post-property" className="rounded-xl bg-green-700 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-green-800">
                      Post Property
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setLockedNotice(true)}
                      className="inline-flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-bold text-amber-900 shadow-sm transition hover:bg-amber-100"
                      title="Account not verified by admin"
                    >
                      <Lock size={15} className="text-amber-700" />
                      <span>Post Property</span>
                      <span className="rounded-md bg-amber-200/90 px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-amber-900">Locked</span>
                    </button>
                  )
                }/>
                {posted.length ? (
                  <div className="flex flex-wrap gap-5">
                    {posted.map((l) => (
                      <ListingCard key={l.id} listing={l} actions={
                        <>
                          <Link href={`/listings/${l.id}`} className="flex-1 text-center rounded-xl bg-green-700 px-2.5 py-2 text-xs font-bold text-white transition hover:bg-green-800">
                            View
                          </Link>
                          <Link href={`/listings/${l.id}/edit`} className="flex-1 text-center rounded-xl border border-gray-200 px-2.5 py-2 text-xs font-bold text-gray-700 transition hover:bg-gray-50">
                            Edit
                          </Link>
                          <button onClick={() => deleteListing(l.id)} className="flex-1 text-center rounded-xl border border-red-200 px-2.5 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50">
                            Delete
                          </button>
                        </>
                      }/>
                    ))}
                  </div>
                ) : isVerified ? (
                  <EmptyState href="/post-property" action="Post Property">You haven&apos;t posted any property yet.</EmptyState>
                ) : (
                  <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-12 text-center text-sm text-gray-500 shadow-sm">
                    <p>You haven&apos;t posted any property yet.</p>
                    <button
                      type="button"
                      onClick={() => setLockedNotice(true)}
                      className="mt-4 inline-flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-5 py-2.5 text-xs font-bold text-amber-900 shadow-sm transition hover:bg-amber-100"
                    >
                      <Lock size={14} className="text-amber-700" />
                      <span>Post Property (Locked)</span>
                    </button>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </div>

      {/* Account Verification Required Modal */}
      {lockedNotice && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          onClick={() => setLockedNotice(false)}
        >
          <div
            className="relative flex flex-col w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 sm:p-7 text-center border border-gray-100 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setLockedNotice(false)}
              className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/80 mb-4">
              <Lock size={30} />
            </div>

            <h3 className="font-display text-xl font-extrabold text-gray-950">
              Account Not Verified
            </h3>

            <div className="mt-3 rounded-xl bg-amber-50 border border-amber-200 p-3.5 text-xs font-semibold text-amber-900 leading-relaxed">
              Your account is not verified by the admin so you cannot post any property.
            </div>

            <p className="mt-3 text-xs text-gray-500 leading-relaxed">
              Please make sure your verification documents (Aadhaar, PAN, Address Proof) are submitted. Once reviewed and approved by the admin, property posting will be unlocked.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setLockedNotice(false);
                  selectSection("documents");
                }}
                className="flex-1 rounded-xl bg-green-700 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-green-800"
              >
                Go to My Documents
              </button>
              <button
                type="button"
                onClick={() => setLockedNotice(false)}
                className="rounded-xl border border-gray-200 px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-100 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
function Header({ title, action }) { return <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><h1 className="font-display text-2xl font-extrabold text-gray-900 sm:text-3xl">{title}</h1>{action}</div>; }
function DashboardSidebar({ menu, profile, accountType, section, selectSection, logout }) {
  return (
    <aside className={`${menu ? "block" : "hidden"} rounded-2xl bg-[#14532D] p-4 text-white shadow-xl shadow-green-950/15 lg:block lg:w-64 lg:shrink-0 lg:self-start`}>
      <div className="border-b border-white/15 px-2 pb-4">
        <p className="font-display text-lg font-bold text-white">{profile.name}</p>
        <p className="mt-0.5 text-xs font-semibold text-green-200">{accountType}</p>
      </div>
      <nav className="mt-4 space-y-1.5">
        {nav.map(([key, label, Icon]) => (
          <button
            key={key}
            onClick={() => selectSection(key)}
            className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-xs font-bold transition duration-150 ${
              section === key
                ? "bg-white text-[#14532D] shadow-sm"
                : "text-green-100 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Icon size={16} className={section === key ? "text-[#14532D]" : "text-green-300"} />
            <span>{label}</span>
          </button>
        ))}
        <button
          onClick={logout}
          className="mt-4 flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-xs font-bold text-red-200 transition duration-150 hover:bg-red-500/20 hover:text-white"
        >
          <LogOut size={16} />
          Logout
        </button>
      </nav>
    </aside>
  );
}
function EmptyState({ children, href, action }) { return <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-12 text-center text-sm text-gray-500 shadow-sm"><p>{children}</p><Link href={href} className="mt-4 inline-block rounded-xl bg-green-700 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-green-800">{action}</Link></div>; }
function Details({ values }) { return <dl className="mt-6 grid gap-4 sm:grid-cols-2">{values.map(([label, value]) => <div key={label} className="rounded-xl border border-gray-100 bg-slate-50 p-4"><dt className="text-xs font-bold uppercase tracking-wider text-gray-400">{label}</dt><dd className="mt-1 text-sm font-semibold text-gray-900">{value || "Not specified"}</dd></div>)}</dl>; }
function ProfileForm({ form, setForm, onSubmit, onCancel }) {
  const update = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const fields = [["name","Full Name"],["phone","Mobile Number"],["preferredCity","Preferred City"],["preferredLocation","Preferred Locality"],["preferredPropertyType","Property Type"],["budgetRange","Budget Range"],["preferredBhk","BHK"]];
  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <p className="mb-5 text-xs text-gray-400">Email and account type are managed securely and cannot be changed here.</p>
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map(([name,label]) => (
          <label key={name} className="block text-xs font-bold uppercase tracking-wider text-gray-600">
            {label}
            <input name={name} value={form[name] || ""} onChange={update} className="mt-1.5 w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm font-medium text-gray-800 outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100" />
          </label>
        ))}
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">
          Looking to
          <select name="searchPurpose" value={form.searchPurpose || ""} onChange={update} className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm font-medium text-gray-800 outline-none focus:border-green-700 focus:ring-2 focus:ring-green-100">
            <option value="">Not specified</option>
            <option value="SALE">Buy</option>
            <option value="RENT">Rent</option>
          </select>
        </label>
      </div>
      <div className="mt-6 flex gap-3">
        <button type="submit" className="rounded-xl bg-green-700 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-green-800">
          Save Profile
        </button>
        <button type="button" onClick={onCancel} className="rounded-xl border border-gray-200 px-6 py-2.5 text-sm font-bold text-gray-700 transition hover:bg-gray-50">
          Cancel
        </button>
      </div>
    </form>
  );
}
function ListingCard({ listing, actions }) { return <PropertyCard listing={listing} variant="dashboard">{actions}</PropertyCard>; }
