"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { PROPERTY_TYPES_BY_PURPOSE } from "@/lib/listingFields";
const initial = {
  title: "",
  propertyType: "",
  city: "",
  area: "",
  price: "",
  contactNumber: "",
  sizeValue: "",
  sizeUnit: "sqft",
  plotLength: "",
  plotWidth: "",
  facing: "",
  roadWidthFt: "",
  bedrooms: "",
  bathrooms: "",
  floorNumber: "",
  totalFloors: "",
  furnishing: "",
  ownershipType: "",
  reraNumber: "",
  nearbyLandmark: "",
  description: "",
};
export default function NewListingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [purpose, setPurpose] = useState("SALE");
  const [form, setForm] = useState(initial);
  const [flags, setFlags] = useState({});
  const [photos, setPhotos] = useState([]);
  const [location, setLocation] = useState(null);
  const [mapInput, setMapInput] = useState("");
  const [locationMessage, setLocationMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const update = (k, v) => setForm((o) => ({ ...o, [k]: v }));
  const isPlot = form.propertyType === "PLOT";
  const isHome = ["FLAT", "HOUSE", "PG"].includes(form.propertyType);
  const isCommercial = ["SHOP", "SHOWROOM", "GODOWN", "OFFICE"].includes(
    form.propertyType,
  );
  function detectLocation() {
    setLocationMessage("Detecting your location…");
    if (!navigator.geolocation) return setLocationMessage("Location detection is not supported. Enter coordinates or paste a Google Maps link below.");
    navigator.geolocation.getCurrentPosition(
      (position) => { setLocation({ mapLat: position.coords.latitude, mapLng: position.coords.longitude }); setLocationMessage(`Location pinned with ${Math.round(position.coords.accuracy)} m accuracy.`); setError(""); },
      (reason) => { const messages = { 1: "Location permission is blocked. Allow Location from the address-bar settings, then retry—or paste a Maps link.", 2: "Your device could not determine its location. Paste a Maps link or enter coordinates.", 3: "Location request timed out. Retry or use the manual option." }; setLocationMessage(messages[reason.code] || "Location was unavailable. Use the manual option below."); },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 },
    );
  }
  function applyMapInput() {
    const match = mapInput.trim().match(/(?:@|query=|q=)?(-?\d{1,2}(?:\.\d+)?)[,\s]+(-?\d{1,3}(?:\.\d+)?)/);
    if (!match) return setLocationMessage("Coordinates not found. Paste a Maps link containing latitude/longitude, or enter: 28.6139, 77.2090");
    const mapLat = Number(match[1]), mapLng = Number(match[2]);
    if (Math.abs(mapLat) > 90 || Math.abs(mapLng) > 180) return setLocationMessage("Latitude or longitude is outside the valid range.");
    setLocation({ mapLat, mapLng }); setLocationMessage("Manual location pinned successfully."); setError("");
  }
  async function upload(e) {
    const files = [...(e.target.files || [])];
    if (!files.length) return;
    setLoading(true);
    const body = new FormData();
    files.forEach((f) => body.append("files", f));
    const res = await fetch("/api/upload", { method: "POST", body });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setError(data.error || "Upload failed");
    setPhotos((o) => [...o, ...data.urls]);
  }
  function next() {
    setError("");
    if (step === 1 && (!form.propertyType || !form.title))
      return setError("Choose a property type and add a listing title.");
    if (step === 2 && (!form.city || !form.area))
      return setError("Add the city and locality.");
    if (step === 3 && (!form.price || !form.contactNumber))
      return setError("Add the price and contact number.");
    setStep((s) => Math.min(4, s + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  async function submit(e) {
    e.preventDefault();
    if (!photos.length)
      return setError("Add at least one clear property photo.");
    setLoading(true);
    setError("");
    const numeric = [
      "price",
      "sizeValue",
      "plotLength",
      "plotWidth",
      "roadWidthFt",
      "bedrooms",
      "bathrooms",
      "floorNumber",
      "totalFloors",
    ];
    const payload = { ...form, ...flags, ...location, purpose, photos };
    numeric.forEach((k) => {
      payload[k] = form[k] === "" ? undefined : Number(form[k]);
    });
    const res = await fetch("/api/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setError(data.error || "Could not submit listing");
    router.push("/dashboard");
  }
  return (
    <main className="flex-1 bg-[#f7f7f3] pb-28 md:pb-16">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          <aside>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-moss">
              List on Bhoomi
            </p>
            <h1 className="mt-2 font-display text-3xl">Post your property</h1>
            <p className="mt-2 text-sm leading-6 text-ink-soft">
              Reach genuine local buyers. Your listing will be reviewed before
              it goes live.
            </p>
            <div className="mt-7 space-y-2">
              {[
                [1, "Property basics"],
                [2, "Location & details"],
                [3, "Price & contact"],
                [4, "Photos & publish"],
              ].map(([n, t]) => (
                <button
                  type="button"
                  onClick={() => n < step && setStep(n)}
                  key={n}
                  className={`flex w-full items-center gap-3 rounded-xl p-3 text-left text-sm ${step === n ? "bg-ink font-semibold text-white" : n < step ? "bg-moss/10 text-moss-deep" : "text-ink-soft"}`}
                >
                  <span
                    className={`grid h-7 w-7 place-items-center rounded-full text-xs ${step === n ? "bg-gold text-ink" : "bg-white"}`}
                  >
                    {n < step ? "✓" : n}
                  </span>
                  {t}
                </button>
              ))}
            </div>
            <div className="mt-7 hidden rounded-2xl bg-moss/10 p-4 text-xs leading-5 text-moss-deep lg:block">
              <strong>Private & secure</strong>
              <br />
              Verification documents are never displayed publicly.
            </div>
          </aside>
          <form onSubmit={submit} className="min-w-0">
            <div className="mb-4 flex h-2 overflow-hidden rounded-full bg-ink/8">
              <span
                className="bg-moss transition-all"
                style={{ width: `${step * 25}%` }}
              />
            </div>
            {error && (
              <p className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </p>
            )}
            <div className="rounded-3xl border border-ink/8 bg-white p-5 shadow-xl shadow-ink/5 sm:p-8">
              {step === 1 && (
                <>
                  <Heading
                    eyebrow="Step 1 of 4"
                    title="Tell us what you’re listing"
                    copy="We’ll only ask questions relevant to this property."
                  />
                  <div className="mt-7">
                    <p className="mb-2 text-sm font-semibold">I want to</p>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        ["SALE", "Sell"],
                        ["RENT", "Rent / lease"],
                      ].map(([v, l]) => (
                        <Choice
                          key={v}
                          active={purpose === v}
                          onClick={() => {
                            setPurpose(v);
                            update("propertyType", "");
                          }}
                        >
                          {l}
                        </Choice>
                      ))}
                    </div>
                  </div>
                  <div className="mt-6">
                    <p className="mb-2 text-sm font-semibold">
                      Property type *
                    </p>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                      {PROPERTY_TYPES_BY_PURPOSE[purpose].map((x) => (
                        <Choice
                          key={x.value}
                          active={form.propertyType === x.value}
                          onClick={() => update("propertyType", x.value)}
                        >
                          {x.label}
                        </Choice>
                      ))}
                    </div>
                  </div>
                  <div className="mt-6">
                    <Field
                      label="Listing title *"
                      hint="A clear title gets better responses"
                    >
                      <input
                        value={form.title}
                        onChange={(e) => update("title", e.target.value)}
                        placeholder="e.g. East-facing corner plot near main road"
                      />
                    </Field>
                  </div>
                </>
              )}
              {step === 2 && (
                <>
                  <Heading
                    eyebrow="Step 2 of 4"
                    title="Location & property details"
                    copy="Accurate local details help buyers shortlist confidently."
                  />
                  <div className="mt-7 grid gap-5 sm:grid-cols-2">
                    <Field label="City *">
                      <input
                        value={form.city}
                        onChange={(e) => update("city", e.target.value)}
                        placeholder="e.g. Gurugram"
                      />
                    </Field>
                    <Field label="Locality / sector *">
                      <input
                        value={form.area}
                        onChange={(e) => update("area", e.target.value)}
                        placeholder="e.g. Sector 66"
                      />
                    </Field>
                    <Field label="Nearby landmark" wide>
                      <input
                        value={form.nearbyLandmark}
                        onChange={(e) =>
                          update("nearbyLandmark", e.target.value)
                        }
                        placeholder="Metro, school, highway or market"
                      />
                    </Field>
                    <div className="sm:col-span-2 rounded-2xl border border-ink/10 bg-paper-dim p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-semibold">Property location pin <span className="font-normal text-ink-soft">(optional)</span></p><p className="mt-1 text-xs text-ink-soft">Detect your device location or paste coordinates from Google Maps.</p></div><button type="button" onClick={detectLocation} className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-moss-deep">{location ? "Location pinned ✓" : "Detect location"}</button></div>
                      <div className="mt-4 flex flex-col gap-2 sm:flex-row"><input value={mapInput} onChange={(e) => setMapInput(e.target.value)} placeholder="Paste Maps link or 28.6139, 77.2090" className="min-w-0 flex-1 rounded-xl border border-ink/10 bg-white px-3 py-2.5 text-sm"/><button type="button" onClick={applyMapInput} className="rounded-xl border border-moss/20 bg-white px-4 py-2.5 text-sm font-semibold text-moss-deep">Pin manually</button></div>
                      {locationMessage && <p className={`mt-3 text-xs ${location ? "text-moss-deep" : "text-ink-soft"}`}>{locationMessage}</p>}
                      {location && <a href={`https://www.google.com/maps?q=${location.mapLat},${location.mapLng}`} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs font-semibold text-moss-deep underline">Preview pinned location ↗</a>}
                    </div>
                    <Field label="Area">
                      <input
                        type="number"
                        value={form.sizeValue}
                        onChange={(e) => update("sizeValue", e.target.value)}
                      />
                    </Field>
                    <Field label="Area unit">
                      <select
                        value={form.sizeUnit}
                        onChange={(e) => update("sizeUnit", e.target.value)}
                      >
                        <option value="sqft">sq ft</option>
                        <option value="sqyard">sq yard</option>
                        <option value="gaj">gaj</option>
                        <option value="acre">acre</option>
                      </select>
                    </Field>
                    {isPlot && (
                      <>
                        <Field label="Plot length (ft)">
                          <input
                            type="number"
                            value={form.plotLength}
                            onChange={(e) =>
                              update("plotLength", e.target.value)
                            }
                          />
                        </Field>
                        <Field label="Plot width (ft)">
                          <input
                            type="number"
                            value={form.plotWidth}
                            onChange={(e) =>
                              update("plotWidth", e.target.value)
                            }
                          />
                        </Field>
                        <Field label="Road width in front (ft)">
                          <input
                            type="number"
                            value={form.roadWidthFt}
                            onChange={(e) =>
                              update("roadWidthFt", e.target.value)
                            }
                          />
                        </Field>
                        <Field label="Facing">
                          <Facing
                            value={form.facing}
                            set={(v) => update("facing", v)}
                          />
                        </Field>
                        <Check
                          label="This is a corner plot"
                          checked={flags.isCornerPlot}
                          onChange={(v) =>
                            setFlags((o) => ({ ...o, isCornerPlot: v }))
                          }
                        />
                        <Check
                          label="Development authority approved"
                          checked={flags.authorityApproved}
                          onChange={(v) =>
                            setFlags((o) => ({ ...o, authorityApproved: v }))
                          }
                        />
                      </>
                    )}
                    {isHome && (
                      <>
                        <Field label="Bedrooms / BHK">
                          <input
                            type="number"
                            value={form.bedrooms}
                            onChange={(e) => update("bedrooms", e.target.value)}
                          />
                        </Field>
                        <Field label="Bathrooms">
                          <input
                            type="number"
                            value={form.bathrooms}
                            onChange={(e) =>
                              update("bathrooms", e.target.value)
                            }
                          />
                        </Field>
                        <Field label="Floor number">
                          <input
                            type="number"
                            value={form.floorNumber}
                            onChange={(e) =>
                              update("floorNumber", e.target.value)
                            }
                          />
                        </Field>
                        <Field label="Total floors">
                          <input
                            type="number"
                            value={form.totalFloors}
                            onChange={(e) =>
                              update("totalFloors", e.target.value)
                            }
                          />
                        </Field>
                        <Field label="Furnishing">
                          <select
                            value={form.furnishing}
                            onChange={(e) =>
                              update("furnishing", e.target.value)
                            }
                          >
                            <option value="">Select</option>
                            <option value="UNFURNISHED">Unfurnished</option>
                            <option value="SEMI_FURNISHED">
                              Semi-furnished
                            </option>
                            <option value="FULLY_FURNISHED">
                              Fully furnished
                            </option>
                          </select>
                        </Field>
                      </>
                    )}
                    {isCommercial && (
                      <>
                        <Field label="Floor number">
                          <input
                            type="number"
                            value={form.floorNumber}
                            onChange={(e) =>
                              update("floorNumber", e.target.value)
                            }
                          />
                        </Field>
                        <Field label="Front road width (ft)">
                          <input
                            type="number"
                            value={form.roadWidthFt}
                            onChange={(e) =>
                              update("roadWidthFt", e.target.value)
                            }
                          />
                        </Field>
                      </>
                    )}
                  </div>
                </>
              )}
              {step === 3 && (
                <>
                  <Heading
                    eyebrow="Step 3 of 4"
                    title="Price, ownership & contact"
                    copy="These details stay editable from your dashboard."
                  />
                  <div className="mt-7 grid gap-5 sm:grid-cols-2">
                    <Field
                      label={
                        purpose === "RENT"
                          ? "Monthly rent *"
                          : "Expected price *"
                      }
                    >
                      <input
                        type="number"
                        value={form.price}
                        onChange={(e) => update("price", e.target.value)}
                        placeholder="Amount in ₹"
                      />
                    </Field>
                    <Field label="Your mobile number *">
                      <input
                        inputMode="tel"
                        value={form.contactNumber}
                        onChange={(e) =>
                          update("contactNumber", e.target.value)
                        }
                        placeholder="10-digit number"
                      />
                    </Field>
                    <Field label="Ownership type">
                      <select
                        value={form.ownershipType}
                        onChange={(e) =>
                          update("ownershipType", e.target.value)
                        }
                      >
                        <option value="">Select</option>
                        <option value="FREEHOLD">Freehold</option>
                        <option value="LEASEHOLD">Leasehold</option>
                        <option value="POWER_OF_ATTORNEY">
                          Power of attorney
                        </option>
                      </select>
                    </Field>
                    <Field label="RERA number">
                      <input
                        value={form.reraNumber}
                        onChange={(e) => update("reraNumber", e.target.value)}
                        placeholder="If applicable"
                      />
                    </Field>
                    <Check
                      label="Price is negotiable"
                      checked={flags.negotiable}
                      onChange={(v) =>
                        setFlags((o) => ({ ...o, negotiable: v }))
                      }
                    />
                    <Check
                      label="Bank loan available"
                      checked={flags.loanAvailable}
                      onChange={(v) =>
                        setFlags((o) => ({ ...o, loanAvailable: v }))
                      }
                    />
                    <Field label="Property description" wide>
                      <textarea
                        rows="5"
                        value={form.description}
                        onChange={(e) => update("description", e.target.value)}
                        placeholder="Share access, neighbourhood, condition and other useful details."
                      />
                    </Field>
                  </div>
                </>
              )}
              {step === 4 && (
                <>
                  <Heading
                    eyebrow="Step 4 of 4"
                    title="Add clear property photos"
                    copy="Listings with 5+ genuine photos receive more enquiries."
                  />
                  <label className="mt-7 grid min-h-48 cursor-pointer place-items-center rounded-2xl border-2 border-dashed border-moss/25 bg-moss/5 p-6 text-center">
                    <div>
                      <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-white text-2xl text-moss shadow-sm">
                        ＋
                      </span>
                      <p className="mt-3 font-semibold">
                        Upload property photos
                      </p>
                      <p className="mt-1 text-xs text-ink-soft">
                        JPEG, PNG, WebP or AVIF · max 8 MB each
                      </p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      multiple
                      onChange={upload}
                    />
                  </label>
                  {photos.length > 0 && (
                    <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
                      {photos.map((url, i) => (
                        <div
                          key={url}
                          className="relative aspect-square overflow-hidden rounded-xl"
                        >
                          <img
                            src={url}
                            alt={`Property ${i + 1}`}
                            className="h-full w-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setPhotos((p) => p.filter((x) => x !== url))
                            }
                            className="absolute right-1 top-1 grid h-7 w-7 place-items-center rounded-full bg-black/65 text-white"
                          >
                            ×
                          </button>
                          {i === 0 && (
                            <span className="absolute bottom-1 left-1 rounded bg-white px-2 py-1 text-[9px] font-bold">
                              COVER
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="mt-6 rounded-2xl bg-paper-dim p-4">
                    <label className="flex items-start gap-3 text-sm">
                      <input required type="checkbox" className="mt-1" />
                      <span>
                        I confirm the information is accurate and I am
                        authorised to list this property. I understand Bhoomi
                        reviews listings but buyers must independently verify
                        legal ownership.
                      </span>
                    </label>
                  </div>
                </>
              )}
            </div>
            <div className="mt-5 flex items-center justify-between">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => s - 1)}
                  className="rounded-xl border border-ink/15 px-6 py-3 text-sm font-semibold"
                >
                  Back
                </button>
              ) : (
                <span />
              )}
              {step < 4 ? (
                <button
                  type="button"
                  onClick={next}
                  className="rounded-xl bg-ink px-7 py-3 text-sm font-bold text-white"
                >
                  Continue →
                </button>
              ) : (
                <button
                  disabled={loading}
                  className="rounded-xl bg-moss px-7 py-3 text-sm font-bold text-white disabled:opacity-50"
                >
                  {loading ? "Submitting…" : "Submit for verification"}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
function Heading({ eyebrow, title, copy }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-widest text-gold">
        {eyebrow}
      </p>
      <h2 className="mt-2 font-display text-3xl">{title}</h2>
      <p className="mt-2 text-sm text-ink-soft">{copy}</p>
    </div>
  );
}
function Choice({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border p-4 text-left text-sm font-semibold transition ${active ? "border-moss bg-moss/8 text-moss-deep ring-2 ring-moss/10" : "border-ink/10 hover:border-moss/30"}`}
    >
      {children}
    </button>
  );
}
function Field({ label, hint, wide, children }) {
  return (
    <label className={wide ? "sm:col-span-2" : ""}>
      <span className="text-sm font-semibold">{label}</span>
      {hint && <span className="ml-2 text-xs text-ink-soft">{hint}</span>}
      <div className="mt-2 [&_input]:w-full [&_input]:rounded-xl [&_input]:border [&_input]:border-ink/10 [&_input]:px-4 [&_input]:py-3 [&_select]:w-full [&_select]:rounded-xl [&_select]:border [&_select]:border-ink/10 [&_select]:bg-white [&_select]:px-4 [&_select]:py-3 [&_textarea]:w-full [&_textarea]:rounded-xl [&_textarea]:border [&_textarea]:border-ink/10 [&_textarea]:px-4 [&_textarea]:py-3">
        {children}
      </div>
    </label>
  );
}
function Check({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-3 rounded-xl border border-ink/10 p-4 text-sm font-medium">
      <input
        type="checkbox"
        checked={!!checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label}
    </label>
  );
}
function Facing({ value, set }) {
  return (
    <select value={value} onChange={(e) => set(e.target.value)}>
      <option value="">Select</option>
      {[
        "North",
        "South",
        "East",
        "West",
        "North-East",
        "North-West",
        "South-East",
        "South-West",
      ].map((x) => (
        <option key={x}>{x}</option>
      ))}
    </select>
  );
}
