"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

interface Order {
  OrderID: number;
  CustomerName: string | null;
  Location: string | null;
  DeliveryZip: string | null;
  DeliveryPostalCode: string | null;
  DeliveryAddress: string | null;
  DeliveryCity: string | null;
  NumberOfPackages: number | null;
  Weight: number | null;
  PhotoURL: string | null;
  Comment: string | null;
  Reference: string | null;
  carrierOrder: {
    CarrierOrderID: number;
    ShelfNumber: number;
    carrier: {
      CompanyName: string;
    };
  } | null;
}

const ITEMS_PER_PAGE = 6;

function OrdersContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const carrierId = searchParams.get("carrier");

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [carrierName, setCarrierName] = useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const totalPages = Math.ceil(orders.length / ITEMS_PER_PAGE);
  const startIndex = currentPage * ITEMS_PER_PAGE;
  const visibleOrders = orders.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  useEffect(() => {
    fetchOrders();
  }, [carrierId]);

  async function fetchOrders() {
    try {
      const url = carrierId
        ? `/api/orders?carrier=${carrierId}&pending=true`
        : `/api/orders?pending=true`;
      const res = await fetch(url);
      const data = await res.json();
      setOrders(data.orders || []);
      if (data.carrierName) {
        setCarrierName(data.carrierName);
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  }

  function getPostalCode(order: Order): string {
    return order.DeliveryZip || order.DeliveryPostalCode || "";
  }

  function openOrderDetail(order: Order) {
    setSelectedOrder(order);
  }

  function goToSignature(order: Order) {
    router.push(`/orders/signature?orders=${order.OrderID}&carrier=${carrierId || ""}`);
  }

  if (loading) {
    return (
      <div className="h-dvh w-full bg-[#073F4B] flex items-center justify-center">
        <div className="text-white text-2xl">Laster...</div>
      </div>
    );
  }

  return (
    <div className="h-dvh bg-[#073F4B] flex flex-col p-4">
      {/* Orders Grid - 3 cols x 2 rows */}
      <div className="flex-1 grid grid-cols-3 grid-rows-2 gap-4 mb-4">
        {visibleOrders.map((order) => (
          <div
            key={order.OrderID}
            className="bg-white rounded-2xl shadow-lg flex overflow-hidden cursor-pointer hover:scale-[0.99] active:scale-[0.97] transition-transform"
            onClick={() => openOrderDetail(order)}
          >
            {/* Image on left */}
            <div className="w-1/3 bg-gray-200 flex-shrink-0">
              {order.PhotoURL ? (
                <img
                  src={order.PhotoURL}
                  alt="Ordre"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#9CBD93]/30">
                  <i className="bi bi-box-seam text-4xl text-[#073F4B]/50"></i>
                </div>
              )}
            </div>
            {/* Info on right */}
            <div className="flex-1 p-4 flex flex-col justify-center">
              <h3 className="text-[#073F4B] font-bold text-lg leading-tight mb-1">
                {order.CustomerName || "Ukjent kunde"}
              </h3>
              {order.DeliveryAddress && (
                <p className="text-gray-600 text-sm mb-2">{order.DeliveryAddress}</p>
              )}
              {getPostalCode(order) && (
                <span className="inline-block bg-[#9CBD93] text-white px-3 py-1 rounded text-sm font-bold w-fit mb-2">
                  {getPostalCode(order)} {order.DeliveryCity || ""}
                </span>
              )}
              <p className="text-[#9CBD93] text-sm font-medium">
                Trykk for mer info
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Navigation Bar */}
      <div className="grid grid-cols-4 gap-4 h-16">
        <button
          onClick={() => router.push("/carriers")}
          className="border-2 border-[#9CBD93] text-[#9CBD93] rounded-xl font-bold text-lg uppercase hover:bg-[#9CBD93]/10 transition-colors"
        >
          TILBAKE
        </button>
        <button
          onClick={() => router.push("/orders")}
          className="border-2 border-[#9CBD93] text-[#9CBD93] rounded-xl font-bold text-lg uppercase hover:bg-[#9CBD93]/10 transition-colors"
        >
          MINE ORDRE
        </button>
        {/* Pagination dots */}
        <div className="border-2 border-[#9CBD93] rounded-xl flex items-center justify-center gap-2">
          {Array.from({ length: Math.max(totalPages, 1) }).map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i)}
              className={`w-3 h-3 rounded-full transition-colors ${
                i === currentPage ? "bg-white" : "bg-white/30"
              }`}
            />
          ))}
        </div>
        <button
          onClick={() => router.push("/")}
          className="border-2 border-[#9CBD93] text-[#9CBD93] rounded-xl font-bold text-lg uppercase hover:bg-[#9CBD93]/10 transition-colors"
        >
          HJEM
        </button>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#073F4B] rounded-2xl w-full max-w-3xl overflow-hidden">
            {/* Header badges */}
            <div className="flex">
              <div className="flex-1 bg-[#E91E63] py-3 text-center">
                <span className="text-white font-bold text-2xl">
                  HYLLE {selectedOrder.carrierOrder?.ShelfNumber || "-"}
                </span>
              </div>
              <div className="flex-1 bg-[#26A69A] py-3 text-center">
                <span className="text-white font-bold text-2xl">
                  KOLLI: {selectedOrder.NumberOfPackages || 1}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 flex gap-6">
              {/* Image */}
              <div className="w-1/2">
                {selectedOrder.PhotoURL ? (
                  <img
                    src={selectedOrder.PhotoURL}
                    alt="Ordre"
                    className="w-full rounded-xl"
                  />
                ) : (
                  <div className="w-full h-64 bg-[#9CBD93]/20 rounded-xl flex items-center justify-center">
                    <i className="bi bi-image text-6xl text-white/30"></i>
                  </div>
                )}
              </div>
              {/* Info */}
              <div className="flex-1 text-white space-y-2">
                <p>
                  <span className="text-[#9CBD93]">Kunde:</span>{" "}
                  {selectedOrder.CustomerName || "Ukjent"}
                </p>
                <p>
                  <span className="text-[#9CBD93]">OrdreID:</span>{" "}
                  {selectedOrder.OrderID}
                </p>
                <p>
                  <span className="text-[#9CBD93]">Ref:</span>{" "}
                  {selectedOrder.Reference || selectedOrder.DeliveryAddress || "-"}
                </p>
                <p>
                  <span className="text-[#9CBD93]">Vekt:</span>{" "}
                  {selectedOrder.Weight || 0} kg
                </p>
                {selectedOrder.Comment && (
                  <p>
                    <span className="text-[#9CBD93]">Kommentar:</span>{" "}
                    <span className="italic">{selectedOrder.Comment}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Bottom buttons */}
            <div className="grid grid-cols-4 gap-4 p-4">
              <button
                onClick={() => setSelectedOrder(null)}
                className="border-2 border-[#9CBD93] text-[#9CBD93] rounded-xl font-bold text-base py-3 uppercase"
              >
                LUKK
              </button>
              <button
                className="border-2 border-[#9CBD93] text-[#9CBD93] rounded-xl font-bold text-base py-3 uppercase"
              >
                HENT FLERE
              </button>
              <button
                className="border-2 border-[#9CBD93] text-[#9CBD93] rounded-xl font-bold text-base py-3 uppercase"
              >
                FJERN ORDRE
              </button>
              <button
                onClick={() => goToSignature(selectedOrder)}
                className="bg-[#9CBD93] text-white rounded-xl font-bold text-base py-3 uppercase"
              >
                HENT UT ORDRE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="h-dvh w-full bg-[#073F4B] flex items-center justify-center">
          <div className="text-white text-2xl">Laster...</div>
        </div>
      }
    >
      <OrdersContent />
    </Suspense>
  );
}
