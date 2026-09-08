import { NextResponse } from "next/server";

export function proxy(request) {
  const requestHeaders = new Headers(request.headers);
  // Never trust a client-supplied bypass marker.
  requestHeaders.delete("x-bhoomi-admin-login");
  requestHeaders.delete("x-bhoomi-admin-request");
  if (request.nextUrl.pathname.startsWith("/admin")) requestHeaders.set("x-bhoomi-admin-request", "1");
  if (request.nextUrl.pathname === "/admin/login") requestHeaders.set("x-bhoomi-admin-login", "1");
  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  if (request.nextUrl.pathname.startsWith("/api/") && !["GET", "HEAD", "OPTIONS"].includes(request.method)) {
    const origin = request.headers.get("origin");
    if (origin && new URL(origin).host !== request.headers.get("host")) return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  }
  return response;
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
