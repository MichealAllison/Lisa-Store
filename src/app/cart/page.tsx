"use client";

import Image from "next/image";
import Link from "next/link";
import { itemKey, useCart } from "@/components/cart-context";
import { formatNaira } from "@/lib/settings";

export default function CartPage() {
  const { items, subtotal, updateQuantity, removeItem, ready } = useCart();

  if (!ready) {
    return <div className="container-site py-20 text-center text-sm text-ink/50">Loading cart…</div>;
  }

  if (items.length === 0) {
    return (
      <div className="container-site py-24 text-center">
        <h1 className="text-3xl font-extrabold uppercase tracking-tight">Your cart is empty</h1>
        <p className="mt-3 text-sm text-ink/60">Head to the shop and grab something from the drop.</p>
        <Link href="/shop" className="btn-primary mt-6">Shop now</Link>
      </div>
    );
  }

  return (
    <div className="container-site py-10">
      <h1 className="text-3xl font-extrabold uppercase tracking-tight">Cart</h1>

      <ul role="list" className="mt-8 divide-y divide-ink/10">
        {items.map((item) => {
          const key = itemKey(item);
          return (
            <li key={key} className="flex gap-4 py-6">
              <Link
                href={`/product/${item.slug}`}
                className="relative h-28 w-22 shrink-0 overflow-hidden rounded-lg bg-ink/5"
                style={{ width: "5.5rem" }}
              >
                {item.image && (
                  <Image src={item.image} alt={item.name} fill sizes="88px" className="object-cover" />
                )}
              </Link>
              <div className="flex flex-1 flex-col justify-between">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold">{item.name}</p>
                    {item.size && <p className="text-xs text-ink/50">Size: {item.size}</p>}
                    <p className="mt-1 text-sm text-ink/60">{formatNaira(item.price)}</p>
                  </div>
                  <button
                    onClick={() => removeItem(key)}
                    className="text-xs text-ink/40 underline hover:text-red-600"
                  >
                    Remove
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center rounded-lg border border-ink/20">
                    <button
                      className="px-3 py-1.5"
                      onClick={() => updateQuantity(key, item.quantity - 1)}
                      aria-label={`Decrease quantity of ${item.name}`}
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                    <button
                      className="px-3 py-1.5"
                      onClick={() => updateQuantity(key, item.quantity + 1)}
                      aria-label={`Increase quantity of ${item.name}`}
                    >
                      +
                    </button>
                  </div>
                  <p className="text-sm font-bold">{formatNaira(item.price * item.quantity)}</p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-8 flex items-center justify-between border-t border-ink/10 pt-6">
        <span className="text-sm font-semibold uppercase">Subtotal</span>
        <span className="text-xl font-extrabold">{formatNaira(subtotal)}</span>
      </div>
      <p className="mt-1 text-right text-xs text-ink/40">Delivery calculated at checkout.</p>

      <div className="mt-8 flex justify-end">
        <Link href="/checkout" className="btn-primary w-full sm:w-auto">Checkout</Link>
      </div>
    </div>
  );
}
