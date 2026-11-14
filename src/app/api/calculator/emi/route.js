import { NextResponse } from "next/server";
import { currentUser } from "@/lib/serverAuth";

export async function POST(req) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    if (user.role !== "BUYER") {
      return NextResponse.json({ error: "Access denied. EMI Calculator is restricted to Buyer accounts only." }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const principal = Math.max(1000, Number(body.loanAmount || body.price || 0));
    const annualRate = Math.max(0.1, Number(body.interestRate || 8.5));
    const tenureYears = Math.max(1, Math.min(40, Number(body.tenureYears || 20)));

    const r = annualRate / (12 * 100);
    const n = tenureYears * 12;

    const numerator = principal * r * Math.pow(1 + r, n);
    const denominator = Math.pow(1 + r, n) - 1;
    const monthlyEmi = denominator === 0 ? 0 : Math.round(numerator / denominator);

    const totalPayable = monthlyEmi * n;
    const totalInterest = Math.max(0, totalPayable - principal);

    return NextResponse.json({
      ok: true,
      loanAmount: principal,
      tenureYears,
      interestRate: annualRate,
      monthlyEmi,
      totalInterest,
      totalPayable,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message || "Failed to calculate EMI" }, { status: 500 });
  }
}

