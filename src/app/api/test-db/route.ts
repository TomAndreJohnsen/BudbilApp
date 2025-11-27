import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/test-db - Test database connection
export async function GET() {
  try {
    // Try to connect and count carriers
    const count = await prisma.carrier.count();
    return NextResponse.json({
      success: true,
      message: `Connected! Found ${count} carriers.`,
      database: "Azure SQL"
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Database connection error:", errorMessage);
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: 500 });
  }
}
