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
    <div className="h-dvh bg-[var(--color-bg)] p-4 flex flex-col">
      {/* Header - compact */}
      <div className="text-center py-2">
        <h1 className="text-[var(--color-accent)] text-2xl md:text-3xl font-extrabold uppercase">
          Signatur
        </h1>
        <p className="text-white/70 text-sm">
          {orderIds.length} {orderIds.length === 1 ? "ordre" : "ordrer"} valgt
        </p>
      </div>

      {/* Main content - landscape layout */}
      <div className="flex-1 flex gap-4 py-2">
        {/* Left side - Driver info */}
        <div className="w-1/3 flex flex-col gap-3">
          <input
            type="text"
            value={driverName}
            onChange={(e) => setDriverName(e.target.value)}
            placeholder="Sjaforens navn *"
            className="w-full p-3 text-base rounded-xl bg-white/10 text-white border-2 border-white/30 focus:border-[var(--color-accent)] outline-none placeholder:text-white/50"
          />
          <input
            type="tel"
            inputMode="tel"
            value={driverPhone}
            onChange={(e) => setDriverPhone(e.target.value)}
            placeholder="Telefonnummer (valgfritt)"
            className="w-full p-3 text-base rounded-xl bg-white/10 text-white border-2 border-white/30 focus:border-[var(--color-accent)] outline-none placeholder:text-white/50"
          />

          {/* Error Message */}
          {error && (
            <div className="p-2 bg-red-500/20 border border-red-500 rounded-xl text-red-400 text-center text-sm">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex-1" />
          <div className="flex gap-3">
            <button
              onClick={() => router.back()}
              className="flex-1 py-3 rounded-xl bg-white/20 text-white font-bold text-base"
              disabled={saving}
            >
              Avbryt
            </button>
            <button
              onClick={saveSignature}
              className="flex-1 py-3 rounded-xl bg-[var(--color-accent)] text-white font-bold text-base flex items-center justify-center gap-2"
              disabled={saving}
            >
              {saving ? (
                <>
                  <i className="bi bi-arrow-repeat animate-spin"></i>
                  Lagrer...
                </>
              ) : (
                <>
                  <i className="bi bi-check-lg"></i>
                  Bekreft
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right side - Signature Canvas */}
        <div className="flex-1 bg-white rounded-2xl relative">
          <SignatureCanvas
            ref={sigCanvas}
            canvasProps={{
              className: "w-full h-full rounded-2xl touch-none",
              style: { width: "100%", height: "100%", touchAction: "none" },
            }}
            backgroundColor="white"
            penColor="black"
            minWidth={2}
            maxWidth={4}
          />
          <button
            onClick={clearSignature}
            className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1.5 rounded-lg font-bold text-sm"
          >
            Slett
          </button>
          <div className="absolute bottom-3 left-3 text-gray-400 text-sm pointer-events-none">
            Signer her
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignaturePage() {
  return (
    <Suspense
      fallback={
        <div className="h-dvh w-full bg-[var(--color-bg)] flex items-center justify-center">
          <div className="text-white text-2xl">Laster...</div>
        </div>
      }
    >
      <SignatureContent />
    </Suspense>
  );
}
