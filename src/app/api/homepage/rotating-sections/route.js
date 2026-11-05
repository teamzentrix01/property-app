import { NextResponse } from "next/server";
import { getRotatingSectionsData } from "@/lib/getListings";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await getRotatingSectionsData();
  return NextResponse.json(data);
}

