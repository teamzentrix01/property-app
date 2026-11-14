import { redirect } from "next/navigation";
import { currentUser } from "@/lib/serverAuth";
import HomeLoanEstimator from "@/components/HomeLoanEstimator";
import Link from "next/link";
import { ArrowLeft, Calculator, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "EMI Calculator & Home Loan Estimator | Bhoomi",
  description: "Calculate your monthly home loan EMI, interest breakdown, and explore pre-approved offers.",
};

export default async function EMICalculatorPage() {
  const user = await currentUser();

  // 1. Guest Users -> Redirect to Login
  if (!user) {
    redirect("/login?next=/emi-calculator");
  }

  // 2. Non-Buyer Roles -> Redirect to their appropriate dashboard
  if (user.role !== "BUYER") {
    if (["SUPER_ADMIN", "AREA_ADMIN"].includes(user.role)) {
      redirect("/admin/dashboard");
    }
    redirect("/dashboard");
  }

  // 3. Authenticated Buyer Access
  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-700 shadow-2xs transition hover:bg-gray-100"
          >
            <ArrowLeft size={14} />
            <span>Back to Dashboard</span>
          </Link>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-800">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>Buyer Exclusive Access</span>
          </span>
        </div>

        {/* Page Header */}
        <div className="mb-8 rounded-3xl border border-emerald-200/80 bg-gradient-to-br from-[#14532D] to-[#0f3d21] p-6 sm:p-8 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-emerald-300 backdrop-blur-xs">
              <Calculator size={26} />
            </div>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-300">
                Financial Planning Tool
              </span>
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">
                EMI Calculator & Home Loan Estimator
              </h1>
            </div>
          </div>
          <p className="mt-3 text-xs sm:text-sm text-emerald-100/90 leading-relaxed max-w-2xl">
            Simulate your monthly installment (EMI), total interest payable, and optimal loan tenure based on current competitive bank rates.
          </p>
        </div>

        {/* Calculator Component */}
        <HomeLoanEstimator
          price={5000000}
          purpose="SALE"
          formattedPrice="₹50.00 L"
          propertyTitle="Buyer General Loan Estimation"
          propertyLocation="India"
        />
      </div>
    </main>
  );
}

