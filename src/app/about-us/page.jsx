import Link from "next/link";
import { Building2, ShieldCheck, Users, Trophy, CheckCircle2, ArrowRight } from "lucide-react";

export const metadata = {
  title: "About Us | Bhoomi Real Estate",
  description: "Learn about Bhoomi Real Estate, our vision, mission, and how we help thousands find verified dream properties across India and UAE.",
};

export default function AboutUsPage() {
  const stats = [
    { label: "Verified Listings", value: "15,000+" },
    { label: "Happy Families", value: "28,000+" },
    { label: "Cities Covered", value: "50+" },
    { label: "RERA Certified Advisors", value: "350+" },
  ];

  const values = [
    {
      title: "100% Verified Listings",
      desc: "Every plot, flat, and commercial project undergoes rigorous on-ground document and physical inspection.",
      icon: ShieldCheck,
    },
    {
      title: "Transparent Advisory",
      desc: "Zero hidden charges, direct broker and owner connections, and crystal-clear RERA compliance data.",
      icon: Building2,
    },
    {
      title: "Customer-Centric Care",
      desc: "Dedicated relationship managers guide you from initial site visit to registration and key handover.",
      icon: Users,
    },
    {
      title: "Award-Winning Excellence",
      desc: "Recognized as one of India's fastest-growing real estate platforms for luxury and residential properties.",
      icon: Trophy,
    },
  ];

  return (
    <main className="min-h-screen flex-1 bg-[#f7f7f3]">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#111111] px-5 py-20 text-white sm:px-8 lg:py-24">
        <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full border border-[#c41920]/20 blur-3xl pointer-events-none" />
        <div className="mx-auto max-w-6xl relative z-10">
          <p className="inline-block rounded-full bg-[#c41920]/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#ff4d4f]">
            About Bhoomi Real Estate
          </p>
          <h1 className="mt-4 font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            Building trust, delivering <span className="text-[#c41920]">dream homes</span>.
          </h1>
          <p className="mt-6 max-w-2xl text-base sm:text-lg leading-relaxed text-white/70">
            Founded with a vision to revolutionize the real estate landscape in India and Dubai, Bhoomi Real Estate delivers verified property solutions backed by technology, legal diligence, and human expertise.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/properties"
              className="inline-flex items-center gap-2 rounded-xl bg-[#c41920] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#a51319]"
            >
              Explore Properties
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/contact-us"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-6 py-3.5 text-sm font-semibold text-white transition hover:border-[#c41920] hover:text-[#c41920]"
            >
              Contact Our Team
            </Link>
          </div>
        </div>
      </section>

      {/* Key Numbers */}
      <section className="border-b border-ink/10 bg-white py-12">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center sm:text-left">
                <p className="text-3xl sm:text-4xl font-black text-[#8e1016]">{stat.value}</p>
                <p className="mt-1 text-xs sm:text-sm font-medium text-ink-soft uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Mission & Values */}
      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#c41920]">Our Core Principles</p>
          <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-[#180e0f]">Why Property Seekers Choose Us</h2>
          <p className="mt-3 text-sm text-ink-soft">
            We simplify the complex journey of buying, selling, or leasing real estate with transparency and integrity.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v) => {
            const Icon = v.icon;
            return (
              <div key={v.title} className="rounded-2xl border border-ink/8 bg-white p-6 shadow-sm transition hover:shadow-md">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#fff1f2] text-[#c41920]">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-[#180e0f]">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{v.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Journey / Story */}
      <section className="bg-white border-y border-ink/10 py-16">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#c41920]">Our Story</p>
              <h2 className="mt-2 text-3xl font-bold text-[#180e0f] sm:text-4xl">
                Bridging homebuyers and authentic builders since 2019
              </h2>
              <p className="mt-4 text-sm leading-7 text-ink-soft">
                Bhoomi Real Estate started with a simple belief: finding a home should be exhilarating, not exhausting. In an unorganized market flooded with inaccurate listings, we introduced strict property verification standards, RERA legal checks, and dedicated buyer representation.
              </p>
              <p className="mt-3 text-sm leading-7 text-ink-soft">
                Today, our network spans major metropolitan regions including Gurugram, Delhi NCR, Moradabad, Bareilly, and expanding internationally into prime Dubai real estate.
              </p>
              <div className="mt-6 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-[#c41920]" />
                  <span className="text-sm font-medium text-ink">Verified land titles & builder credentials</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-[#c41920]" />
                  <span className="text-sm font-medium text-ink">Zero spam inquiries and guaranteed privacy</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-[#c41920]" />
                  <span className="text-sm font-medium text-ink">Comprehensive home loan & registration assistance</span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-gradient-to-br from-[#1c1c1c] to-[#111111] p-8 text-white shadow-xl">
              <span className="inline-block rounded bg-[#c41920] px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-white">
                Venture of Kaushraj Global LLP
              </span>
              <h3 className="mt-4 text-2xl font-bold">Have a property question or want to list with us?</h3>
              <p className="mt-3 text-sm leading-6 text-white/60">
                Join thousands of verified owners and certified brokers getting high-intent buyers on Bhoomi.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link
                  href="/post-property"
                  className="rounded-xl bg-[#c41920] px-5 py-3 text-center text-sm font-bold text-white transition hover:bg-[#a51319]"
                >
                  Post Property Free
                </Link>
                <Link
                  href="/contact-us"
                  className="rounded-xl border border-white/20 px-5 py-3 text-center text-sm font-semibold text-white transition hover:border-[#c41920]"
                >
                  Get in Touch
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
