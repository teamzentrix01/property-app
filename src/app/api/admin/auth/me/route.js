import { NextResponse } from "next/server";
import { currentAdmin } from "@/lib/serverAuth";

export async function GET() {
  const user = await currentAdmin();
  if (!user) return NextResponse.json({ error: "Admin authentication required" }, { status: 401 });
  return NextResponse.json({ admin: { id: user.id, name: user.name, email: user.email, role: user.role } });
}
