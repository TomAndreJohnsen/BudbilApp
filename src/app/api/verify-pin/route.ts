import { NextRequest, NextResponse } from "next/server";

// POST /api/verify-pin - Verify PIN code
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pin } = body;

    const correctPin = process.env.PINCODE || "2026";

    if (pin === correctPin) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: "Invalid PIN" },
        { status: 401 }
      );
    }
  } catch {
    return NextResponse.json(
      { error: "Failed to verify PIN" },
      { status: 500 }
    );
  }
}
