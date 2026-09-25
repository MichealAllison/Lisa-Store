import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatNaira } from "@/lib/settings";
import { parseImages } from "@/lib/product-utils";
import { deleteProduct } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: true },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wide">Products ({products.length})</h2>
        <Link href="/admin/products/new" className="btn-primary !py-2 text-xs">+ New product</Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-ink/10 text-xs uppercase text-ink/50">
              <th className="py-3">Product</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Category</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-ink/5">
                <td className="py-3 font-semibold">
                  {p.name}
                  {p.isNew && <span className="ml-2 rounded-full bg-ink px-2 py-0.5 text-[9px] uppercase text-white">New</span>}
                </td>
                <td>{formatNaira(p.price)}</td>
                <td>{p.stock}{!p.inStock && " (hidden)"}</td>
                <td className="text-ink/50">{p.category?.name ?? "—"}</td>
                <td className="text-right">
                  <Link href={`/admin/products/${p.id}`} className="mr-3 text-xs underline hover:text-accent">Edit</Link>
                  <form action={deleteProduct} className="inline">
                    <input type="hidden" name="id" value={p.id} />
                    <button type="submit" className="text-xs underline hover:text-red-600">Delete</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {products.length === 0 && <p className="mt-4 text-sm text-ink/50">No products yet.</p>}
    </div>
  );
}
