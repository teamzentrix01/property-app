import Link from "next/link";
import { AlertTriangle, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Disclaimer & RERA Notice | Bhoomi Real Estate",
  description: "Real estate and regulatory disclaimer regarding property listings, prices, RERA numbers, and builder information on Bhoomi Real Estate.",
};

export default function DisclaimerPage() {
  return (
    <main className="min-h-screen flex-1 bg-[#f7f7f3]">
      <section className="bg-[#111111] px-5 py-14 text-white sm:px-8">
        <div className="mx-auto max-w-4xl">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/60 hover:text-white mb-4"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
          </Link>
          <h1 className="font-display text-3xl sm:text-4xl font-bold">Real Estate & RERA Disclaimer</h1>
          <p className="mt-2 text-sm text-white/60">Important Legal & Regulatory Notice</p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-12 sm:px-8">
        <div className="rounded-3xl border border-ink/8 bg-white p-8 sm:p-12 shadow-sm space-y-8 text-sm leading-7 text-ink-soft">
          <div className="flex items-center gap-3 rounded-2xl bg-amber-500/10 p-4 text-amber-900 border border-amber-500/20">
            <AlertTriangle className="h-6 w-6 shrink-0 text-amber-600" />
            <p className="text-xs sm:text-sm font-medium">
              Please read this disclaimer carefully before relying on any property descriptions, floor plans, or pricing representations.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-[#180e0f] mb-3">1. General Information Only</h2>
            <p>
              The information provided on Bhoomi Real Estate (100acress.com) is for informational and guidance purposes only. While we endeavor to keep project details, floor plans, pricing, and availability accurate, the information does not constitute legal advice or an irrevocable financial offer.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-[#180e0f] mb-3">2. RERA Compliance & Developer Representations</h2>
            <p>
              Project specifications, amenities, handover dates, and promotional visuals displayed for under-construction projects are sourced directly from registered developers or their authorized RERA filings. Prospective buyers are advised to cross-verify the project's sanction plans and official RERA registration on the respective state RERA portal (such as HRERA, UP RERA, Delhi RERA).
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-[#180e0f] mb-3">3. Independent Verification Recommended</h2>
            <p>
              Users are urged to conduct due diligence regarding land ownership, encumbrances, carpet area measurements, and developer approvals through qualified legal counsel and certified real estate advisors before committing funds.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-[#180e0f] mb-3">4. Third-Party Content & External Links</h2>
            <p>
              Our platform may contain links to external sites, financial institutions for home loans, or third-party builder portals. We do not endorse or assume liability for the accuracy, security, or terms of third-party websites.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
