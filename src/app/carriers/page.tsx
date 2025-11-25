"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Carrier {
  CarrierID: number;
  CompanyName: string;
  LogoPath: string | null;
  ContactPhone: string | null;
}

export default function CarriersPage() {
  const router = useRouter();
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState("");
  const [newCarrierName, setNewCarrierName] = useState("");
  const [pinError, setPinError] = useState(false);

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
      <div className="h-dvh w-full bg-[var(--color-bg)] flex items-center justify-center">
        <div className="text-white text-2xl">Laster...</div>
      </div>
    );
  }

  return (
    <div className="h-dvh bg-[var(--color-bg)] p-4 flex flex-col">
      {/* Header - compact for tablet */}
      <div className="text-center py-2">
        <h1 className="text-[var(--color-accent)] text-3xl md:text-4xl font-extrabold uppercase">
          Velg Budbilfirma
        </h1>
        <p className="text-white/70 text-sm md:text-base mt-1">
          Trykk på et firma for å se ventende ordrer
        </p>
      </div>

      {/* Carrier Grid - 4 cols x 3 rows for landscape tablet */}
      <div className="flex-1 grid grid-cols-4 grid-rows-3 gap-3 py-2">
        {carriers.map((carrier) => (
          <button
            key={carrier.CarrierID}
            onClick={() => selectCarrier(carrier.CarrierID)}
            className="bg-[var(--color-accent)] text-white rounded-2xl shadow-lg flex flex-col justify-center items-center p-3 font-bold text-base hover:scale-[0.97] active:scale-95 transition-transform"
          >
            {carrier.LogoPath ? (
              <img
                src={carrier.LogoPath.startsWith("/") ? carrier.LogoPath : `/${carrier.LogoPath}`}
                alt={carrier.CompanyName}
                className="object-contain w-16 h-16 mb-1"
              />
            ) : (
              <i className="bi bi-truck text-4xl mb-1"></i>
            )}
            <span className="text-center text-sm leading-tight line-clamp-2">
              {carrier.CompanyName}
            </span>
          </button>
        ))}

        {/* Add New Carrier Button */}
        <button
          onClick={() => setShowPinModal(true)}
          className="bg-white/10 text-white rounded-2xl shadow-lg flex flex-col justify-center items-center p-3 font-bold text-base hover:bg-white/20 transition-colors border-2 border-dashed border-white/40"
        >
          <i className="bi bi-plus-circle text-4xl mb-1"></i>
          <span className="text-sm">Legg til</span>
        </button>
      </div>

      {/* PIN Modal */}
      {showPinModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--color-bg)] p-6 rounded-2xl w-full max-w-sm border border-white/20">
            <h2 className="text-white text-xl font-bold mb-4 text-center">
              Skriv inn PIN-kode
            </h2>
            <input
              type="password"
              inputMode="numeric"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && verifyPin()}
              placeholder="PIN"
              className={`w-full p-4 text-2xl text-center rounded-xl bg-white/10 text-white border-2 ${
                pinError ? "border-red-500" : "border-white/30"
              } focus:border-[var(--color-accent)] outline-none`}
              autoFocus
            />
            {pinError && (
              <p className="text-red-400 text-center mt-2 text-sm">Feil PIN-kode</p>
            )}
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  setShowPinModal(false);
                  setPin("");
                  setPinError(false);
                }}
                className="flex-1 p-3 rounded-xl bg-white/20 text-white font-bold text-lg"
              >
                Avbryt
              </button>
              <button
                onClick={verifyPin}
                className="flex-1 p-3 rounded-xl bg-[var(--color-accent)] text-white font-bold text-lg"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Carrier Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--color-bg)] p-6 rounded-2xl w-full max-w-sm border border-white/20">
            <h2 className="text-white text-xl font-bold mb-4 text-center">
              Legg til budbilfirma
            </h2>
            <input
              type="text"
              value={newCarrierName}
              onChange={(e) => setNewCarrierName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCarrier()}
              placeholder="Firmanavn"
              className="w-full p-4 text-lg rounded-xl bg-white/10 text-white border-2 border-white/30 focus:border-[var(--color-accent)] outline-none"
              autoFocus
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewCarrierName("");
                }}
                className="flex-1 p-3 rounded-xl bg-white/20 text-white font-bold text-lg"
              >
                Avbryt
              </button>
              <button
                onClick={addCarrier}
                className="flex-1 p-3 rounded-xl bg-[var(--color-accent)] text-white font-bold text-lg"
              >
                Lagre
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
