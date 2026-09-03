"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AdminOverview from "@/components/AdminOverview";
import { CONTENT_CATEGORIES } from "@/lib/contentCategories";
import StatusBadge, { statusLabel } from "@/components/StatusBadge";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(undefined);
  const [pending, setPending] = useState([]);
  const [myListings, setMyListings] = useState(undefined);
  const [links, setLinks] = useState([]);
  const [selected, setSelected] = useState([]);
  const [linkTitle, setLinkTitle] = useState("");
  const [savedListings, setSavedListings] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [recommendationSections, setRecommendationSections] = useState([]);
  const [homepageListings, setHomepageListings] = useState([]);
  const [recommendationForm, setRecommendationForm] = useState({ title: "", subtitle: "", listingIds: "" });
  const [listingCategories, setListingCategories] = useState({});
  const [statusSaving, setStatusSaving] = useState({});
  const [statusErrors, setStatusErrors] = useState({});

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setUser(d.user));
  }, []);

  useEffect(() => {
    if (!user) return;
    fetch("/api/inquiries")
      .then((r) => (r.ok ? r.json() : { inquiries: [] }))
      .then((d) => setInquiries(d.inquiries || []));
    fetch("/api/saved")
      .then((r) => (r.ok ? r.json() : { listings: [] }))
      .then((d) => setSavedListings(d.listings || []));
    if (["AREA_ADMIN", "SUPER_ADMIN"].includes(user.role)) {
      fetch("/api/admin/pending-listings")
        .then((r) => r.json())
        .then((d) => {
          const listings = d.listings || [];
          setPending(listings);
          setListingCategories(Object.fromEntries(listings.map((listing) => [listing.id, (listing.categories || []).map((item) => item.category)])));
        });
    }
    if (user.role === "BROKER") {
      fetch("/api/catalog-links")
        .then((r) => r.json())
        .then((d) => setLinks(d.links || []));
    }
    if (user.role === "SUPER_ADMIN") {
      fetch("/api/admin/homepage")
        .then((r) => r.json())
        .then((d) => {
          setRecommendationSections(d.sections || []);
          setHomepageListings(d.listings || []);
        });
    }
    if (user) {
      fetch("/api/listings?ownerId=me")
        .then((r) => r.json())
        .then((d) => setMyListings(d.listings || []));
    }
  }, [user]);

  async function deleteListing(id) {
    if (!confirm("Delete this listing?")) return;
    await fetch(`/api/listings/${id}`, { method: "DELETE" });
    setMyListings((ls) => ls.filter((l) => l.id !== id));
  }

  async function changeListingStatus(listing, status) {
    const previousStatus = listing.status;
    if (status === previousStatus) return;
    if (status === "REJECTED") {
      const rejectionReason = prompt("Why is this listing being rejected?");
      if (rejectionReason === null) return;
      listing = { ...listing, rejectionReason };
    }
    setStatusErrors((current) => ({ ...current, [listing.id]: "" }));
    setStatusSaving((current) => ({ ...current, [listing.id]: true }));
    setMyListings((items) => items.map((item) => item.id === listing.id ? { ...item, status, rejectionReason: listing.rejectionReason } : item));
    const response = await fetch(`/api/listings/${listing.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, rejectionReason: listing.rejectionReason }),
    });
    const data = await response.json().catch(() => ({}));
    setStatusSaving((current) => ({ ...current, [listing.id]: false }));
    if (!response.ok) {
      setMyListings((items) => items.map((item) => item.id === listing.id ? { ...item, status: previousStatus } : item));
      setStatusErrors((current) => ({ ...current, [listing.id]: data.error || "Could not update status" }));
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  async function approve(id, status) {
    const rejectionReason = status === "REJECTED" ? prompt("Why is this listing being rejected? The seller will see this message.") : undefined;
    if (status === "REJECTED" && rejectionReason === null) return;
    const response = await fetch(`/api/listings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, rejectionReason, categories: listingCategories[id] || [] }),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      return window.alert(data.error || "Could not update this listing");
    }
    setPending((items) => items.map((item) => item.id === id ? { ...item, status, rejectionReason: status === "REJECTED" ? rejectionReason : item.rejectionReason } : item));
  }

  function toggleCategory(listingId, category) {
    setListingCategories((current) => {
      const selectedCategories = current[listingId] ?? [];
      return { ...current, [listingId]: selectedCategories.includes(category) ? selectedCategories.filter((item) => item !== category) : [...selectedCategories, category] };
    });
  }

  async function resubmit(id) {
    const res = await fetch(`/api/listings/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "PENDING" }) });
    if (res.ok) setMyListings((items) => items.map((item) => item.id === id ? { ...item, status: "PENDING", rejectionReason: null } : item));
  }

  async function createLink() {
    const res = await fetch("/api/catalog-links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: linkTitle, listingIds: selected }),
    });
    const data = await res.json();
    if (res.ok) {
      setLinks((l) => [data.link, ...l]);
      setSelected([]);
      setLinkTitle("");
    }
  }

  async function become(role) {
    const label = role === "OWNER" ? "Owner" : "Broker";
    if (
      !confirm(`Switch your account to ${label}? You can then post properties.`)
    )
      return;
    const res = await fetch("/api/auth/account-role", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    const data = await res.json();
    if (res.ok) setUser(data.user);
  }

  async function createRecommendationSection() {
    const listingIds = recommendationForm.listingIds
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);

    if (!recommendationForm.title.trim()) {
      alert("Section title is required.");
      return;
    }
    if (listingIds.length === 0) {
      alert("Add at least one approved listing ID.");
      return;
    }

    const res = await fetch("/api/admin/homepage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: recommendationForm.title,
        subtitle: recommendationForm.subtitle,
        listingIds,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Unable to create recommendation block");
      return;
    }

    setRecommendationSections((items) => [data.section, ...items]);
    setRecommendationForm({ title: "", subtitle: "", listingIds: "" });
  }

  async function removeRecommendationSection(sectionId) {
    const res = await fetch("/api/admin/homepage", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sectionId }),
    });
    if (res.ok) {
      setRecommendationSections((items) => items.filter((section) => section.id !== sectionId));
    }
  }

  if (user === undefined)
    return <main className="flex-1 px-6 py-16">Loading…</main>;
  if (user === null) {
    return (
      <main className="flex-1 px-6 py-16 text-center">
        <p className="mb-4">You need to log in to see your dashboard.</p>
        <Link
          href="/login"
          className="bg-gold text-ink px-6 py-3 rounded-full font-medium"
        >
          Log in
        </Link>
      </main>
    );
  }

  return (
    <main className={`flex-1 mx-auto px-4 sm:px-6 py-12 w-full ${user.role === "SUPER_ADMIN" ? "max-w-7xl" : "max-w-4xl"}`}>
      <div className="flex items-start justify-between gap-4"><h1 className="font-display text-3xl mb-1">Hi, {user.name}</h1><button onClick={logout} className="rounded-full border border-ink/15 px-4 py-2 text-xs font-semibold text-ink-soft md:hidden">Log out</button></div>
      <p className="font-data text-xs uppercase tracking-wide text-gold mb-10">
        {user.role.replaceAll("_", " ")}
      </p>

      {user.role === "BUYER" && (
        <section className="mb-12 space-y-5">
          <div className="rounded-3xl bg-ink p-7 text-paper shadow-xl shadow-ink/10">
            <p className="font-data text-xs uppercase tracking-[.16em] text-gold">
              Your property search
            </p>
            <h2 className="mt-2 font-display text-3xl">
              Find a place you’ll love.
            </h2>
            <p className="mt-3 max-w-xl text-paper/75">
              Browse approved homes, plots and commercial spaces. Contact owners
              and brokers directly when something fits.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/listings"
                className="rounded-full bg-gold px-5 py-3 font-medium text-ink"
              >
                Browse properties
              </Link>
              <Link
                href="/listings?purpose=RENT"
                className="rounded-full border border-paper/30 px-5 py-3"
              >
                Explore rentals
              </Link>
            </div>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="rounded-2xl border border-ink/10 bg-paper-dim p-6">
              <p className="font-data text-xs uppercase tracking-wide text-moss">
                Have a property?
              </p>
              <h3 className="mt-2 font-display text-2xl">Become an owner</h3>
              <p className="mt-2 text-sm text-ink-soft">
                Post and manage your own property listings for review.
              </p>
              <button
                onClick={() => become("OWNER")}
                className="mt-5 rounded-full bg-moss px-4 py-2.5 text-sm font-medium text-paper"
              >
                Become an owner
              </button>
            </div>
            <div className="rounded-2xl border border-ink/10 bg-paper-dim p-6">
              <p className="font-data text-xs uppercase tracking-wide text-moss">
                Work with listings?
              </p>
              <h3 className="mt-2 font-display text-2xl">Become a broker</h3>
              <p className="mt-2 text-sm text-ink-soft">
                Post client properties and share curated property collections.
              </p>
              <button
                onClick={() => become("BROKER")}
                className="mt-5 rounded-full border border-ink/20 bg-paper px-4 py-2.5 text-sm font-medium"
              >
                Become a broker
              </button>
            </div>
          </div>
          <div className="rounded-2xl border border-dashed border-ink/20 px-6 py-8 text-center">
            <h3 className="font-display text-xl">Save properties you like</h3>
            <p className="mt-2 text-sm text-ink-soft">
              Your saved homes, enquiries and price alerts will appear here.
            </p>
            <Link
              href="/listings"
              className="mt-4 inline-block text-sm font-medium text-moss-deep underline"
            >
              Start exploring
            </Link>
          </div>
          {savedListings.length > 0 && (
            <div id="saved">
              <h2 className="mb-3 font-display text-2xl">Saved properties</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {savedListings.map((l) => (
                  <Link key={l.id} href={`/listings/${l.id}`} className="rounded-2xl border border-ink/10 bg-white p-4">
                    <p className="font-semibold">{l.title}</p>
                    <p className="mt-1 text-sm text-ink-soft">{l.area}, {l.city}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {inquiries.length > 0 && (
        <section className="mb-12">
          <h2 className="mb-4 font-display text-2xl">{["OWNER", "BROKER"].includes(user.role) ? "Buyer enquiries" : "Your visit requests"}</h2>
          <div className="space-y-3">
            {inquiries.map((q) => (
              <div key={q.id} className="rounded-2xl border border-ink/10 bg-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-3"><div><Link href={`/listings/${q.listing.id}`} className="font-semibold text-moss-deep">{q.listing.title}</Link><p className="text-xs text-ink-soft">{q.listing.area}, {q.listing.city}</p></div><span className="text-xs text-ink-soft">{new Date(q.createdAt).toLocaleDateString("en-IN")}</span></div>
                <p className="mt-3 text-sm leading-6">{q.message}</p>
                {q.recipientId === user.id && <a href={`tel:${q.sender.phone}`} className="mt-3 inline-block rounded-full bg-ink px-4 py-2 text-xs font-semibold text-white">Call {q.sender.name}</a>}
              </div>
            ))}
          </div>
        </section>
      )}

      {user && !["AREA_ADMIN", "SUPER_ADMIN"].includes(user.role) && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl">Your listings</h2>
            <Link
              href="/listings/new"
              className="font-data text-sm text-gold hover:underline"
            >
              + Post new
            </Link>
          </div>
          {myListings === undefined && (
            <p className="text-ink-soft text-sm">Loading…</p>
          )}
          {myListings?.length === 0 && (
            <p className="text-ink-soft text-sm">
              You haven&apos;t posted anything yet.
            </p>
          )}
          <ul className="space-y-2">
            {myListings?.map((l) => (
              <li
                key={l.id}
                className="bg-paper text-ink rounded-xl p-4"
              >
                <div role="link" tabIndex={0} onClick={() => router.push(`/listings/${l.id}/edit`)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); router.push(`/listings/${l.id}/edit`); } }} className="min-w-0 flex-1 cursor-pointer">
                  <div className="flex flex-wrap items-center gap-2"><p className="font-medium">{l.title}</p><StatusSelect listing={l} saving={!!statusSaving[l.id]} onChange={changeListingStatus} /></div>
                  {statusErrors[l.id] && <p className="mt-1 text-xs text-red-700">{statusErrors[l.id]}</p>}
                  <p className="font-data text-xs text-ink-soft">
                    {l.area}, {l.city}
                  </p>
                  {l.rejectionReason && <p className="mt-2 max-w-lg text-xs text-red-700">Reason: {l.rejectionReason}</p>}
                  {l.categories?.length > 0 && <div className="mt-2 flex flex-wrap gap-1.5">{l.categories.map((item) => <span key={item.category} className="rounded-full bg-moss/10 px-2 py-1 text-[10px] font-semibold text-moss-deep">{CONTENT_CATEGORIES.find((category) => category.value === item.category)?.label || item.category}</span>)}</div>}
                  {l.categories?.length > 0 && <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">{l.categories.map((item) => { const category = CONTENT_CATEGORIES.find((entry) => entry.value === item.category); return category && <Link key={item.category} href={`/categories/${category.slug}`} className="rounded-xl border border-moss/20 bg-white px-3 py-2 text-center text-xs font-semibold text-moss-deep hover:bg-moss/10">View {category.label}</Link>; })}</div>}
                  <p className="mt-2 text-xs font-semibold text-moss-deep">Tap to edit →</p>
                </div>
                <div className="ml-3 flex gap-2">{l.status === "REJECTED" && <button onClick={() => resubmit(l.id)} className="rounded-full bg-moss px-3 py-1.5 text-sm text-white">Resubmit</button>}<button onClick={() => deleteListing(l.id)} className="border border-ink/20 text-sm px-3 py-1.5 rounded-full">Delete</button></div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {user.role === "BROKER" && (
        <section className="mb-12">
          <h2 className="font-display text-xl mb-4">
            Share a filtered catalog
          </h2>
          <p className="text-ink-soft text-sm mb-4">
            Pick specific listings of yours (e.g. only your Buddhi Vihar plots)
            and get one link to send a buyer.
          </p>
          <div className="bg-paper text-ink rounded-2xl p-5 mb-4">
            <input
              placeholder="Collection title, e.g. Buddhi Vihar Plots"
              value={linkTitle}
              onChange={(e) => setLinkTitle(e.target.value)}
              className="w-full mb-3 rounded-lg px-3 py-2 border border-ink/10"
            />
            <input
              placeholder="Listing IDs, comma separated (from your listings above)"
              onChange={(e) =>
                setSelected(
                  e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                )
              }
              className="w-full mb-3 rounded-lg px-3 py-2 border border-ink/10"
            />
            <button
              onClick={createLink}
              className="bg-ink text-paper rounded-full px-5 py-2 font-medium hover:bg-moss-deep transition"
            >
              Generate link
            </button>
          </div>
          <ul className="space-y-2">
            {links.map((l) => (
              <li key={l.id} className="font-data text-sm">
                {l.title || "Untitled"} —{" "}
                <a className="text-gold hover:underline" href={`/c/${l.slug}`}>
                  /c/{l.slug}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {user.role === "SUPER_ADMIN" && (
        <section className="mb-12 rounded-3xl border border-ink/10 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="font-data text-xs uppercase tracking-[.16em] text-gold">Homepage control</p>
              <h2 className="mt-2 font-display text-2xl">Recommendation blocks</h2>
            </div>
          </div>

          <div className="mb-6 grid gap-4 rounded-2xl border border-ink/10 bg-paper-dim p-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-ink-soft">Section title</label>
              <input
                value={recommendationForm.title}
                onChange={(e) => setRecommendationForm((prev) => ({ ...prev, title: e.target.value }))}
                className="w-full rounded-xl border border-ink/10 bg-white px-3 py-2.5 text-sm"
                placeholder="Trending homes in Gurgaon"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-ink-soft">Subtitle</label>
              <input
                value={recommendationForm.subtitle}
                onChange={(e) => setRecommendationForm((prev) => ({ ...prev, subtitle: e.target.value }))}
                className="w-full rounded-xl border border-ink/10 bg-white px-3 py-2.5 text-sm"
                placeholder="Handpicked for you"
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-ink-soft">Approved listing IDs</label>
              <textarea
                rows={3}
                value={recommendationForm.listingIds}
                onChange={(e) => setRecommendationForm((prev) => ({ ...prev, listingIds: e.target.value }))}
                className="w-full rounded-xl border border-ink/10 bg-white px-3 py-2.5 text-sm"
                placeholder="clx123, clx456, clx789"
              />
              <p className="mt-2 text-xs text-ink-soft">Use approved listing IDs. Each section will show on the homepage in the order it is created.</p>
            </div>
            <div className="md:col-span-2">
              <button
                onClick={createRecommendationSection}
                className="rounded-full bg-moss px-5 py-2.5 text-sm font-semibold text-white"
              >
                Save recommendation block
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {recommendationSections.length === 0 && (
              <p className="text-sm text-ink-soft">No recommendation blocks yet. Add one to populate homepage sections.</p>
            )}
            {recommendationSections.map((section) => (
              <div key={section.id} className="rounded-2xl border border-ink/10 bg-paper p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-moss">{section.subtitle || "Recommendation section"}</p>
                    <h3 className="mt-1 font-display text-xl">{section.title}</h3>
                  </div>
                  <button onClick={() => removeRecommendationSection(section.id)} className="rounded-full border border-ink/15 px-3 py-1.5 text-xs font-semibold text-ink-soft">Delete</button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(section.items || []).map((item) => (
                    <span key={item.id} className="rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-ink-soft ring-1 ring-ink/10">
                      {item.listing?.title || item.listingId}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {homepageListings.length > 0 && (
            <div className="mt-6">
              <h3 className="mb-3 font-display text-xl">Approved listings</h3>
              <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                {homepageListings.map((listing) => (
                  <div key={listing.id} className="rounded-xl border border-ink/10 bg-white p-3 text-sm">
                    <p className="font-semibold">{listing.title}</p>
                    <p className="mt-1 text-ink-soft">{listing.area}, {listing.city}</p>
                    <p className="mt-2 font-data text-[11px] uppercase tracking-wide text-moss">ID: {listing.id}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {user.role === "SUPER_ADMIN" && <AdminOverview />}

      {["AREA_ADMIN", "SUPER_ADMIN"].includes(user.role) && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl">
              Pending approval{" "}
              {user.role === "AREA_ADMIN" && user.adminArea
                ? `— ${user.adminArea}`
                : "— all areas"}
            </h2>
            {user.role === "SUPER_ADMIN" && (
              <div className="flex gap-4 font-data text-sm text-gold">
                <Link href="/admin/content" className="hover:underline">Category pages →</Link>
                <Link href="/admin/users" className="hover:underline">Manage users →</Link>
              </div>
            )}
          </div>
          {pending.length === 0 && (
            <p className="text-ink-soft text-sm">Nothing waiting right now.</p>
          )}
          <ul className="space-y-3">
            {pending.map((l) => (
              <li
                key={l.id}
                className="bg-paper text-ink rounded-xl p-4 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium">{l.title}</p>
                  <p className="font-data text-xs text-ink-soft">
                    {l.area}, {l.city} · posted by {l.owner?.name} (
                    {l.owner?.role})
                  </p>
                </div>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 border-t border-ink/10 pt-3">
                  {CONTENT_CATEGORIES.map((category) => <label key={category.value} className="flex cursor-pointer items-center gap-1.5 text-xs text-ink-soft"><input type="checkbox" checked={(listingCategories[l.id] || l.categories?.map((item) => item.category) || []).includes(category.value)} onChange={() => toggleCategory(l.id, category.value)} /> {category.label}</label>)}
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <select value={l.status} onChange={(event) => approve(l.id, event.target.value)} className="rounded-xl border border-ink/15 bg-white px-3 py-2 text-xs font-semibold">
                    {["PENDING", "UNDER_REVIEW", "APPROVED", "ACTIVE", "REJECTED", "INACTIVE"].map((status) => <option key={status} value={status}>{statusLabel(status)}</option>)}
                  </select>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}

function StatusSelect({ listing, saving, onChange }) {
  const colors = {
    PENDING: "border-yellow-200 bg-yellow-100 text-yellow-800",
    UNDER_REVIEW: "border-blue-200 bg-blue-100 text-blue-800",
    APPROVED: "border-green-200 bg-green-100 text-green-800",
    REJECTED: "border-red-200 bg-red-100 text-red-700",
    ACTIVE: "border-green-300 bg-green-200 text-green-900",
    INACTIVE: "border-gray-300 bg-gray-200 text-gray-700",
  };
  const statuses = ["PENDING", "UNDER_REVIEW", "APPROVED", "REJECTED", "ACTIVE", "INACTIVE"];
  return <select aria-label={`Change status for ${listing.title}`} value={listing.status} disabled={saving} onClick={(event) => event.stopPropagation()} onChange={(event) => onChange(listing, event.target.value)} className={`rounded-full border px-3 py-1 text-xs font-bold outline-none ${colors[listing.status] || "border-gray-200 bg-gray-100 text-gray-700"}`}>
    {statuses.map((status) => <option key={status} value={status}>{statusLabel(status)}{saving && status === listing.status ? "..." : ""}</option>)}
  </select>;
}
