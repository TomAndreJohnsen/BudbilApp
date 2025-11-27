"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { usePageTransition } from "@/lib/usePageTransition";

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
  const { navigate } = usePageTransition();
  const carrierId = searchParams.get("carrier");

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [carrierName, setCarrierName] = useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const selectedParam = searchParams.get("selected");
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<number>>(() => {
    if (selectedParam) {
      const ids = selectedParam.split(",").map(Number).filter(n => !isNaN(n));
      return new Set(ids);
    }
    return new Set();
  });

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

  function addToSelected(order: Order) {
    setSelectedOrderIds(prev => new Set(prev).add(order.OrderID));
    setSelectedOrder(null);
  }

  function removeFromSelected(order: Order) {
    setSelectedOrderIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(order.OrderID);
      return newSet;
    });
    setSelectedOrder(null);
  }

  function goToSignature() {
    // Include current modal order if open and not already selected
    const allOrderIds = new Set(selectedOrderIds);
    if (selectedOrder) {
      allOrderIds.add(selectedOrder.OrderID);
    }
    const orderIdsArray = Array.from(allOrderIds);
    const params = new URLSearchParams();
    params.set("orders", orderIdsArray.join(","));
    if (carrierId) params.set("carrier", carrierId);
    params.set("selected", orderIdsArray.join(","));
    navigate(`/orders/signature?${params.toString()}`);
  }

  if (loading) {
    return (
      <div className="h-dvh w-full bg-[#073F4B] flex items-center justify-center">
        <div className="text-white font-bold" style={{ fontSize: '3rem' }}>Laster...</div>
      </div>
    );
  }

  const showEmptyModal = carrierId && orders.length === 0;

  return (
    <div className="h-dvh bg-[#073F4B] flex flex-col">
      {/* Orders Grid - 2 cols x 3 rows (like old Flask design) */}
      <div
        className="absolute grid grid-cols-2 grid-rows-3"
        style={{
          top: '20px',
          left: '40px',
          right: '40px',
          bottom: '120px',
          gap: '16px',
        }}
      >
        {visibleOrders.map((order) => {
          const isSelected = selectedOrderIds.has(order.OrderID);
          return (
          <div
            key={order.OrderID}
            className={`rounded-[2vh] shadow-lg flex overflow-hidden cursor-pointer hover:scale-[1.02] active:scale-[0.97] transition-all ${
              isSelected ? "bg-[#9CBD93]/50 ring-4 ring-[#E8C547]" : "bg-[#9CBD93]"
            }`}
            onClick={() => openOrderDetail(order)}
          >
            {/* Image on left - smaller portion */}
            <div className="w-[14vw] h-full bg-gray-200 flex-shrink-0">
              {order.PhotoURL ? (
                <img
                  src={order.PhotoURL}
                  alt="Ordre"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#073F4B]/20">
                  <span style={{ fontSize: '6vh' }}>📦</span>
                </div>
              )}
            </div>
            {/* Info on right */}
            <div className="flex-1 flex flex-col justify-center gap-[1vh]" style={{ padding: '2vh 2vw' }}>
              <h3 className="text-[#073F4B] font-bold leading-tight" style={{ fontSize: '3.5vh' }}>
                {order.CustomerName || "Ukjent kunde"}
              </h3>
              {order.DeliveryAddress && (
                <p className="text-[#073F4B]/80" style={{ fontSize: '3.5vh' }}>{order.DeliveryAddress}</p>
              )}
              {getPostalCode(order) && (
                <span className="inline-block bg-[#D4E157] text-[#073F4B] rounded-[1vh] font-bold w-fit" style={{ fontSize: '3.5vh', padding: '0.8vh 1.5vw' }}>
                  {getPostalCode(order)} {order.DeliveryCity || ""}
                </span>
              )}
              <p className="text-white font-medium italic" style={{ fontSize: '3.5vh' }}>
                Trykk for mer info
              </p>
            </div>
          </div>
        );
        })}
      </div>

      {/* Bottom Navigation Bar - same positioning as /carriers */}
      <div
        className="absolute flex z-50"
        style={{
          bottom: '20px',
          left: '40px',
          right: '40px',
          height: '80px',
          gap: '16px',
        }}
      >
        <button
          onClick={() => navigate("/carriers")}
          className="flex-1 rounded-xl font-extrabold uppercase bg-[#073F4B] text-white border-[3px] border-[#9CBD93] shadow-lg hover:brightness-110 transition-all"
          style={{ fontSize: '2rem' }}
        >
          TILBAKE
        </button>
        <button
          onClick={() => navigate(carrierId ? "/orders" : "/carriers")}
          className="flex-1 rounded-xl font-extrabold uppercase bg-[#073F4B] text-white border-[3px] border-[#9CBD93] shadow-lg hover:brightness-110 transition-all"
          style={{ fontSize: '2rem' }}
        >
          {carrierId ? "ALLE ORDRE" : "MINE ORDRE"}
        </button>
        {/* Pagination dots */}
        <button
          onClick={() => setCurrentPage((currentPage + 1) % Math.max(totalPages, 1))}
          className="flex-1 rounded-xl bg-[#073F4B] border-[3px] border-[#9CBD93] shadow-lg flex items-center justify-center gap-4 hover:brightness-110 transition-all"
        >
          {Array.from({ length: Math.max(totalPages, 1) }).map((_, i) => (
            <span
              key={i}
              className={`w-5 h-5 rounded-full transition-colors ${
                i === currentPage ? "bg-white" : "bg-transparent border-2 border-white/70"
              }`}
            />
          ))}
        </button>
        <button
          onClick={() => navigate("/")}
          className="flex-1 rounded-xl font-extrabold uppercase bg-[#073F4B] text-white border-[3px] border-[#9CBD93] shadow-lg hover:brightness-110 transition-all"
          style={{ fontSize: '2rem' }}
        >
          HJEM
        </button>
      </div>

      {/* Order Detail Modal - Full Screen */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-[#073F4B] z-[100] overflow-hidden">
          {/* Header badges */}
          <div className="flex">
            <div className="flex-1 bg-gradient-to-r from-[#E91E63] to-[#C2185B] text-center" style={{ padding: '3vh 0' }}>
              <span className="text-white font-extrabold" style={{ fontSize: '5vh' }}>
                HYLLE {selectedOrder.carrierOrder?.ShelfNumber || "-"}
              </span>
            </div>
            <div className="flex-1 bg-gradient-to-r from-[#26A69A] to-[#00897B] text-center" style={{ padding: '3vh 0' }}>
              <span className="text-white font-extrabold" style={{ fontSize: '5vh' }}>
                KOLLI: {selectedOrder.NumberOfPackages || 1}
              </span>
            </div>
          </div>

          {/* Content */}
          <div
            className="absolute flex gap-[4vw]"
            style={{
              top: '14vh',
              left: '40px',
              right: '40px',
              bottom: '120px',
            }}
          >
            {/* Image */}
            <div className="w-1/2 flex items-center justify-center">
              {selectedOrder.PhotoURL ? (
                <img
                  src={selectedOrder.PhotoURL}
                  alt="Ordre"
                  className="max-w-full max-h-full rounded-[2vh] object-contain"
                />
              ) : (
                <div className="w-full h-full bg-[#9CBD93]/20 rounded-[2vh] flex items-center justify-center">
                  <span style={{ fontSize: '15vh' }}>📦</span>
                </div>
              )}
            </div>
            {/* Info */}
            <div className="flex-1 text-white flex flex-col justify-center gap-[2vh]">
              <p className="font-bold" style={{ fontSize: '6vh' }}>
                {selectedOrder.CustomerName || "Ukjent"}
              </p>
              <p style={{ fontSize: '5vh' }}>
                {selectedOrder.DeliveryAddress || "-"}
              </p>
              <p
                className="font-bold rounded-lg w-fit"
                style={{
                  fontSize: '5vh',
                  backgroundColor: '#E8C547',
                  color: '#1a3a3a',
                  padding: '1vh 2vw',
                }}
              >
                {selectedOrder.DeliveryZip || selectedOrder.DeliveryPostalCode || "-"} {selectedOrder.DeliveryCity || ""}
              </p>
              <p style={{ fontSize: '5vh' }}>
                <span className="text-[#9CBD93] font-bold">Vekt:</span>{" "}
                {selectedOrder.Weight || 0} kg
              </p>
              {selectedOrder.Comment && (
                <p
                  className="rounded-lg italic"
                  style={{
                    fontSize: '4vh',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    padding: '1.5vh 2vw',
                  }}
                >
                  {selectedOrder.Comment}
                </p>
              )}
            </div>
          </div>

          {/* Bottom buttons - same style as /carriers */}
          <div
            className="absolute flex z-50"
            style={{
              bottom: '20px',
              left: '40px',
              right: '40px',
              height: '80px',
              gap: '16px',
            }}
          >
            <button
              onClick={() => setSelectedOrder(null)}
              className="flex-1 rounded-xl font-extrabold uppercase bg-[#073F4B] text-white border-[3px] border-[#9CBD93] shadow-lg hover:brightness-110 transition-all"
              style={{ fontSize: '2rem' }}
            >
              LUKK
            </button>
            <button
              onClick={() => addToSelected(selectedOrder)}
              className="flex-1 rounded-xl font-extrabold uppercase bg-[#073F4B] text-white border-[3px] border-[#9CBD93] shadow-lg hover:brightness-110 transition-all"
              style={{ fontSize: '2rem' }}
            >
              HENT FLERE
            </button>
            <button
              onClick={() => removeFromSelected(selectedOrder)}
              disabled={!selectedOrderIds.has(selectedOrder.OrderID)}
              className={`flex-1 rounded-xl font-extrabold uppercase shadow-lg hover:brightness-110 transition-all ${
                selectedOrderIds.has(selectedOrder.OrderID)
                  ? "bg-[#073F4B] text-white border-[3px] border-[#9CBD93]"
                  : "bg-[#073F4B]/50 text-white/50 border-[3px] border-[#9CBD93]/50 cursor-not-allowed"
              }`}
              style={{ fontSize: '2rem' }}
            >
              FJERN ORDRE
            </button>
            <button
              onClick={() => goToSignature()}
              className="flex-1 rounded-xl font-extrabold uppercase bg-[#9CBD93] text-[#073F4B] shadow-lg hover:brightness-110 transition-all"
              style={{ fontSize: '2rem' }}
            >
              {selectedOrderIds.size > 0 || selectedOrder
                ? `HENT UT (${selectedOrderIds.has(selectedOrder.OrderID) ? selectedOrderIds.size : selectedOrderIds.size + 1})`
                : "HENT UT"}
            </button>
          </div>
        </div>
      )}

      {/* Empty state modal when carrier has no orders */}
      {showEmptyModal && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center">
          <div
            className="bg-[#073F4B] border-[3px] border-[#9CBD93] rounded-xl flex flex-col items-center justify-center"
            style={{ padding: '5vh 6vw' }}
          >
            <p className="text-white text-center mb-[4vh]" style={{ fontSize: '5vh' }}>
              Ingen ordre på <span className="font-bold text-[#9CBD93]">{carrierName || "valgt firma"}</span>
            </p>
            <button
              onClick={() => navigate("/orders")}
              className="rounded-xl font-extrabold uppercase bg-[#9CBD93] text-[#073F4B] shadow-lg hover:brightness-110 transition-all w-full"
              style={{ fontSize: '2rem', padding: '2vh 4vw' }}
            >
              VIS ALLE ORDRE
            </button>
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
          <div className="text-white font-bold" style={{ fontSize: '3rem' }}>Laster...</div>
        </div>
      }
    >
      <OrdersContent />
    </Suspense>
  );
}
