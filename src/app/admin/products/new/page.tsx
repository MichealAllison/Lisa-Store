import { prisma } from "@/lib/db";
import { ProductForm } from "@/components/product-form";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return (
    <div>
      <h2 className="mb-6 text-sm font-bold uppercase tracking-wide">New product</h2>
      <ProductForm categories={categories} />
    </div>
  );
}
