import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Terms & Conditions | Bhoomi Real Estate",
  description: "Review the Terms and Conditions governing the use of Bhoomi Real Estate website, property listings, and brokerage advisory.",
};

export default function TermsAndConditionsPage() {
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
          <h1 className="font-display text-3xl sm:text-4xl font-bold">Terms & Conditions</h1>
          <p className="mt-2 text-sm text-white/60">Effective Date: January 2026 · A Venture of Kaushraj Global LLP</p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-12 sm:px-8">
        <div className="rounded-3xl border border-ink/8 bg-white p-8 sm:p-12 shadow-sm space-y-8 text-sm leading-7 text-ink-soft">
          <div>
            <h2 className="text-xl font-bold text-[#180e0f] mb-3">1. Agreement to Terms</h2>
            <p>
              By accessing, browsing, or utilizing Bhoomi Real Estate ("100acress.com", "we", "our"), you agree to be bound by these Terms and Conditions. If you do not agree to all terms, you must refrain from using the platform.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-[#180e0f] mb-3">2. Listing Rules & User Conduct</h2>
            <p>Users who post properties (owners, developers, and brokers) agree that:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1.5">
              <li>All listing information, pricing, location data, and photographs are accurate and represent authentic properties.</li>
              <li>Relevant approvals, RERA registration numbers, and clear title rights exist before advertising any property.</li>
              <li>Misleading prices, fake photographs, or unauthorized listings will be removed immediately, and offending accounts banned.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-[#180e0f] mb-3">3. Broker & Agent Verification</h2>
            <p>
              Brokers and agencies operating on our platform must complete profile verification and adhere to local real estate regulatory guidelines. Bhoomi reserves the right to suspend any broker account involved in fraudulent or unethical dealings.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-[#180e0f] mb-3">4. Intellectual Property</h2>
            <p>
              All branding, designs, logos, software code, UI interfaces, and curated project editorial content are the exclusive intellectual property of Kaushraj Global LLP and protected under Indian and international copyright laws.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-[#180e0f] mb-3">5. Limitation of Liability</h2>
            <p>
              While we perform verification checks on listings, buyers and investors are strongly advised to independently verify land titles, local municipal approvals, and RERA credentials before executing any financial transaction.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-[#180e0f] mb-3">6. Governing Law & Jurisdiction</h2>
            <p>
              These terms shall be governed by and construed in accordance with the laws of India. Any disputes arising shall be subject to the exclusive jurisdiction of the courts in Gurugram / Delhi NCR.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
