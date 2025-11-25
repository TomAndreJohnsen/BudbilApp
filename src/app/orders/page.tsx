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
  carrierOrder: {
    CarrierOrderID: number;
    ShelfNumber: number;
    carrier: {
      CompanyName: string;
    };
  } | null;
}

function OrdersContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const carrierId = searchParams.get("carrier");

  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrders, setSelectedOrders] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [carrierName, setCarrierName] = useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOnlyPending, setShowOnlyPending] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, [carrierId, showOnlyPending]);

  async function fetchOrders() {
    try {
      const url = carrierId
        ? `/api/orders?carrier=${carrierId}&pending=${showOnlyPending}`
        : `/api/orders?pending=${showOnlyPending}`;
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

  function toggleOrder(orderId: number) {
    setSelectedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  }

  function goToSignature() {
    if (selectedOrders.length === 0) return;
    const orderIds = selectedOrders.join(",");
    router.push(`/orders/signature?orders=${orderIds}&carrier=${carrierId || ""}`);
  }

  function getPostalCode(order: Order): string {
    return order.DeliveryZip || order.DeliveryPostalCode || "-";
  }

  if (loading) {
    return (
      <div className="h-screen w-full bg-[var(--color-bg)] flex items-center justify-center">
        <div className="text-white text-2xl">Laster...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] p-[3vh_3vw] flex flex-col">
      {/* Header */}
      <div className="text-center mb-[3vh]">
        <h1 className="text-[var(--color-accent)] text-[clamp(4vh,6vh,8vh)] font-extrabold uppercase">
          {carrierName || "Alle Ordrer"}
        </h1>
        <p className="text-white/80 text-[clamp(1.8vh,2.2vh,2.6vh)] mt-[1vh]">
          {orders.length} {orders.length === 1 ? "ordre" : "ordrer"} venter
        </p>
      </div>

      {/* Filter Toggle */}
      <div className="flex justify-center mb-[2vh]">
        <button
          onClick={() => setShowOnlyPending(!showOnlyPending)}
          className={`px-6 py-3 rounded-full font-bold text-lg transition-colors ${
            showOnlyPending
              ? "bg-[var(--color-accent)] text-white"
              : "bg-white/20 text-white"
          }`}
        >
          {showOnlyPending ? "Vis alle" : "Kun ventende"}
        </button>
      </div>

      {/* Orders List */}
      <div className="flex-1 scrollable overflow-y-auto">
        {orders.length === 0 ? (
          <div className="text-center text-white/60 text-xl py-12">
            Ingen ordrer funnet
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div
                key={order.OrderID}
                className={`bg-white/10 rounded-2xl p-4 flex items-center gap-4 cursor-pointer transition-all ${
                  selectedOrders.includes(order.OrderID)
                    ? "ring-4 ring-[var(--color-accent)] bg-white/20"
                    : ""
                }`}
                onClick={() => toggleOrder(order.OrderID)}
              >
                {/* Checkbox */}
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-xl ${
                    selectedOrders.includes(order.OrderID)
                      ? "bg-[var(--color-accent)] text-white"
                      : "bg-white/20"
                  }`}
                >
                  {selectedOrders.includes(order.OrderID) && (
                    <i className="bi bi-check"></i>
                  )}
                </div>

                {/* Order Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-white font-bold text-lg">
                      {order.CustomerName || "Ukjent kunde"}
                    </span>
                    <span className="bg-[var(--color-accent)] text-white px-3 py-1 rounded-full text-sm font-bold">
                      {getPostalCode(order)}
                    </span>
                  </div>
                  <div className="text-white/60 text-sm mt-1">
                    {order.Location} | {order.NumberOfPackages || 1} kolli |{" "}
                    {order.Weight || 0} kg
                  </div>
                </div>

                {/* Details Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedOrder(order);
                  }}
                  className="w-12 h-12 rounded-xl bg-white/20 text-white flex items-center justify-center text-xl"
                >
                  <i className="bi bi-info-circle"></i>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Action Bar */}
      {selectedOrders.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/20">
          <button
            onClick={goToSignature}
            className="w-full py-5 rounded-2xl bg-[var(--color-accent)] text-white font-bold text-xl flex items-center justify-center gap-3"
          >
            <i className="bi bi-pencil-square"></i>
            Signer {selectedOrders.length}{" "}
            {selectedOrders.length === 1 ? "ordre" : "ordrer"}
          </button>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="bg-[var(--color-bg)] p-6 rounded-2xl w-full max-w-lg border border-white/20 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-white text-2xl font-bold">
                {selectedOrder.CustomerName || "Ukjent kunde"}
              </h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-white/60 text-2xl"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <div className="space-y-3 text-white">
              <div className="flex justify-between py-2 border-b border-white/10">
                <span className="text-white/60">Postnummer</span>
                <span className="font-bold text-xl text-[var(--color-accent)]">
                  {getPostalCode(selectedOrder)}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/10">
                <span className="text-white/60">Adresse</span>
                <span>{selectedOrder.DeliveryAddress || "-"}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/10">
                <span className="text-white/60">By</span>
                <span>{selectedOrder.DeliveryCity || "-"}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/10">
                <span className="text-white/60">Plassering</span>
                <span>{selectedOrder.Location || "-"}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/10">
                <span className="text-white/60">Antall kolli</span>
                <span>{selectedOrder.NumberOfPackages || 1}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/10">
                <span className="text-white/60">Vekt</span>
                <span>{selectedOrder.Weight || 0} kg</span>
              </div>
              {selectedOrder.carrierOrder && (
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-white/60">Transportor</span>
                  <span>{selectedOrder.carrierOrder.carrier.CompanyName}</span>
                </div>
              )}
            </div>

            {selectedOrder.PhotoURL && (
              <div className="mt-4">
                <img
                  src={selectedOrder.PhotoURL}
                  alt="Ordre foto"
                  className="w-full rounded-xl"
                />
              </div>
            )}
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
        <div className="h-screen w-full bg-[var(--color-bg)] flex items-center justify-center">
          <div className="text-white text-2xl">Laster...</div>
        </div>
      }
    >
      <OrdersContent />
    </Suspense>
  );
}
