import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/carriers - Get all active carriers
export async function GET() {
  try {
    const carriers = await prisma.carrier.findMany({
      where: { IsActive: true },
      orderBy: { CompanyName: "asc" },
    });
    return NextResponse.json(carriers);
  } catch (error) {
    console.error("Failed to fetch carriers:", error);
    return NextResponse.json(
      { error: "Failed to fetch carriers" },
      { status: 500 }
    );
  }
}

// POST /api/carriers - Add new carrier
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyName } = body;

    if (!companyName || !companyName.trim()) {
      return NextResponse.json(
        { error: "Company name is required" },
        { status: 400 }
      );
    }

    const carrier = await prisma.carrier.create({
      data: {
        CompanyName: companyName.trim(),
        IsActive: true,
      },
    });

    return NextResponse.json(carrier, { status: 201 });
  } catch (error) {
    console.error("Failed to create carrier:", error);
    return NextResponse.json(
      { error: "Failed to create carrier" },
      { status: 500 }
    );
  }
}
