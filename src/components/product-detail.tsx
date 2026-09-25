"use client";

import Image from "next/image";
import { useState } from "react";
import { useCart } from "@/components/cart-context";
import type { Product } from "@prisma/client";
import { parseImages, parseSizes } from "@/lib/product-utils";

export function ProductDetail({ product }: { product: Product }) {
  const images = parseImages(product.images);
  const sizes = parseSizes(product.sizes);
  const { addItem } = useCart();

  const [activeImage, setActiveImage] = useState(0);
  const [size, setSize] = useState<string | null>(sizes[0] ?? null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: images[0] ?? "",
      price: product.price,
      size,
      quantity,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  return (
    <div className="grid gap-10 md:grid-cols-2">
      {/* Gallery */}
      <div>
        <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-ink/5">
          {images[activeImage] && (
            <Image
              src={images[activeImage]}
              alt={`${product.name} — image ${activeImage + 1}`}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          )}
        </div>
        {images.length > 1 && (
          <div className="mt-3 flex gap-3">
            {images.map((src, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                aria-label={`Show image ${i + 1}`}
                className={`relative h-20 w-16 overflow-hidden rounded-lg border-2 ${
                  i === activeImage ? "border-ink" : "border-transparent opacity-60"
                }`}
              >
                <Image src={src} alt="" fill sizes="64px" className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div>
        {product.isNew && (
          <span className="mb-3 inline-block rounded-full bg-ink px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
            New
          </span>
        )}
        <h1 className="text-3xl font-extrabold uppercase tracking-tight">{product.name}</h1>
        <p className="mt-3 text-xl font-semibold">
          ₦{(product.price / 100).toLocaleString("en-NG")}
        </p>

        <p className="mt-6 whitespace-pre-line text-sm leading-relaxed text-ink/70">
          {product.description}
        </p>

        {sizes.length > 0 && (
          <fieldset className="mt-8">
            <legend className="label">Size</legend>
            <div className="flex flex-wrap gap-2">
              {sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`min-w-[48px] rounded-lg border px-4 py-2 text-sm font-medium ${
                    size === s ? "border-ink bg-ink text-white" : "border-ink/20 hover:border-ink"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </fieldset>
        )}

        <div className="mt-8">
          <span className="label">Quantity</span>
          <div className="inline-flex items-center rounded-lg border border-ink/20">
            <button
              className="px-4 py-2 text-lg"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="w-10 text-center text-sm font-semibold">{quantity}</span>
            <button
              className="px-4 py-2 text-lg"
              onClick={() => setQuantity((q) => Math.min(50, q + 1))}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        </div>

        <div className="mt-8">
          {product.inStock ? (
            <>
              <button onClick={handleAdd} className="btn-primary w-full sm:w-auto">
                Add to Cart — ₦{((product.price * quantity) / 100).toLocaleString("en-NG")}
              </button>
              {added && (
                <p role="status" className="mt-3 text-sm font-medium text-green-700">
                  Added to cart ✓{" "}
                  <a href="/cart" className="underline">View cart</a>
                </p>
              )}
            </>
          ) : (
            <p className="rounded-lg bg-ink/5 px-4 py-3 text-sm font-medium">Out of stock</p>
          )}
        </div>
      </div>
    </div>
  );
}
