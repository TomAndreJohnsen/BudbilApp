import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// POST /api/orders/pickup - Mark orders as picked up
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderIds, driverName, driverPhone, signatureData } = body;

    if (!orderIds || orderIds.length === 0) {
      return NextResponse.json(
        { error: "No orders specified" },
        { status: 400 }
      );
    }

    if (!driverName || !driverName.trim()) {
      return NextResponse.json(
        { error: "Driver name is required" },
        { status: 400 }
      );
    }

    const now = new Date();

    // Update each order's carrier order
    for (const orderId of orderIds) {
      await prisma.carrierOrder.updateMany({
        where: { OrderID: orderId },
        data: {
          DriverName: driverName.trim(),
          DriverPhone: driverPhone?.trim() || null,
          SignatureData: signatureData || null,
          PickedUpAt: now,
        },
      });

      // Also update the pickup order status
      await prisma.pickupOrder.update({
        where: { OrderID: orderId },
        data: {
          Status: "delivered",
          DeliveredBy: driverName.trim(),
          DeliveredAt: now,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: `${orderIds.length} order(s) marked as picked up`,
    });
  } catch (error) {
    console.error("Failed to update orders:", error);
    return NextResponse.json(
      { error: "Failed to update orders" },
      { status: 500 }
    );
  }
}
