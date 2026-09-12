import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";

export const metadata = {
  title: "Sitemap | Bhoomi Real Estate",
  description: "Browse the complete directory of pages, property categories, cities, and services on Bhoomi Real Estate.",
};

export default function SitemapPage() {
  const sections = [
    {
      title: "Main Navigation & Discover",
      links: [
        { name: "Home Page", href: "/" },
        { name: "All Properties Directory", href: "/properties" },
        { name: "Listings Explorer", href: "/listings" },
        { name: "Featured Projects", href: "/projects" },
        { name: "Post Your Property (Free)", href: "/post-property" },
        { name: "Cities Directory", href: "/cities" },
        { name: "About Bhoomi", href: "/about-us" },
        { name: "Contact & Helpline", href: "/contact-us" },
      ],
    },
    {
      title: "Property Categories",
      links: [
        { name: "Apartments & Flats", href: "/categories/apartment" },
        { name: "Luxury Residences", href: "/categories/luxury" },
        { name: "Commercial & Retail Spaces", href: "/categories/commercial" },
        { name: "Branded Residences", href: "/categories/branded" },
        { name: "Rental Properties", href: "/categories/rental" },
        { name: "Independent Villas & Houses", href: "/categories/villas" },
        { name: "Residential & Commercial Plots", href: "/properties?propertyType=PLOT" },
      ],
    },
    {
      title: "Popular Cities & Locations",
      links: [
        { name: "Properties in Gurugram", href: "/properties?city=Gurugram" },
        { name: "Properties in Delhi NCR", href: "/properties?city=Delhi" },
        { name: "Properties in Noida", href: "/properties?city=Noida" },
        { name: "Properties in Greater Noida", href: "/properties?city=Greater+Noida" },
        { name: "Properties in Faridabad", href: "/properties?city=Faridabad" },
        { name: "Properties in Moradabad", href: "/properties?city=Moradabad" },
        { name: "Properties in Bareilly", href: "/properties?city=Bareilly" },
        { name: "Properties in Dubai, UAE", href: "/properties?city=Dubai" },
      ],
    },
    {
      title: "User & Broker Portal",
      links: [
        { name: "User Profile & Dashboard", href: "/profile" },
        { name: "Broker Workspace", href: "/dashboard" },
        { name: "Sign In / Register", href: "/login" },
        { name: "Create New Account", href: "/signup" },
      ],
    },
    {
      title: "Legal & Regulatory",
      links: [
        { name: "Privacy Policy", href: "/privacy-policy" },
        { name: "Terms & Conditions", href: "/terms-and-conditions" },
        { name: "RERA & Legal Disclaimer", href: "/disclaimer" },
        { name: "HTML Sitemap", href: "/sitemap" },
      ],
    },
  ];

  return (
    <main className="min-h-screen flex-1 bg-[#f7f7f3]">
      <section className="bg-[#111111] px-5 py-14 text-white sm:px-8">
        <div className="mx-auto max-w-5xl">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/60 hover:text-white mb-4"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
          </Link>
          <h1 className="font-display text-3xl sm:text-4xl font-bold">Website Sitemap</h1>
          <p className="mt-2 text-sm text-white/60">An organized directory of all pages and resources across Bhoomi Real Estate.</p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-12 sm:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {sections.map((sec) => (
            <div key={sec.title} className="rounded-2xl border border-ink/8 bg-white p-6 shadow-sm">
              <h2 className="text-base font-bold text-[#8e1016] border-b border-ink/8 pb-3">
                {sec.title}
              </h2>
              <ul className="mt-4 space-y-2.5">
                {sec.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="group flex items-center justify-between text-xs font-medium text-ink-soft hover:text-[#c41920]"
                    >
                      <span>{link.name}</span>
                      <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-[#c41920]" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
