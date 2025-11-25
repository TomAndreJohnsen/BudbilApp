"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

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
      setCarriers(data);
    } catch (err) {
      console.error("Failed to fetch carriers:", err);
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
      <div className="h-screen w-full bg-[var(--color-bg)] flex items-center justify-center">
        <div className="text-white text-2xl">Laster...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] p-[5vh_5vw] flex flex-col gap-[4vh]">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-[var(--color-accent)] text-[clamp(5vh,8vh,10vh)] font-extrabold uppercase">
          Velg Budbilfirma
        </h1>
        <p className="text-white/80 text-[clamp(2vh,2.6vh,3vh)] mt-[2vh]">
          Trykk på et firma for å se ventende ordrer
        </p>
      </div>

      {/* Carrier Grid */}
      <div className="flex-1 grid grid-cols-3 grid-rows-5 gap-[3vh]">
        {carriers.map((carrier) => (
          <button
            key={carrier.CarrierID}
            onClick={() => selectCarrier(carrier.CarrierID)}
            className="bg-[var(--color-accent)] text-white rounded-[3vh] shadow-[0_1vh_2vh_rgba(0,0,0,0.2)] flex flex-col justify-center items-center p-[2vh] font-bold text-[clamp(2vh,2.6vh,3vh)] hover:scale-[0.97] active:scale-95 transition-transform"
          >
            {carrier.LogoPath ? (
              <Image
                src={carrier.LogoPath}
                alt={carrier.CompanyName}
                width={80}
                height={80}
                className="object-contain mb-2 max-h-[8vh]"
              />
            ) : (
              <i className="bi bi-truck text-[5vh] mb-2"></i>
            )}
            <span className="text-center">{carrier.CompanyName}</span>
          </button>
        ))}

        {/* Add New Carrier Button */}
        <button
          onClick={() => setShowPinModal(true)}
          className="bg-white/20 text-white rounded-[3vh] shadow-[0_1vh_2vh_rgba(0,0,0,0.2)] flex flex-col justify-center items-center p-[2vh] font-bold text-[clamp(2vh,2.6vh,3vh)] hover:bg-white/30 transition-colors border-2 border-dashed border-white/50"
        >
          <i className="bi bi-plus-circle text-[5vh] mb-2"></i>
          <span>Legg til nytt</span>
        </button>
      </div>

      {/* PIN Modal */}
      {showPinModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[var(--color-bg)] p-8 rounded-2xl w-[90%] max-w-md border border-white/20">
            <h2 className="text-white text-2xl font-bold mb-6 text-center">
              Skriv inn PIN-kode
            </h2>
            <input
              type="password"
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
              <p className="text-red-400 text-center mt-2">Feil PIN-kode</p>
            )}
            <div className="flex gap-4 mt-6">
              <button
                onClick={() => {
                  setShowPinModal(false);
                  setPin("");
                  setPinError(false);
                }}
                className="flex-1 p-4 rounded-xl bg-white/20 text-white font-bold"
              >
                Avbryt
              </button>
              <button
                onClick={verifyPin}
                className="flex-1 p-4 rounded-xl bg-[var(--color-accent)] text-white font-bold"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Carrier Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[var(--color-bg)] p-8 rounded-2xl w-[90%] max-w-md border border-white/20">
            <h2 className="text-white text-2xl font-bold mb-6 text-center">
              Legg til nytt budbilfirma
            </h2>
            <input
              type="text"
              value={newCarrierName}
              onChange={(e) => setNewCarrierName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCarrier()}
              placeholder="Firmanavn"
              className="w-full p-4 text-xl rounded-xl bg-white/10 text-white border-2 border-white/30 focus:border-[var(--color-accent)] outline-none"
              autoFocus
            />
            <div className="flex gap-4 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewCarrierName("");
                }}
                className="flex-1 p-4 rounded-xl bg-white/20 text-white font-bold"
              >
                Avbryt
              </button>
              <button
                onClick={addCarrier}
                className="flex-1 p-4 rounded-xl bg-[var(--color-accent)] text-white font-bold"
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
