import { NextResponse } from "next/server";
import { APP_VERSION } from "@/lib/utils";

// GET /api/health - Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: "healthy",
    version: APP_VERSION,
    service: "budbil.app",
    timestamp: new Date().toISOString(),
  });
}
