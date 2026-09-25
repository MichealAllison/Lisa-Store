import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { ProductCard } from "@/components/product-card";
import { SITE_NAME } from "@/lib/site";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Shop",
  description: `Shop ties, scarves and pocket squares from ${SITE_NAME} — new styles added regularly.`,
};

export default async function ShopPage() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: { inStock: true },
      orderBy: { createdAt: "desc" },
      include: { category: true },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="container-site py-10">
      <h1 className="text-3xl font-extrabold uppercase tracking-tight">Shop all</h1>

      <nav aria-label="Categories" className="mt-4 flex flex-wrap gap-2">
        <Link
          href="/shop"
          className="rounded-full border border-ink bg-ink px-4 py-1.5 text-xs font-semibold text-white"
        >
          All
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/shop/${c.slug}`}
            className="rounded-full border border-ink/20 px-4 py-1.5 text-xs font-semibold hover:border-ink"
          >
            {c.name}
          </Link>
        ))}
      </nav>

      {products.length === 0 ? (
        <p className="py-16 text-center text-sm text-ink/50">Nothing here yet — check back soon.</p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
