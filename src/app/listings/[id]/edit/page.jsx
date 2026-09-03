"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PropertyCategorySelector from "@/components/PropertyCategorySelector";

const fields = ["title", "city", "area", "price", "contactNumber", "sizeValue", "sizeUnit", "plotLength", "plotWidth", "roadWidthFt", "facing", "bedrooms", "bathrooms", "nearbyLandmark", "description", "negotiable", "isCornerPlot"];

export default function EditListingPage() {
  const { id } = useParams();
  const router = useRouter();
  const [listing, setListing] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const update = (key, value) => setListing((current) => ({ ...current, [key]: value }));

  useEffect(() => {
    fetch(`/api/listings/${id}`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        setListing(data.listing);
      })
      .catch((reason) => setError(reason.message || "Could not load listing"));
  }, [id]);

  async function upload(event) {
    const files = [...(event.target.files || [])];
    if (!files.length) return;
    setBusy(true);
    const body = new FormData();
    files.forEach((file) => body.append("files", file));
    const response = await fetch("/api/upload", { method: "POST", body });
    const data = await response.json();
    setBusy(false);
    if (!response.ok) return setError(data.error || "Photo upload failed");
    setListing((current) => ({ ...current, photos: [...(current.photos || []), ...data.urls.map((url) => ({ url }))] }));
  }

  async function submit(event) {
    event.preventDefault();
    const categories = (listing.categories || []).map((item) => item.category);
    if (!categories.length) return setError("Select at least one section for this property.");
    setBusy(true);
    setError("");
    const payload = { action: "UPDATE", purpose: listing.purpose, propertyType: listing.propertyType, photos: listing.photos.map((photo) => photo.url), categories };
    fields.forEach((key) => { payload[key] = listing[key] ?? ""; });
    const response = await fetch(`/api/listings/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const data = await response.json();
    setBusy(false);
    if (!response.ok) return setError(data.error || "Could not save changes");
    router.push("/dashboard");
    router.refresh();
  }

  if (!listing && !error) return <main className="flex-1 px-5 py-16 text-center">Loading property...</main>;

  return (
    <main className="flex-1 bg-[#f7f7f3] pb-24">
      <form onSubmit={submit} className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <p className="text-xs font-bold uppercase tracking-widest text-moss">Owner listing</p>
        <h1 className="mt-2 font-display text-3xl">Edit property</h1>
        <p className="mt-2 text-sm text-ink-soft">Changes will be reviewed before the listing goes live again.</p>
        {error && <p className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {listing && (
          <div className="mt-6 rounded-3xl border border-ink/10 bg-white p-5 shadow-xl shadow-ink/5 sm:p-8">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Listing title" wide><input required value={listing.title || ""} onChange={(event) => update("title", event.target.value)} /></Field>
              <Field label="City"><input required value={listing.city || ""} onChange={(event) => update("city", event.target.value)} /></Field>
              <Field label="Locality"><input required value={listing.area || ""} onChange={(event) => update("area", event.target.value)} /></Field>
              <Field label={listing.purpose === "RENT" ? "Monthly rent" : "Expected price"}><input required type="number" value={listing.price || ""} onChange={(event) => update("price", event.target.value)} /></Field>
              <Field label="Contact number"><input required value={listing.contactNumber || ""} onChange={(event) => update("contactNumber", event.target.value)} /></Field>
              <Field label="Area"><input type="number" value={listing.sizeValue || ""} onChange={(event) => update("sizeValue", event.target.value)} /></Field>
              <Field label="Area unit"><select value={listing.sizeUnit || "sqft"} onChange={(event) => update("sizeUnit", event.target.value)}>{["sqft", "sqyard", "gaj", "acre"].map((unit) => <option key={unit}>{unit}</option>)}</select></Field>
              {listing.propertyType === "PLOT" && <>
                <Field label="Plot length (ft)"><input type="number" value={listing.plotLength || ""} onChange={(event) => update("plotLength", event.target.value)} /></Field>
                <Field label="Plot width (ft)"><input type="number" value={listing.plotWidth || ""} onChange={(event) => update("plotWidth", event.target.value)} /></Field>
                <Field label="Road width (ft)"><input type="number" value={listing.roadWidthFt || ""} onChange={(event) => update("roadWidthFt", event.target.value)} /></Field>
                <Field label="Facing"><select value={listing.facing || ""} onChange={(event) => update("facing", event.target.value)}><option value="">Select</option>{["North", "South", "East", "West", "North-East", "North-West", "South-East", "South-West"].map((direction) => <option key={direction}>{direction}</option>)}</select></Field>
                <Check label="Corner plot" value={listing.isCornerPlot} set={(value) => update("isCornerPlot", value)} />
              </>}
              {["HOUSE", "FLAT", "PG"].includes(listing.propertyType) && <>
                <Field label="Bedrooms / BHK"><input type="number" value={listing.bedrooms || ""} onChange={(event) => update("bedrooms", event.target.value)} /></Field>
                <Field label="Bathrooms"><input type="number" value={listing.bathrooms || ""} onChange={(event) => update("bathrooms", event.target.value)} /></Field>
              </>}
              <Field label="Nearby landmark" wide><input value={listing.nearbyLandmark || ""} onChange={(event) => update("nearbyLandmark", event.target.value)} /></Field>
              <Field label="Description" wide><textarea rows="5" value={listing.description || ""} onChange={(event) => update("description", event.target.value)} /></Field>
              <Check label="Price negotiable" value={listing.negotiable} set={(value) => update("negotiable", value)} />
              <PropertyCategorySelector value={(listing.categories || []).map((item) => item.category)} onChange={(value) => update("categories", value.map((category) => ({ category })))} required />
            </div>
            <section className="mt-7 border-t border-ink/10 pt-6">
              <div className="flex items-center justify-between"><div><h2 className="font-display text-xl">Property photos</h2><p className="text-xs text-ink-soft">First image is the cover photo.</p></div><label className="cursor-pointer rounded-xl bg-moss/10 px-4 py-2 text-sm font-semibold text-moss-deep">{busy ? "Uploading..." : "Add photos"}<input type="file" accept="image/*" multiple className="hidden" onChange={upload} /></label></div>
              <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">{listing.photos.map((photo, index) => <div key={photo.id || photo.url} className="relative aspect-square overflow-hidden rounded-xl"><img src={photo.url} alt={`Property ${index + 1}`} className="h-full w-full object-cover" /><button type="button" onClick={() => update("photos", listing.photos.filter((item) => item.url !== photo.url))} className="absolute right-1 top-1 grid h-7 w-7 place-items-center rounded-full bg-black/65 text-white">x</button>{index === 0 && <span className="absolute bottom-1 left-1 rounded bg-white px-2 py-1 text-[9px] font-bold">COVER</span>}</div>)}</div>
            </section>
            <div className="mt-7 flex gap-3"><button type="button" onClick={() => router.back()} className="rounded-xl border border-ink/15 px-6 py-3 text-sm font-semibold">Cancel</button><button disabled={busy || !listing.photos.length} className="flex-1 rounded-xl bg-moss px-6 py-3 text-sm font-bold text-white disabled:opacity-50">{busy ? "Saving..." : "Save & submit for review"}</button></div>
          </div>
        )}
      </form>
    </main>
  );
}

function Field({ label, wide, children }) { return <label className={wide ? "sm:col-span-2" : ""}><span className="text-sm font-semibold">{label}</span><div className="mt-2 [&_input]:w-full [&_input]:rounded-xl [&_input]:border [&_input]:border-ink/10 [&_input]:px-4 [&_input]:py-3 [&_select]:w-full [&_select]:rounded-xl [&_select]:border [&_select]:border-ink/10 [&_select]:bg-white [&_select]:px-4 [&_select]:py-3 [&_textarea]:w-full [&_textarea]:rounded-xl [&_textarea]:border [&_textarea]:border-ink/10 [&_textarea]:px-4 [&_textarea]:py-3">{children}</div></label>; }
function Check({ label, value, set }) { return <label className="flex items-center gap-3 rounded-xl border border-ink/10 p-4 text-sm font-medium"><input type="checkbox" checked={!!value} onChange={(event) => set(event.target.checked)} />{label}</label>; }
