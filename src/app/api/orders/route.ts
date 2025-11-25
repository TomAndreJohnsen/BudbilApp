import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/orders - Get orders (optionally filtered by carrier)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const carrierId = searchParams.get("carrier");
    const pendingOnly = searchParams.get("pending") !== "false";

    let carrierName = "";

    // Build where clause
    const where: {
      Location?: { startsWith: string };
      carrierOrder?: { CarrierID: number; PickedUpAt: null } | { CarrierID: number };
    } = {
      Location: { startsWith: "Budbil hylle" },
    };

    if (carrierId) {
      const carrier = await prisma.carrier.findUnique({
        where: { CarrierID: Number(carrierId) },
      });
      carrierName = carrier?.CompanyName || "";

      if (pendingOnly) {
        where.carrierOrder = {
          CarrierID: Number(carrierId),
          PickedUpAt: null,
        };
      } else {
        where.carrierOrder = {
          CarrierID: Number(carrierId),
        };
      }
    }

    const orders = await prisma.pickupOrder.findMany({
      where,
      include: {
        carrierOrder: {
          include: {
            carrier: true,
          },
        },
      },
      orderBy: { CreatedAt: "desc" },
    });

    // Filter pending orders if no carrier specified
    const filteredOrders = pendingOnly && !carrierId
      ? orders.filter((o) => o.carrierOrder && !o.carrierOrder.PickedUpAt)
      : orders;

    return NextResponse.json({
      orders: filteredOrders,
      carrierName,
    });
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
