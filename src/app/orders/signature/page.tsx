"use client";

import { useRef, useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { usePageTransition } from "@/lib/usePageTransition";
import SignatureCanvas from "react-signature-canvas";

interface OrderInfo {
  shelfNumber: number | null;
  numberOfPackages: number | null;
}

function SignatureContent() {
  const searchParams = useSearchParams();
  const { navigate } = usePageTransition();
  const orderIds = searchParams.get("orders")?.split(",").map(Number) || [];
  const carrierId = searchParams.get("carrier");
  const selectedParam = searchParams.get("selected") || "";

  function goBackToOrders() {
    const params = new URLSearchParams();
    if (carrierId) params.set("carrier", carrierId);
    if (selectedParam) params.set("selected", selectedParam);
    navigate(`/orders?${params.toString()}`);
  }

  const sigCanvas = useRef<SignatureCanvas>(null);
  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");
  const [orderReference, setOrderReference] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showLocation, setShowLocation] = useState(false);
  const [orderInfo, setOrderInfo] = useState<OrderInfo | null>(null);

  // Fetch order info on mount
  useEffect(() => {
    async function fetchOrderInfo() {
      if (orderIds.length === 0) return;
      try {
        const res = await fetch(`/api/orders?ids=${orderIds.join(",")}`);
        const data = await res.json();
        if (data.orders && data.orders.length > 0) {
          const order = data.orders[0];
          setOrderInfo({
            shelfNumber: order.carrierOrder?.ShelfNumber || null,
            numberOfPackages: order.NumberOfPackages || 1,
          });
        }
      } catch (err) {
        console.error("Failed to fetch order info:", err);
      }
    }
    fetchOrderInfo();
  }, []);

  function clearSignature() {
    sigCanvas.current?.clear();
  }

  async function saveSignature() {
    if (!sigCanvas.current || sigCanvas.current.isEmpty()) {
      setError("Vennligst signer forst");
      return;
    }
    if (!driverName.trim()) {
      setError("Vennligst skriv inn navn");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const signatureData = sigCanvas.current.toDataURL("image/png");

      const res = await fetch("/api/orders/pickup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderIds,
          carrierId: carrierId ? Number(carrierId) : null,
          driverName,
          driverPhone,
          signatureData,
        }),
      });

      if (res.ok) {
        navigate("/?success=true");
      } else {
        const data = await res.json();
        setError(data.error || "Noe gikk galt");
      }
    } catch (err) {
      console.error("Failed to save:", err);
      setError("Kunne ikke lagre. Prov igjen.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="h-dvh bg-[#073F4B] overflow-hidden">
      {/* Content area */}
      <div
        className="absolute flex flex-col"
        style={{
          top: '20px',
          left: '40px',
          right: '40px',
          bottom: '120px',
          gap: '2vh',
        }}
      >
        {/* 3 Input Fields in a row */}
        <div className="grid grid-cols-3 gap-[16px]">
          <div className="flex flex-col gap-[1vh]">
            <label className="text-white font-semibold" style={{ fontSize: '5vh' }}>Navn</label>
            <input
              type="text"
              value={driverName}
              onChange={(e) => setDriverName(e.target.value)}
              placeholder="Skriv inn navn..."
              className="rounded-xl bg-white text-[#073F4B] border-none outline-none"
              style={{ padding: '2vh', fontSize: '5vh' }}
            />
          </div>
          <div className="flex flex-col gap-[1vh]">
            <label className="text-white font-semibold" style={{ fontSize: '5vh' }}>Telefon</label>
            <input
              type="tel"
              inputMode="tel"
              value={driverPhone}
              onChange={(e) => setDriverPhone(e.target.value)}
              placeholder="Skriv inn telefon..."
              className="rounded-xl bg-white text-[#073F4B] border-none outline-none"
              style={{ padding: '2vh', fontSize: '5vh' }}
            />
          </div>
          <div className="flex flex-col gap-[1vh]">
            <label className="text-white font-semibold" style={{ fontSize: '5vh' }}>Deres ref.</label>
            <input
              type="text"
              value={orderReference}
              onChange={(e) => setOrderReference(e.target.value)}
              placeholder="Budbils referanse..."
              className="rounded-xl bg-white text-[#073F4B] border-none outline-none"
              style={{ padding: '2vh', fontSize: '5vh' }}
            />
          </div>
        </div>

        {/* Signature label */}
        <label className="text-white font-semibold" style={{ fontSize: '5vh' }}>
          Signatur
        </label>

        {/* Signature Canvas */}
        <div
          className="bg-white rounded-xl shadow-inner flex-1"
          style={{ minHeight: '30vh', touchAction: 'none' }}
          onTouchStart={() => {
            // Blur any focused input when touching signature area
            if (document.activeElement instanceof HTMLElement) {
              document.activeElement.blur();
            }
          }}
          onMouseDown={() => {
            // Same for mouse
            if (document.activeElement instanceof HTMLElement) {
              document.activeElement.blur();
            }
          }}
        >
          <SignatureCanvas
            ref={sigCanvas}
            canvasProps={{
              className: "w-full h-full rounded-xl",
              style: { width: "100%", height: "100%", touchAction: "none", cursor: "crosshair" },
            }}
            backgroundColor="white"
            penColor="black"
            minWidth={2}
            maxWidth={4}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div
            className="bg-red-500/20 border-2 border-red-500 rounded-xl text-red-400 text-center font-bold"
            style={{ padding: '2vh', fontSize: '5vh' }}
          >
            {error}
          </div>
        )}
      </div>

      {/* Bottom Navigation Bar - same style as /carriers */}
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
          onClick={goBackToOrders}
          disabled={saving}
          className="flex-1 rounded-xl font-extrabold uppercase bg-[#073F4B] text-white border-[3px] border-[#9CBD93] shadow-lg hover:brightness-110 transition-all disabled:opacity-50"
          style={{ fontSize: '2rem' }}
        >
          TILBAKE
        </button>
        <button
          onClick={clearSignature}
          disabled={saving}
          className="flex-1 rounded-xl font-extrabold uppercase bg-[#073F4B] text-white border-[3px] border-[#9CBD93] shadow-lg hover:brightness-110 transition-all disabled:opacity-50"
          style={{ fontSize: '2rem' }}
        >
          TØM
        </button>
        <button
          onClick={() => setShowLocation(true)}
          disabled={saving}
          className="flex-1 rounded-xl font-extrabold uppercase bg-[#073F4B] text-white border-[3px] border-[#9CBD93] shadow-lg hover:brightness-110 transition-all disabled:opacity-50"
          style={{ fontSize: '2rem' }}
        >
          LOKASJON
        </button>
        <button
          onClick={saveSignature}
          disabled={saving}
          className="flex-1 rounded-xl font-extrabold uppercase bg-[#9CBD93] text-[#073F4B] shadow-lg hover:brightness-110 transition-all disabled:opacity-50"
          style={{ fontSize: '2rem' }}
        >
          {saving ? "LAGRER..." : "BEKREFT"}
        </button>
      </div>

      {/* Location Popup */}
      {showLocation && (
        <div
          className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center"
          onClick={() => setShowLocation(false)}
        >
          <div
            className="bg-[#073F4B] rounded-xl border-[3px] border-[#9CBD93] flex flex-col gap-[3vh]"
            style={{ padding: '4vh 5vw' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex gap-[3vw]">
              <div className="bg-gradient-to-r from-[#E91E63] to-[#C2185B] rounded-xl text-center px-[4vw] py-[3vh]">
                <span className="text-white font-extrabold" style={{ fontSize: '6vh' }}>
                  HYLLE {orderInfo?.shelfNumber || "-"}
                </span>
              </div>
              <div className="bg-gradient-to-r from-[#26A69A] to-[#00897B] rounded-xl text-center px-[4vw] py-[3vh]">
                <span className="text-white font-extrabold" style={{ fontSize: '6vh' }}>
                  KOLLI: {orderInfo?.numberOfPackages || 1}
                </span>
              </div>
            </div>
            <button
              onClick={() => setShowLocation(false)}
              className="rounded-xl font-extrabold uppercase bg-[#9CBD93] text-[#073F4B] shadow-lg hover:brightness-110 transition-all"
              style={{ fontSize: '2rem', padding: '2vh 4vw' }}
            >
              LUKK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SignaturePage() {
  return (
    <Suspense
      fallback={
        <div className="h-dvh w-full bg-[#073F4B] flex items-center justify-center">
          <div className="text-white font-bold" style={{ fontSize: '3rem' }}>Laster...</div>
        </div>
      }
    >
      <SignatureContent />
    </Suspense>
  );
}
