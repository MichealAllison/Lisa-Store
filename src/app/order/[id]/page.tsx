import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSettings, formatNaira } from "@/lib/settings";
import { buildOrderMessage, buildWhatsAppUrl } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Order Confirmation",
  robots: { index: false },
};

const STATUS_LABELS: Record<string, string> = {
  pending_whatsapp: "Awaiting WhatsApp confirmation",
  confirmed: "Confirmed",
  fulfilled: "Fulfilled",
  paid: "Paid",
  cancelled: "Cancelled",
  failed: "Failed",
  pending_payment: "Awaiting payment",
};

export default async function OrderPage({
  params,
}: {
  params: { id: string };
}) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { items: true },
  });
  if (!order) notFound();

  const settings = await getSettings();
  // Re-offer the WhatsApp hand-off in case the pop-up was blocked or the
  // customer closed the chat before pressing send.
  const whatsappUrl = settings.whatsappNumber
    ? buildWhatsAppUrl(
        settings.whatsappNumber,
        buildOrderMessage({
          reference: order.reference,
          items: order.items,
          total: order.total,
          customerName: order.customerName,
          customerPhone: order.customerPhone,
          address: order.address,
          customerEmail: order.customerEmail,
        })
      )
    : null;

  const awaitingWhatsApp = order.status === "pending_whatsapp";

  return (
    <div className="container-site max-w-2xl py-16">
      <div className="card p-8 text-center">
        <p className="text-5xl">{awaitingWhatsApp ? "💬" : "✅"}</p>
        <h1 className="mt-4 text-3xl font-extrabold uppercase tracking-tight">
          {awaitingWhatsApp ? "Order received!" : "Order confirmed!"}
        </h1>

        {awaitingWhatsApp ? (
          <p className="mt-3 text-sm text-ink/60">
            Your order is saved. If WhatsApp didn&apos;t open automatically, tap the button below and
            hit <strong>send</strong> so we can confirm stock and delivery.
          </p>
        ) : (
          <p className="mt-3 text-sm text-ink/60">
            We&apos;ll reach out on WhatsApp when your order ships.
          </p>
        )}

        <p className="mt-4 text-xs uppercase tracking-wider text-ink/40">
          Status: {STATUS_LABELS[order.status] ?? order.status}
        </p>
        <p className="mt-2 text-xs uppercase tracking-wider text-ink/40">
          Order ref: <span className="font-mono">{order.reference}</span>
        </p>

        <ul role="list" className="mx-auto mt-8 max-w-sm divide-y divide-ink/10 text-left text-sm">
          {order.items.map((i) => (
            <li key={i.id} className="flex justify-between py-3">
              <span>
                {i.name}
                {i.size && <span className="text-ink/50"> ({i.size})</span>} ×{i.quantity}
              </span>
              <span>{formatNaira(i.price * i.quantity)}</span>
            </li>
          ))}
          <li className="flex justify-between py-3 font-bold">
            <span>Total</span>
            <span>{formatNaira(order.total)}</span>
          </li>
        </ul>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              Open WhatsApp with my order
            </a>
          )}
          <Link href="/shop" className="btn-outline">Keep shopping</Link>
        </div>
      </div>
    </div>
  );
}
