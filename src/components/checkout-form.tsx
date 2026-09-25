"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/cart-context";
import { formatNaira } from "@/lib/settings";
import { SITE_NAME } from "@/lib/site";

/**
 * Checkout is WhatsApp-only: we save the order through /api/checkout and open
 * WhatsApp with every line pre-filled. The customer hits send and we confirm
 * the order from the admin dashboard.
 */
export function CheckoutForm() {
  const { items, subtotal, clear, ready } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const fd = new FormData(e.currentTarget);
    const payload = {
      customerName: String(fd.get("customerName") || ""),
      customerPhone: String(fd.get("customerPhone") || ""),
      customerEmail: String(fd.get("customerEmail") || ""),
      address: String(fd.get("address") || ""),
      items: items.map((i) => ({
        productId: i.productId,
        name: i.name,
        size: i.size,
        quantity: i.quantity,
        price: i.price,
      })),
    };

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      if (!data.whatsappUrl) throw new Error("Could not build the WhatsApp link — please try again");

      // Opens WhatsApp (app or web) in a new tab with the order pre-filled.
      window.open(data.whatsappUrl, "_blank", "noopener,noreferrer");
      clear();
      router.push(`/order/${data.orderId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  if (!ready) {
    return <p className="py-20 text-center text-sm text-ink/50">Loading checkout…</p>;
  }

  if (items.length === 0) {
    return (
      <div className="py-24 text-center">
        <h1 className="text-3xl font-extrabold uppercase">Your cart is empty</h1>
        <Link href="/shop" className="btn-primary mt-6 inline-flex">Shop now</Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-10 md:grid-cols-[1fr_360px]">
      <div>
        <fieldset className="card p-6">
          <legend className="sr-only">Delivery details</legend>
          <h2 className="mb-5 text-sm font-bold uppercase tracking-wide">Delivery details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="customerName" className="label">Full name *</label>
              <input id="customerName" name="customerName" required className="input" placeholder="Ada Obi" />
            </div>
            <div>
              <label htmlFor="customerPhone" className="label">Phone (WhatsApp) *</label>
              <input id="customerPhone" name="customerPhone" required className="input"
                placeholder="08012345678" inputMode="tel" />
            </div>
            <div>
              <label htmlFor="customerEmail" className="label">Email (optional)</label>
              <input id="customerEmail" name="customerEmail" type="email" className="input"
                placeholder="you@example.com" />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="address" className="label">Delivery address *</label>
              <textarea id="address" name="address" required rows={3} className="input"
                placeholder="12 Aminu Kano Cres, Wuse II, Abuja" />
            </div>
          </div>
        </fieldset>

        <div className="mt-8 rounded-xl border border-accent/25 bg-accent/5 p-5">
          <p className="text-sm font-bold">💬 Checkout on WhatsApp</p>
          <p className="mt-1 text-xs text-ink/70">
            We&apos;ll open WhatsApp with your order and delivery details pre-filled — just press
            send. The {SITE_NAME} team confirms stock, delivery and payment (transfer or on
            delivery) in the chat.
          </p>
        </div>

        {error && (
          <p role="alert" className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        )}

        <button type="submit" disabled={loading} className="btn-primary mt-8 w-full">
          {loading ? "Opening WhatsApp…" : `Order on WhatsApp — ${formatNaira(subtotal)}`}
        </button>
      </div>

      <aside className="card h-fit p-6" aria-label="Order summary">
        <h2 className="text-sm font-bold uppercase tracking-wide">Order summary</h2>
        <ul role="list" className="mt-4 divide-y divide-ink/10 text-sm">
          {items.map((i) => (
            <li key={`${i.productId}:${i.size ?? ""}`} className="flex justify-between py-3">
              <span>
                {i.name}
                {i.size && <span className="text-ink/50"> ({i.size})</span>}
                <span className="text-ink/50"> ×{i.quantity}</span>
              </span>
              <span>{formatNaira(i.price * i.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="flex justify-between border-t border-ink/10 pt-4 font-bold">
          <span>Total</span>
          <span>{formatNaira(subtotal)}</span>
        </div>
      </aside>
    </form>
  );
}
