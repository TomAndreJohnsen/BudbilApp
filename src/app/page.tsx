"use client";

import { usePageTransition } from "@/lib/usePageTransition";

export default function Home() {
  const { navigate } = usePageTransition();

  return (
    <div className="h-dvh w-full bg-[#073F4B] flex flex-col justify-center items-center gap-[8vh]">
      <h1
        className="text-white font-extrabold tracking-wider uppercase"
        style={{ fontSize: 'clamp(8vh, 14vh, 18vh)', letterSpacing: '0.6vw' }}
      >
        BUDBIL
      </h1>
      <button
        onClick={() => navigate("/carriers")}
        className="rounded-full bg-[#9CBD93] text-white font-extrabold uppercase shadow-2xl hover:scale-95 active:scale-90 transition-transform flex items-center justify-center animate-breathe"
        style={{
          width: 'clamp(22vh, 30vh, 38vh)',
          height: 'clamp(22vh, 30vh, 38vh)',
          fontSize: 'clamp(2.4vh, 3.2vh, 4vh)'
        }}
      >
        TRYKK HER
      </button>
    </div>
  );
}
