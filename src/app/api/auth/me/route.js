import { NextResponse } from "next/server";
import { currentUser } from "@/lib/serverAuth";

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ user: null });
  return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role, adminArea: user.adminArea } });
}
