"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/cart-context";
import { Wordmark } from "@/components/wordmark";

export function Header({ announcement }: { announcement: string }) {
  const { count } = useCart();
  const [open, setOpen] = useState(false);

  return (
    <>
      {announcement && (
        <div className="bg-ink px-4 py-2 text-center text-xs font-medium tracking-wide text-white">
          {announcement}
        </div>
      )}
      <header className="sticky top-0 z-40 border-b border-ink/10 bg-bone/90 backdrop-blur">
        <div className="container-site flex h-16 items-center justify-between">
          <button
            aria-label="Toggle menu"
            className="md:hidden"
            onClick={() => setOpen((o) => !o)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {open ? <path d="M18 6L6 18M6 6l12 12" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
            </svg>
          </button>

          <Wordmark />

          <nav className="hidden gap-8 text-sm font-medium md:flex" aria-label="Main navigation">
            <Link href="/shop" className="hover:text-accent">Shop</Link>
            <Link href="/contact" className="hover:text-accent">Contact</Link>
          </nav>

          <Link href="/cart" className="relative p-2 hover:text-accent" aria-label={`Cart, ${count} items`}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 7h12l-1.5 12h-9L6 7z" />
              <path d="M9 10V6a3 3 0 016 0v4" />
            </svg>
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-white">
                {count}
              </span>
            )}
          </Link>
        </div>
        {open && (
          <nav className="border-t border-ink/10 bg-bone px-6 py-4 md:hidden" aria-label="Mobile navigation">
            <ul className="flex flex-col gap-4 text-sm font-medium">
              <li><Link href="/shop" onClick={() => setOpen(false)}>Shop</Link></li>
              <li><Link href="/contact" onClick={() => setOpen(false)}>Contact</Link></li>
            </ul>
          </nav>
        )}
      </header>
    </>
  );
}
