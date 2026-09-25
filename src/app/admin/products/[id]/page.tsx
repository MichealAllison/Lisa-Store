import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ProductForm } from "@/components/product-form";
import { parseImages, parseSizes } from "@/lib/product-utils";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: { id: string };
}) {
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id: params.id } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!product) notFound();

  return (
    <div>
      <h2 className="mb-6 text-sm font-bold uppercase tracking-wide">Edit — {product.name}</h2>
      <ProductForm
        categories={categories}
        initial={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description,
          priceNaira: Math.round(product.price / 100),
          imagesText: parseImages(product.images).join("\n"),
          sizesText: parseSizes(product.sizes).join(", "),
          stock: product.stock,
          inStock: product.inStock,
          isNew: product.isNew,
          categoryId: product.categoryId ?? "",
        }}
      />
    </div>
  );
}
