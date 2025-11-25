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
      setError("Kunne ikke lagre. Prosv igjen.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] p-[3vh_3vw] flex flex-col">
      {/* Header */}
      <div className="text-center mb-[3vh]">
        <h1 className="text-[var(--color-accent)] text-[clamp(4vh,6vh,8vh)] font-extrabold uppercase">
          Signatur
        </h1>
        <p className="text-white/80 text-[clamp(1.8vh,2.2vh,2.6vh)] mt-[1vh]">
          {orderIds.length} {orderIds.length === 1 ? "ordre" : "ordrer"} valgt
        </p>
      </div>

      {/* Driver Info */}
      <div className="space-y-4 mb-6">
        <input
          type="text"
          value={driverName}
          onChange={(e) => setDriverName(e.target.value)}
          placeholder="Sjaforens navn *"
          className="w-full p-4 text-lg rounded-xl bg-white/10 text-white border-2 border-white/30 focus:border-[var(--color-accent)] outline-none"
        />
        <input
          type="tel"
          value={driverPhone}
          onChange={(e) => setDriverPhone(e.target.value)}
          placeholder="Telefonnummer (valgfritt)"
          className="w-full p-4 text-lg rounded-xl bg-white/10 text-white border-2 border-white/30 focus:border-[var(--color-accent)] outline-none"
        />
      </div>

      {/* Signature Canvas */}
      <div className="flex-1 bg-white rounded-2xl relative min-h-[30vh]">
        <SignatureCanvas
          ref={sigCanvas}
          canvasProps={{
            className: "w-full h-full rounded-2xl",
            style: { width: "100%", height: "100%" },
          }}
          backgroundColor="white"
        />
        <button
          onClick={clearSignature}
          className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg font-bold"
        >
          Slett
        </button>
        <div className="absolute bottom-4 left-4 text-gray-400 text-sm">
          Signer her
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-3 bg-red-500/20 border border-red-500 rounded-xl text-red-400 text-center">
          {error}
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-6 flex gap-4">
        <button
          onClick={() => router.back()}
          className="flex-1 py-5 rounded-2xl bg-white/20 text-white font-bold text-xl"
          disabled={saving}
        >
          Avbryt
        </button>
        <button
          onClick={saveSignature}
          className="flex-1 py-5 rounded-2xl bg-[var(--color-accent)] text-white font-bold text-xl flex items-center justify-center gap-2"
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
  );
}

export default function SignaturePage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-full bg-[var(--color-bg)] flex items-center justify-center">
          <div className="text-white text-2xl">Laster...</div>
        </div>
      }
    >
      <SignatureContent />
    </Suspense>
  );
}
