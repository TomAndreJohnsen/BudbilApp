"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Carrier {
  CarrierID: number;
  CompanyName: string;
  LogoPath: string | null;
  ContactPhone: string | null;
}

const ITEMS_PER_PAGE = 8;

export default function CarriersPage() {
  const router = useRouter();
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [showPinModal, setShowPinModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [pin, setPin] = useState("");
  const [newCarrierName, setNewCarrierName] = useState("");
  const [pinError, setPinError] = useState(false);

  const totalPages = Math.ceil(carriers.length / ITEMS_PER_PAGE);
  const startIndex = currentPage * ITEMS_PER_PAGE;
  const visibleCarriers = carriers.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  useEffect(() => {
    fetchCarriers();
  }, []);

  async function fetchCarriers() {
    try {
      const res = await fetch("/api/carriers");
      const data = await res.json();
      setCarriers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch carriers:", err);
      setCarriers([]);
    } finally {
      setLoading(false);
    }
  }

  function selectCarrier(carrierId: number) {
    router.push(`/orders?carrier=${carrierId}`);
  }

  async function verifyPin() {
    try {
      const res = await fetch("/api/verify-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      if (res.ok) {
        setShowPinModal(false);
        setShowAddModal(true);
        setPin("");
        setPinError(false);
      } else {
        setPinError(true);
      }
    } catch {
      setPinError(true);
    }
  }

  async function addCarrier() {
    if (!newCarrierName.trim()) return;
    try {
      const res = await fetch("/api/carriers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName: newCarrierName }),
      });
      if (res.ok) {
        setShowAddModal(false);
        setNewCarrierName("");
        fetchCarriers();
      }
    } catch (err) {
      console.error("Failed to add carrier:", err);
    }
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
      {/* Carrier Grid - 4x2 */}
      <div className="flex-1 grid grid-cols-4 grid-rows-2 gap-4 mb-4">
        {visibleCarriers.map((carrier) => (
          <button
            key={carrier.CarrierID}
            onClick={() => selectCarrier(carrier.CarrierID)}
            className="bg-[#9CBD93] rounded-2xl shadow-lg flex flex-col items-center justify-center p-4 hover:scale-[0.98] active:scale-95 transition-transform"
          >
            {/* White circle for logo */}
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-3 shadow-md">
              {carrier.LogoPath ? (
                <img
                  src={carrier.LogoPath.startsWith("/") ? carrier.LogoPath : `/${carrier.LogoPath}`}
                  alt={carrier.CompanyName}
                  className="w-20 h-20 object-contain rounded-full"
                />
              ) : (
                <i className="bi bi-truck text-4xl text-[#073F4B]"></i>
              )}
            </div>
            {/* Company name - dark text */}
            <span className="text-[#073F4B] font-bold text-center text-lg leading-tight">
              {carrier.CompanyName}
            </span>
          </button>
        ))}
      </div>

      {/* Bottom Navigation Bar */}
      <div className="grid grid-cols-4 gap-4 h-16">
        <button
          onClick={() => router.push("/")}
          className="border-2 border-[#9CBD93] text-[#9CBD93] rounded-xl font-bold text-lg uppercase hover:bg-[#9CBD93]/10 transition-colors"
        >
          TILBAKE
        </button>
        <button
          onClick={() => setShowPinModal(true)}
          className="border-2 border-[#9CBD93] text-[#9CBD93] rounded-xl font-bold text-lg uppercase hover:bg-[#9CBD93]/10 transition-colors"
        >
          LEGG TIL
        </button>
        {/* Pagination dots */}
        <div className="border-2 border-[#9CBD93] rounded-xl flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, i) => (
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

      {/* PIN Modal */}
      {showPinModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#073F4B] p-8 rounded-2xl w-full max-w-lg border border-[#9CBD93]/30">
            <h2 className="text-[#9CBD93] text-2xl font-bold mb-2 text-center">
              Be om assistanse fra en ansatt
            </h2>
            <p className="text-white text-center mb-6">
              Skriv inn pinkode for å legge til nytt firma
            </p>
            <input
              type="password"
              inputMode="numeric"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && verifyPin()}
              placeholder="Pinkode"
              className={`w-full p-4 text-xl text-center rounded-xl bg-white text-gray-800 border-2 ${
                pinError ? "border-red-500" : "border-[#9CBD93]"
              } outline-none`}
              autoFocus
            />
            {pinError && (
              <p className="text-red-400 text-center mt-2">Feil PIN-kode</p>
            )}
            <div className="flex gap-4 mt-6">
              <button
                onClick={verifyPin}
                className="flex-1 p-4 rounded-xl bg-[#9CBD93] text-white font-bold text-lg uppercase"
              >
                OK
              </button>
              <button
                onClick={() => {
                  setShowPinModal(false);
                  setPin("");
                  setPinError(false);
                }}
                className="flex-1 p-4 rounded-xl bg-gray-500 text-white font-bold text-lg uppercase"
              >
                AVBRYT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Carrier Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#073F4B] p-8 rounded-2xl w-full max-w-lg border border-[#9CBD93]/30">
            <h2 className="text-[#9CBD93] text-2xl font-bold mb-6 text-center">
              Legg til nytt budbilfirma
            </h2>
            <input
              type="text"
              value={newCarrierName}
              onChange={(e) => setNewCarrierName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCarrier()}
              placeholder="Firmanavn"
              className="w-full p-4 text-xl rounded-xl bg-white text-gray-800 border-2 border-[#9CBD93] outline-none"
              autoFocus
            />
            <div className="flex gap-4 mt-6">
              <button
                onClick={addCarrier}
                className="flex-1 p-4 rounded-xl bg-[#9CBD93] text-white font-bold text-lg uppercase"
              >
                OK
              </button>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewCarrierName("");
                }}
                className="flex-1 p-4 rounded-xl bg-gray-500 text-white font-bold text-lg uppercase"
              >
                AVBRYT
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
