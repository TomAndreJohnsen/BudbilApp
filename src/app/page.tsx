"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="h-dvh w-full bg-[var(--color-bg)] flex flex-col justify-center items-center gap-8">
      <h1 className="text-white font-extrabold text-6xl md:text-7xl lg:text-8xl tracking-wider uppercase animate-fadeInDown">
        BUDBIL
      </h1>
      <button
        onClick={() => router.push("/carriers")}
        className="w-40 h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 rounded-full bg-[var(--color-accent)] text-white font-extrabold text-xl md:text-2xl uppercase shadow-2xl hover:scale-95 active:scale-90 transition-transform animate-pulse-slow flex items-center justify-center"
      >
        TRYKK HER
      </button>
    </div>
  );
}
