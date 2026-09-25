import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatNaira } from "@/lib/settings";
import { SITE_NAME } from "@/lib/site";
import { updateOrderStatus } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

const STATUSES = ["all", "paid", "pending_whatsapp", "confirmed", "fulfilled", "cancelled"];

/** Orders always arrive through WhatsApp; older rows may predate that. */
const CHANNEL_LABELS: Record<string, string> = {
  whatsapp: "WhatsApp",
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const status = searchParams.status && STATUSES.includes(searchParams.status) ? searchParams.status : "all";
  const orders = await prisma.order.findMany({
    where: status === "all" ? {} : { status },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return (
    <div>
      <h2 className="mb-4 text-sm font-bold uppercase tracking-wide">Orders</h2>

      <nav aria-label="Filter orders" className="mb-6 flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/orders${s === "all" ? "" : `?status=${s}`}`}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold ${
              s === status ? "bg-ink text-white" : "border border-ink/20 hover:border-ink"
            }`}
          >
            {s.replace("_", " ")}
          </Link>
        ))}
      </nav>

      {orders.length === 0 ? (
        <p className="text-sm text-ink/50">No orders with this status.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-xs text-ink/50">{o.reference}</p>
                  <p className="mt-1 font-bold">{o.customerName} · {formatNaira(o.total)}</p>
                  <p className="text-xs text-ink/60">
                    {o.customerPhone}
                    {o.customerEmail ? ` · ${o.customerEmail}` : ""} · {o.address}
                  </p>
                  <p className="mt-1 text-xs text-ink/50">
                    Via {CHANNEL_LABELS[o.channel] ?? "Website"} ·{" "}
                    {o.createdAt.toLocaleString("en-NG")}
                  </p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                  o.status === "paid" ? "bg-green-100 text-green-800" :
                  o.status === "pending_whatsapp" ? "bg-yellow-100 text-yellow-800" :
                  o.status === "confirmed" ? "bg-purple-100 text-purple-800" :
                  o.status === "fulfilled" ? "bg-gray-200 text-gray-700" :
                  o.status === "cancelled" || o.status === "failed" ? "bg-red-100 text-red-800" :
                  "bg-blue-100 text-blue-800"
                }`}>
                  {o.status.replace("_", " ")}
                </span>
              </div>

              <ul className="mt-3 border-t border-ink/10 pt-3 text-xs text-ink/70">
                {o.items.map((i) => (
                  <li key={i.id}>
                    {i.name}{i.size ? ` (${i.size})` : ""} ×{i.quantity}
                  </li>
                ))}
              </ul>

              {(o.channel === "whatsapp" || o.status === "confirmed") && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {o.status === "pending_whatsapp" && (
                    <form action={updateOrderStatus}>
                      <input type="hidden" name="id" value={o.id} />
                      <input type="hidden" name="status" value="confirmed" />
                      <button className="btn-primary !px-4 !py-1.5 text-xs">Mark confirmed</button>
                    </form>
                  )}
                  {o.status !== "fulfilled" && (
                    <form action={updateOrderStatus}>
                      <input type="hidden" name="id" value={o.id} />
                      <input type="hidden" name="status" value="fulfilled" />
                      <button className="btn-outline !px-4 !py-1.5 text-xs">Mark fulfilled</button>
                    </form>
                  )}
                  <a
                    href={`https://wa.me/${o.customerPhone.replace(/^0/, "234").replace(/\D/g, "")}?text=${encodeURIComponent(`Hi ${o.customerName}, about your ${SITE_NAME} order ${o.reference}…`)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="btn-accent !px-4 !py-1.5 text-xs"
                  >
                    WhatsApp customer
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
