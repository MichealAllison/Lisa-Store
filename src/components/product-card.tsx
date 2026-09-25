import Image from "next/image";
import Link from "next/link";
import { formatNaira } from "@/lib/settings";
import { parseImages } from "@/lib/product-utils";
import type { Product } from "@prisma/client";

export function ProductCard({ product }: { product: Pick<Product, "slug" | "name" | "price" | "images" | "isNew"> }) {
  const images = parseImages(product.images);
  return (
    <Link
      href={`/product/${product.slug}`}
      className="group block overflow-hidden rounded-xl bg-white"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-ink/5">
        {images[0] && (
          <Image
            src={images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}
        {product.isNew && (
          <span className="absolute left-3 top-3 rounded-full bg-ink px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
            New
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-sm font-semibold">{product.name}</h3>
        <p className="mt-1 text-sm text-ink/60">{formatNaira(product.price)}</p>
      </div>
    </Link>
  );
}
