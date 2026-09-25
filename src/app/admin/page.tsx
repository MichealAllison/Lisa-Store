import { prisma } from "@/lib/db";
import { formatNaira } from "@/lib/settings";
import Link from "next/link";

export const dynamic = "force-dynamic";

const STATUS_STYLES: Record<string, string> = {
  paid: "bg-green-100 text-green-800",
  pending_whatsapp: "bg-yellow-100 text-yellow-800",
  pending_payment: "bg-blue-100 text-blue-800",
  confirmed: "bg-purple-100 text-purple-800",
  fulfilled: "bg-gray-200 text-gray-700",
  cancelled: "bg-red-100 text-red-800",
  failed: "bg-red-100 text-red-800",
};

export default async function AdminDashboard() {
  const [productCount, orders, paidAgg] = await Promise.all([
    prisma.product.count(),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
    prisma.order.aggregate({
      where: { status: "paid" },
      _sum: { total: true },
      _count: true,
    }),
  ]);

  const stats = [
    { label: "Products", value: String(productCount) },
    { label: "Paid orders", value: String(paidAgg._count) },
    { label: "Revenue (paid)", value: formatNaira(paidAgg._sum.total ?? 0) },
  ];

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="card p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink/50">{s.label}</p>
            <p className="mt-2 text-2xl font-extrabold">{s.value}</p>
          </div>
        ))}
      </div>

      <h2 className="mb-4 mt-10 text-sm font-bold uppercase tracking-wide">Recent orders</h2>
      {orders.length === 0 ? (
        <p className="text-sm text-ink/50">No orders yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead>
              <tr className="border-b border-ink/10 text-xs uppercase text-ink/50">
                <th className="py-3">Ref</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-ink/5">
                  <td className="py-3 font-mono text-xs">{o.reference}</td>
                  <td>{o.customerName}</td>
                  <td>{formatNaira(o.total)}</td>
                  <td>
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${STATUS_STYLES[o.status] ?? ""}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="text-xs text-ink/50">{o.createdAt.toLocaleDateString("en-NG")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Link href="/admin/orders" className="mt-4 inline-block text-xs underline hover:text-accent">
        View all orders →
      </Link>
    </div>
  );
}
