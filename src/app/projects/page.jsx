import Link from "next/link";
import { Sparkles, Building2, Crown, Store, MapPin, ArrowRight } from "lucide-react";
import { getApprovedListings } from "@/lib/getListings";
import PropertyCard from "@/components/PropertyCard";

export const metadata = {
  title: "New Projects & Developments | Bhoomi Real Estate",
  description: "Discover new launch projects, luxury residential towers, commercial hubs and plotted developments across India and Dubai.",
};

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  let latestListings = [];
  try {
    const res = await getApprovedListings();
    latestListings = res.listings.slice(0, 8);
  } catch {
    latestListings = [];
  }

  const projectCategories = [
    {
      title: "New Launch Projects",
      desc: "Pre-launch and newly launched developments with exclusive inaugural pricing.",
      href: "/properties?search=launch",
      badge: "High ROI",
      icon: Sparkles,
      color: "from-amber-500/10 to-orange-500/10",
    },
    {
      title: "Top Luxury Residences",
      desc: "Ultra-luxury penthouses, golf-facing apartments and private villas.",
      href: "/categories/luxury",
      badge: "Ultra Premium",
      icon: Crown,
      color: "from-rose-500/10 to-red-500/10",
    },
    {
      title: "Commercial & SCO Hubs",
      desc: "Retail high-street shops, modern office spaces and Shop-Cum-Office plots.",
      href: "/categories/commercial",
      badge: "Commercial",
      icon: Store,
      color: "from-blue-500/10 to-indigo-500/10",
    },
    {
      title: "Branded Residences",
      desc: "World-class residences with 5-star hospitality, concierge and clubhouses.",
      href: "/categories/branded",
      badge: "Global Standard",
      icon: Building2,
      color: "from-purple-500/10 to-pink-500/10",
    },
  ];

  return (
    <main className="min-h-screen flex-1 bg-[#f7f7f3]">
      {/* Header */}
      <section className="bg-[#111111] px-5 py-16 text-white sm:px-8">
        <div className="mx-auto max-w-6xl">
          <p className="inline-block rounded-full bg-[#c41920]/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#ff4d4f]">
            Curated Real Estate
          </p>
          <h1 className="mt-3 font-display text-4xl sm:text-5xl font-bold">Featured Projects & Developments</h1>
          <p className="mt-4 max-w-2xl text-base text-white/70">
            Explore marquee residential, commercial, and mixed-use projects by premier builders across top metropolitan hubs.
          </p>
        </div>
      </section>

      {/* Project Collections */}
      <section className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {projectCategories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.title}
                href={cat.href}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-ink/8 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#fff1f2] text-[#c41920]">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="rounded-full bg-ink/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-ink-soft">
                      {cat.badge}
                    </span>
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-[#180e0f] group-hover:text-[#c41920] transition">
                    {cat.title}
                  </h3>
                  <p className="mt-2 text-xs leading-5 text-ink-soft">{cat.desc}</p>
                </div>

                <div className="mt-6 flex items-center gap-1.5 text-xs font-bold text-[#c41920]">
                  <span>Explore Collection</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Live Available Properties */}
        {latestListings.length > 0 && (
          <div className="mt-16">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-ink/10 pb-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-[#c41920]">Verified Inventory</p>
                <h2 className="mt-1 text-2xl sm:text-3xl font-bold text-[#180e0f]">Featured Project Units</h2>
              </div>
              <Link
                href="/properties"
                className="inline-flex items-center gap-1.5 text-sm font-bold text-[#c41920] hover:underline"
              >
                View all properties <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {latestListings.map((listing) => (
                <PropertyCard key={listing.id} listing={listing} />
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
