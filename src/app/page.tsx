"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="h-screen w-full bg-[var(--color-bg)] flex flex-col justify-center items-center gap-[8vh]">
      <h1 className="text-white font-extrabold text-[clamp(8vh,14vh,18vh)] tracking-[0.6vw] uppercase animate-fadeInDown">
        BUDBIL
      </h1>
      <button
        onClick={() => router.push("/carriers")}
        className="w-[clamp(22vh,30vh,38vh)] h-[clamp(22vh,30vh,38vh)] rounded-full bg-[var(--color-accent)] text-white font-extrabold text-[clamp(2.4vh,3.2vh,4vh)] uppercase shadow-[0_1.5vh_3vh_rgba(0,0,0,0.35)] hover:scale-95 active:scale-90 transition-transform animate-pulse-slow flex items-center justify-center"
      >
        TRYKK HER
      </button>
    </div>
  );
}
