import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Dine IP-adresser som har tilgang
const ALLOWED_IPS = [
  "46.15.44.45",      // ClientIP 2025-10-16
  "45.14.193.194",    // ClientIP 2025-11-11
  "46.15.37.217",     // ClientIP 2025-11-17 / OnePlus Pro 9
  "89.8.48.83",       // ClientIP 2025-11-25
  "45.85.248.93",     // Dev Machine
  "195.1.85.17",      // GRM_Butikk
  "51.175.82.153",    // Hjemme
  "45.14.193.193",    // Home
  "46.15.85.188",     // Mobilnett Onplus
];

// Sett til true for å aktivere IP-sjekk
const IP_CHECK_ENABLED = true;

export function proxy(request: NextRequest) {
  if (!IP_CHECK_ENABLED || ALLOWED_IPS.length === 0) {
    return NextResponse.next();
  }

  // Hent IP fra headers (Vercel setter denne)
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "unknown";

  if (!ALLOWED_IPS.includes(ip)) {
    return new NextResponse("Ingen tilgang", {
      status: 403,
      headers: { "Content-Type": "text/plain; charset=utf-8" }
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Sjekk alle sider unntatt static files
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
