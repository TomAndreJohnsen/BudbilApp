"use client";

import { useRef, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import SignatureCanvas from "react-signature-canvas";

function SignatureContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderIds = searchParams.get("orders")?.split(",").map(Number) || [];
  const carrierId = searchParams.get("carrier");

  const sigCanvas = useRef<SignatureCanvas>(null);
  const [driverName, setDriverName] = useState("");
  const [driverPhone, setDriverPhone] = useState("");
  const [orderReference, setOrderReference] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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
        router.push("/?success=true");
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
    <div className="h-dvh bg-[#073F4B] flex flex-col p-4">
      {/* Yellow Header with Order ID */}
      <div className="bg-[#FDD835] rounded-xl py-3 mb-4">
        <p className="text-center text-[#073F4B] font-bold text-xl">
          OrdreID: {orderIds.join(", ")}
        </p>
      </div>

      {/* 3 Input Fields in a row */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <label className="text-[#9CBD93] text-sm font-medium mb-1 block">Navn</label>
          <input
            type="text"
            value={driverName}
            onChange={(e) => setDriverName(e.target.value)}
            placeholder="Skriv inn navn..."
            className="w-full p-3 text-base rounded-xl bg-[#9CBD93]/20 text-white border border-[#9CBD93]/50 outline-none placeholder:text-white/50"
          />
        </div>
        <div>
          <label className="text-[#9CBD93] text-sm font-medium mb-1 block">Telefon</label>
          <input
            type="tel"
            inputMode="tel"
            value={driverPhone}
            onChange={(e) => setDriverPhone(e.target.value)}
            placeholder="Skriv inn telefon..."
            className="w-full p-3 text-base rounded-xl bg-[#9CBD93]/20 text-white border border-[#9CBD93]/50 outline-none placeholder:text-white/50"
          />
        </div>
        <div>
          <label className="text-[#9CBD93] text-sm font-medium mb-1 block">Ordrenummer</label>
          <input
            type="text"
            value={orderReference}
            onChange={(e) => setOrderReference(e.target.value)}
            placeholder="Skriv inn ordrenr..."
            className="w-full p-3 text-base rounded-xl bg-[#9CBD93]/20 text-white border border-[#9CBD93]/50 outline-none placeholder:text-white/50"
          />
        </div>
      </div>

      {/* Signature label */}
      <label className="text-[#9CBD93] text-sm font-medium mb-1 block">Signatur</label>

      {/* Signature Canvas */}
      <div className="flex-1 bg-white rounded-xl relative mb-4">
        <SignatureCanvas
          ref={sigCanvas}
          canvasProps={{
            className: "w-full h-full rounded-xl touch-none",
            style: { width: "100%", height: "100%", touchAction: "none" },
          }}
          backgroundColor="white"
          penColor="black"
          minWidth={2}
          maxWidth={4}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-2 bg-red-500/20 border border-red-500 rounded-xl text-red-400 text-center text-sm">
          {error}
        </div>
      )}

      {/* Bottom Navigation Bar */}
      <div className="grid grid-cols-4 gap-4 h-16">
        <button
          onClick={() => router.back()}
          disabled={saving}
          className="border-2 border-[#9CBD93] text-[#9CBD93] rounded-xl font-bold text-lg uppercase hover:bg-[#9CBD93]/10 transition-colors"
        >
          TILBAKE
        </button>
        <button
          onClick={clearSignature}
          disabled={saving}
          className="border-2 border-[#9CBD93] text-[#9CBD93] rounded-xl font-bold text-lg uppercase hover:bg-[#9CBD93]/10 transition-colors"
        >
          SLETT
        </button>
        <button
          className="border-2 border-[#9CBD93] text-[#9CBD93] rounded-xl font-bold text-lg uppercase hover:bg-[#9CBD93]/10 transition-colors"
        >
          VIS LOKASJON
        </button>
        <button
          onClick={saveSignature}
          disabled={saving}
          className="bg-[#9CBD93] text-white rounded-xl font-bold text-lg uppercase flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <i className="bi bi-arrow-repeat animate-spin"></i>
              LAGRER...
            </>
          ) : (
            "BEKREFT"
          )}
        </button>
      </div>
    </div>
  );
}

export default function SignaturePage() {
  return (
    <Suspense
      fallback={
        <div className="h-dvh w-full bg-[#073F4B] flex items-center justify-center">
          <div className="text-white text-2xl">Laster...</div>
        </div>
      }
    >
      <SignatureContent />
    </Suspense>
  );
}
