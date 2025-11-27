"use client";

import { useEffect, useState } from "react";
import { usePageTransition } from "@/lib/usePageTransition";

interface Carrier {
  CarrierID: number;
  CompanyName: string;
  LogoPath: string | null;
  ContactPhone: string | null;
}

const ITEMS_PER_PAGE = 8;

export default function CarriersPage() {
  const { navigate } = usePageTransition();
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
    navigate(`/orders?carrier=${carrierId}`);
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
        <div className="text-white font-bold" style={{ fontSize: '3rem' }}>Laster...</div>
      </div>
    );
  }

  return (
    <div className="h-dvh bg-[#073F4B] overflow-hidden">
      {/* Carrier Grid - 4x2 */}
      <div
        className="absolute grid grid-cols-4 grid-rows-2"
        style={{
          top: '40px',
          left: '40px',
          right: '40px',
          bottom: '140px',
          gap: '16px',
        }}
      >
        {visibleCarriers.map((carrier) => (
          <button
            key={carrier.CarrierID}
            onClick={() => selectCarrier(carrier.CarrierID)}
            className="flex flex-col hover:brightness-105 active:scale-[0.98] transition-all overflow-hidden"
            style={{
              backgroundColor: '#8faa8f',
              borderRadius: '16px',
            }}
          >
            {/* Top half - Logo */}
            <div className="flex-1 flex items-center justify-center p-3" style={{ marginTop: '30px' }}>
              <div className="bg-white rounded-full flex items-center justify-center overflow-hidden w-full h-full max-w-[140px] max-h-[140px] aspect-square">
                {carrier.LogoPath ? (
                  <img
                    src={carrier.LogoPath.startsWith("/") ? carrier.LogoPath : `/${carrier.LogoPath}`}
                    alt={carrier.CompanyName}
                    className="w-[80%] h-[80%] object-contain"
                  />
                ) : (
                  <span className="text-3xl font-bold text-[#1a3a3a]">
                    {carrier.CompanyName.substring(0, 2).toUpperCase()}
                  </span>
                )}
              </div>
            </div>
            {/* Bottom half - Company name */}
            <div className="flex-1 flex items-center justify-center px-2">
              <span
                className="text-center leading-tight"
                style={{ color: '#1a3a3a', fontSize: '5vh', fontWeight: 600 }}
              >
                {carrier.CompanyName}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Bottom Navigation Bar - same style as /orders */}
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
          onClick={() => navigate("/")}
          className="flex-1 rounded-xl font-extrabold uppercase bg-[#073F4B] text-white border-[3px] border-[#9CBD93] shadow-lg hover:brightness-110 transition-all"
          style={{ fontSize: '2rem' }}
        >
          TILBAKE
        </button>
        <button
          onClick={() => setShowPinModal(true)}
          className="flex-1 rounded-xl font-extrabold uppercase bg-[#073F4B] text-white border-[3px] border-[#9CBD93] shadow-lg hover:brightness-110 transition-all"
          style={{ fontSize: '2rem' }}
        >
          LEGG TIL
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

      {/* PIN Modal - Full Screen */}
      {showPinModal && (
        <div className="fixed inset-0 bg-[#073F4B] z-[100] flex flex-col justify-center items-center" style={{ padding: '5vh 5vw' }}>
          <div className="flex flex-col items-center justify-center flex-1 w-full max-w-[800px]">
            <h2 className="text-[#9CBD93] font-extrabold text-center mb-[4vh]" style={{ fontSize: '4vh' }}>
              Be om assistanse fra en ansatt
            </h2>
            <p className="text-white text-center mb-[4vh]" style={{ fontSize: '3vh' }}>
              Skriv inn pinkode for å legge til nytt firma
            </p>
            <input
              type="password"
              inputMode="numeric"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && verifyPin()}
              placeholder="Pinkode"
              maxLength={4}
              className={`w-full max-w-[400px] text-center rounded-[2vh] bg-white text-gray-800 mb-[4vh] ${
                pinError ? "border-4 border-red-500" : "border-0"
              } outline-none`}
              style={{ fontSize: '4vh', padding: '3vh' }}
              autoFocus
            />
            {pinError && (
              <p className="text-red-400 mb-[3vh]" style={{ fontSize: '3vh' }}>Feil PIN-kode</p>
            )}
            <div className="flex gap-[3vw] w-full max-w-[600px]">
              <button
                onClick={verifyPin}
                className="flex-1 rounded-[2vh] bg-[#9CBD93] text-[#073F4B] font-extrabold uppercase shadow-lg"
                style={{ fontSize: '3vh', height: '12vh' }}
              >
                OK
              </button>
              <button
                onClick={() => {
                  setShowPinModal(false);
                  setPin("");
                  setPinError(false);
                }}
                className="flex-1 rounded-[2vh] bg-[#6B7280] text-white font-extrabold uppercase shadow-lg"
                style={{ fontSize: '3vh', height: '12vh' }}
              >
                AVBRYT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Carrier Modal - Full Screen */}
      {showAddModal && (
        <div className="fixed inset-0 bg-[#073F4B] z-[100] flex flex-col justify-center items-center" style={{ padding: '5vh 5vw' }}>
          <div className="flex flex-col items-center justify-center flex-1 w-full max-w-[800px]">
            <h2 className="text-[#9CBD93] font-extrabold text-center mb-[5vh]" style={{ fontSize: '4vh' }}>
              Legg til budbil firma
            </h2>
            <input
              type="text"
              value={newCarrierName}
              onChange={(e) => setNewCarrierName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCarrier()}
              placeholder="Firmanavn..."
              className="w-full rounded-[2vh] bg-white/10 text-white border-[0.5vh] border-[#9CBD93] outline-none mb-[5vh]"
              style={{ fontSize: '3vh', padding: '3vh 3vw' }}
              autoFocus
            />
            <div className="grid grid-cols-2 gap-[4vw] w-full">
              <button
                onClick={addCarrier}
                className="rounded-[2vh] bg-[#9CBD93] text-[#073F4B] font-extrabold uppercase shadow-lg"
                style={{ fontSize: '3vh', height: '12vh' }}
              >
                Lagre
              </button>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewCarrierName("");
                }}
                className="rounded-[2vh] bg-[#073F4B] text-white font-extrabold uppercase border-[0.5vh] border-[#9CBD93] shadow-lg"
                style={{ fontSize: '3vh', height: '12vh' }}
              >
                Avbryt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
