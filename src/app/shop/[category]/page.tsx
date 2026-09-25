import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { ProductCard } from "@/components/product-card";
import { SITE_NAME } from "@/lib/site";

export const revalidate = 60;

async function getCategory(slug: string) {
  return prisma.category.findUnique({ where: { slug } });
}

export async function generateStaticParams() {
  try {
    const cats = await prisma.category.findMany({ select: { slug: true } });
    return cats.map((c) => ({ category: c.slug }));
  } catch {
    return [];
  }
}


export async function generateMetadata({
  params,
}: {
  params: { category: string };
}): Promise<Metadata> {
  const cat = await getCategory(params.category);
  if (!cat) return { title: "Category not found" };
  return {
    title: `${cat.name} — Shop`,
    description: `Shop ${cat.name} from ${SITE_NAME} — hand-finished, delivered nationwide.`,
    alternates: { canonical: `/shop/${cat.slug}` },
    openGraph: { title: `${cat.name} — ${SITE_NAME}` },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: { category: string };
}) {
  const category = await getCategory(params.category);
  if (!category) notFound();

  const products = await prisma.product.findMany({
    where: { categoryId: category.id, inStock: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container-site py-10">
      <p className="text-xs font-semibold uppercase tracking-wider text-ink/50">
        <Link href="/shop" className="hover:text-accent">Shop</Link> / {category.name}
      </p>
      <h1 className="mt-1 text-3xl font-extrabold uppercase tracking-tight">{category.name}</h1>

      {products.length === 0 ? (
        <p className="py-16 text-center text-sm text-ink/50">No products in this collection yet.</p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
