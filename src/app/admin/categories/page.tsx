import { prisma } from "@/lib/db";
import { deleteCategory, saveCategory } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div className="max-w-xl">
      <h2 className="mb-6 text-sm font-bold uppercase tracking-wide">Categories</h2>

      <form action={saveCategory} className="card flex items-end gap-3 p-5">
        <div className="flex-1">
          <label htmlFor="name" className="label">New category</label>
          <input id="name" name="name" required className="input" placeholder="Tees" />
        </div>
        <button type="submit" className="btn-primary !py-2 text-xs">Add</button>
      </form>

      <ul role="list" className="mt-6 divide-y divide-ink/10 text-sm">
        {categories.map((c) => (
          <li key={c.id} className="flex items-center justify-between py-3">
            <span className="font-semibold">{c.name}</span>
            <span className="flex items-center gap-4 text-xs text-ink/50">
              {c._count.products} products
              <form action={deleteCategory}>
                <input type="hidden" name="id" value={c.id} />
                <button type="submit" className="underline hover:text-red-600">Delete</button>
              </form>
            </span>
          </li>
        ))}
      </ul>
      {categories.length === 0 && <p className="mt-4 text-sm text-ink/50">No categories yet.</p>}
    </div>
  );
}
