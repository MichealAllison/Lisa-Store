"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

const NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/settings", label: "Settings" },
];

export function AdminNav() {
  return (
    <nav aria-label="Admin" className="flex flex-wrap gap-1 border-b border-ink/10 pb-4">
      {NAV.map((n) => (
        <Link
          key={n.href}
          href={n.href}
          className="rounded-full px-4 py-1.5 text-xs font-semibold hover:bg-ink hover:text-white"
        >
          {n.label}
        </Link>
      ))}
    </nav>
  );
}

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();
  if (pathname === "/admin/login") return null;
  return (
    <button
      onClick={async () => {
        setLoading(true);
        await fetch("/api/auth/signout", { method: "POST" });
        router.push("/admin/login");
        router.refresh();
      }}
      className="text-xs text-ink/50 underline hover:text-red-600"
    >
      {loading ? "…" : "Sign out"}
    </button>
  );
}
