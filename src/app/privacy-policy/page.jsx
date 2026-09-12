import Link from "next/link";
import { ShieldCheck, Lock, Eye, FileText, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | Bhoomi Real Estate",
  description: "Read the Privacy Policy of Bhoomi Real Estate to understand how we collect, protect, and handle your personal information.",
};

export default function PrivacyPolicyPage() {
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
          <h1 className="font-display text-3xl sm:text-4xl font-bold">Privacy Policy</h1>
          <p className="mt-2 text-sm text-white/60">Last updated: January 2026 · A Venture of Kaushraj Global LLP</p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-12 sm:px-8">
        <div className="rounded-3xl border border-ink/8 bg-white p-8 sm:p-12 shadow-sm space-y-8 text-sm leading-7 text-ink-soft">
          <div>
            <h2 className="text-xl font-bold text-[#180e0f] mb-3">1. Introduction</h2>
            <p>
              Welcome to Bhoomi Real Estate (operated under Kaushraj Global LLP, "we", "our", or "us"). We value your privacy and are committed to safeguarding personal information collected via our website, mobile interface, and property discovery services.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-[#180e0f] mb-3">2. Information We Collect</h2>
            <p>We may collect information you provide directly to us when you:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1.5">
              <li>Create an account or submit property listings (name, phone number, email address, property ownership documents).</li>
              <li>Request site visits, broker callbacks, or property price sheets.</li>
              <li>Subscribe to real estate alerts, market newsletters, or price updates.</li>
              <li>Interact with our customer support teams via phone, WhatsApp, or email.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-[#180e0f] mb-3">3. How We Use Your Information</h2>
            <p>Your data is used strictly to deliver and improve our services, including:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1.5">
              <li>Connecting prospective buyers and tenants with verified owners, developers, and certified brokers.</li>
              <li>Performing identity, RERA, and ownership verification for property listings.</li>
              <li>Sending transactional notifications, appointment confirmations, and regulatory disclosures.</li>
              <li>Preventing fraudulent listings, unauthorized duplicate posts, and platform abuse.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-[#180e0f] mb-3">4. Information Sharing & Third Parties</h2>
            <p>
              We do not sell, rent, or lease your personal contact details to third-party advertisers. Information is only shared with verified brokers or builder sales teams when you explicitly express interest in a specific property listing.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-[#180e0f] mb-3">5. Data Security</h2>
            <p>
              We implement industry-standard encryption protocols (HTTPS/TLS) and secure database storage to prevent unauthorized access, disclosure, or alteration of your personal data.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-[#180e0f] mb-3">6. Contact Information</h2>
            <p>
              For privacy-related inquiries, data modification requests, or questions regarding this policy, please reach out to:
            </p>
            <p className="mt-2 font-semibold text-[#180e0f]">
              Data Protection Officer · Bhoomi Real Estate<br />
              Email: support@100acress.com · Phone: +91 8500 900 100
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
