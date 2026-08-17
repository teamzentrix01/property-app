# Bhoomi — Property Listing Platform (scaffold)

A working Next.js + PostgreSQL scaffold for a property listing marketplace:
owners/brokers post listings, area admins or a super admin approve them,
buyers browse and filter, and brokers can generate a shareable link to a
curated subset of their own listings.

## Stack
- Next.js 16 (App Router), plain JS/JSX — no TypeScript
- PostgreSQL via Prisma
- Tailwind CSS v4
- Lenis (smooth scroll), Framer Motion (animation), JWT + bcrypt auth (cookie-based)
- PWA-ready via `public/manifest.json`

## Getting started

1. Copy `.env.example` to `.env` and fill in `DATABASE_URL` (any Postgres —
   Neon/Supabase/Railway/local all work) and `JWT_SECRET`.
2. Install and set up the database:
   ```
   npm install
   npx prisma generate
   npx prisma migrate dev --name init
   ```
3. Run it:
   ```
   npm run dev
   ```

Without `DATABASE_URL` set, the homepage and browse page still render using
demo data (`src/lib/mockListings.js`) so you can preview the UI immediately —
signup/login/posting need the real database.

## What's built
- **Auth** — signup/login/logout, JWT in an httpOnly cookie (`src/app/api/auth`)
- **Listings** — browse with filters (`/listings`), detail page, create form
  with the mandatory-vs-optional field split from your spec (`src/lib/listingFields.js`)
- **Roles** — BUYER, OWNER, BROKER, AREA_ADMIN, SUPER_ADMIN (`prisma/schema.prisma`)
- **Approval workflow** — new listings are `PENDING` until an area admin
  (scoped to their `adminArea`) or super admin approves them, from `/dashboard`
- **Broker catalog links** — a broker picks specific listings and gets a
  `/c/<slug>` link to share; only shows what was selected (`src/app/api/catalog-links`)

## What's also built now
- **Image upload** (`/api/upload`) — real file upload to `public/uploads`,
  wired into the create-listing form with previews and remove buttons.
  Swap the `writeFile` call for S3/Cloudinary/UploadThing when you're ready
  to deploy somewhere without persistent local disk (e.g. Vercel).
- **Super admin panel** (`/admin/users`) — list every user, change their
  role, set an `AREA_ADMIN`'s city, toggle their verified badge.
- **"My listings"** on the dashboard now pulls real data from
  `GET /api/listings?ownerId=me` (shows pending/approved/rejected), with delete.
- **PWA icons** — `icon-192.png` / `icon-512.png` generated and linked in
  the manifest and metadata.
- **Offline shell caching** — `public/sw.js` + `RegisterSW` component cache
  the app shell and fall back to cache when the network is unavailable.

## Still worth doing before a real launch
- **SMS/OTP login** — currently email+phone / password only
- **Rate limiting / spam protection** on signup and listing creation
- **Move uploads to cloud storage** if deploying to a platform without a
  persistent filesystem (Vercel, etc.) — local disk uploads won't survive
  redeploys there

## Design
Palette, type system (Fraunces + Work Sans + JetBrains Mono), and the
animated plot-boundary hero are defined in `src/app/globals.css` and
`src/components/PlotBoundary.jsx` — change the CSS variables in
`globals.css` to retheme everything.
