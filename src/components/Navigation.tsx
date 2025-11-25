"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

export function Navigation() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Hide nav on home page
  if (pathname === "/") return null;

  return (
    <>
      {/* Floating Buttons - positioned for tablet */}
      <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-40">
        <button
          onClick={() => setMenuOpen(true)}
          className="w-12 h-12 rounded-full bg-[var(--color-accent)] text-white text-xl flex items-center justify-center shadow-lg hover:scale-95 active:scale-90 transition-transform"
          aria-label="Menu"
        >
          <i className="bi bi-list"></i>
        </button>
        <button
          onClick={() => router.push("/")}
          className="w-12 h-12 rounded-full bg-[var(--color-accent)] text-white text-xl flex items-center justify-center shadow-lg hover:scale-95 active:scale-90 transition-transform"
          aria-label="Hjem"
        >
          <i className="bi bi-house-fill"></i>
        </button>
      </div>

      {/* Menu Overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-[var(--color-bg)]/95 z-50 flex flex-col items-center justify-center"
          onClick={() => setMenuOpen(false)}
        >
          <button
            className="absolute top-4 right-4 w-12 h-12 flex items-center justify-center text-white text-2xl"
            onClick={() => setMenuOpen(false)}
            aria-label="Lukk"
          >
            <i className="bi bi-x-lg"></i>
          </button>
          <nav className="flex flex-col gap-6 text-center">
            <Link
              href="/"
              className="text-white text-3xl font-bold hover:text-[var(--color-accent)] active:scale-95 transition-all"
              onClick={() => setMenuOpen(false)}
            >
              <i className="bi bi-house-fill mr-3"></i>
              Hjem
            </Link>
            <Link
              href="/carriers"
              className="text-white text-3xl font-bold hover:text-[var(--color-accent)] active:scale-95 transition-all"
              onClick={() => setMenuOpen(false)}
            >
              <i className="bi bi-truck mr-3"></i>
              Velg Budbilfirma
            </Link>
            <Link
              href="/orders"
              className="text-white text-3xl font-bold hover:text-[var(--color-accent)] active:scale-95 transition-all"
              onClick={() => setMenuOpen(false)}
            >
              <i className="bi bi-box-seam mr-3"></i>
              Alle Ordrer
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}
