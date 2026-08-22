"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function Dashboard() {
  const [user, setUser] = useState(undefined);
  const [pending, setPending] = useState([]);
  const [myListings, setMyListings] = useState(undefined);
  const [links, setLinks] = useState([]);
  const [selected, setSelected] = useState([]);
  const [linkTitle, setLinkTitle] = useState("");
  const [savedListings, setSavedListings] = useState([]);
  const [inquiries, setInquiries] = useState([]);

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
        .then((d) => setPending(d.listings || []));
    }
    if (user.role === "BROKER") {
      fetch("/api/catalog-links")
        .then((r) => r.json())
        .then((d) => setLinks(d.links || []));
    }
    if (["OWNER", "BROKER"].includes(user.role)) {
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

  async function approve(id, status) {
    const rejectionReason = status === "REJECTED" ? prompt("Why is this listing being rejected? The seller will see this message.") : undefined;
    if (status === "REJECTED" && rejectionReason === null) return;
    await fetch(`/api/listings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, rejectionReason }),
    });
    setPending((p) => p.filter((l) => l.id !== id));
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
    <main className="flex-1 max-w-4xl mx-auto px-6 py-12 w-full">
      <h1 className="font-display text-3xl mb-1">Hi, {user.name}</h1>
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

      {["OWNER", "BROKER"].includes(user.role) && (
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
                className="bg-paper text-ink rounded-xl p-4 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium">{l.title}</p>
                  <p className="font-data text-xs text-ink-soft">
                    {l.area}, {l.city} ·{" "}
                    <span
                      className={
                        l.status === "APPROVED"
                          ? "text-moss-deep"
                          : l.status === "REJECTED"
                            ? "text-red-700"
                            : "text-gold"
                      }
                    >
                      {l.status}
                    </span>
                  </p>
                  {l.rejectionReason && <p className="mt-2 max-w-lg text-xs text-red-700">Reason: {l.rejectionReason}</p>}
                </div>
                <div className="flex gap-2">{l.status === "REJECTED" && <button onClick={() => resubmit(l.id)} className="rounded-full bg-moss px-3 py-1.5 text-sm text-white">Resubmit</button>}<button onClick={() => deleteListing(l.id)} className="border border-ink/20 text-sm px-3 py-1.5 rounded-full">Delete</button></div>
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
              <Link
                href="/admin/users"
                className="font-data text-sm text-gold hover:underline"
              >
                Manage users →
              </Link>
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
                <div className="flex gap-2">
                  <button
                    onClick={() => approve(l.id, "APPROVED")}
                    className="bg-moss text-paper text-sm px-3 py-1.5 rounded-full"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => approve(l.id, "REJECTED")}
                    className="border border-ink/20 text-sm px-3 py-1.5 rounded-full"
                  >
                    Reject
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
