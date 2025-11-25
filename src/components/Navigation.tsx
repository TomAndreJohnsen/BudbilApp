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
      {/* Floating Buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-40">
        <button
          onClick={() => setMenuOpen(true)}
          className="w-16 h-16 rounded-full bg-[var(--color-accent)] text-white text-2xl flex items-center justify-center shadow-lg hover:scale-95 transition-transform"
          aria-label="Menu"
        >
          <i className="bi bi-list"></i>
        </button>
        <button
          onClick={() => router.push("/")}
          className="w-16 h-16 rounded-full bg-[var(--color-accent)] text-white text-2xl flex items-center justify-center shadow-lg hover:scale-95 transition-transform"
          aria-label="Hjem"
        >
          <i className="bi bi-house-fill"></i>
        </button>
      </div>

      {/* Menu Overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-[var(--color-bg)] z-50 flex flex-col items-center justify-center"
          onClick={() => setMenuOpen(false)}
        >
          <button
            className="absolute top-6 right-6 text-white text-4xl"
            onClick={() => setMenuOpen(false)}
            aria-label="Lukk"
          >
            <i className="bi bi-x-lg"></i>
          </button>
          <nav className="flex flex-col gap-8 text-center">
            <Link
              href="/"
              className="text-white text-4xl font-bold hover:text-[var(--color-accent)] transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Hjem
            </Link>
            <Link
              href="/carriers"
              className="text-white text-4xl font-bold hover:text-[var(--color-accent)] transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Velg Budbilfirma
            </Link>
            <Link
              href="/orders"
              className="text-white text-4xl font-bold hover:text-[var(--color-accent)] transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Alle Ordrer
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}
