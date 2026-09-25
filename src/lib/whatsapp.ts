import { formatNaira } from "@/lib/settings";
import { SITE_NAME } from "@/lib/site";

export type WhatsAppOrderItem = {
  name: string;
  size?: string | null;
  quantity: number;
  price: number; // unit price in kobo
};

export type WhatsAppOrderDetails = {
  reference: string;
  items: WhatsAppOrderItem[];
  total: number; // kobo
  customerName: string;
  customerPhone: string;
  address: string;
  customerEmail?: string | null;
};

/**
 * The message pre-filled into the WhatsApp chat. This is the *only* checkout
 * path, so it carries everything the shop needs to fulfil the order.
 */
export function buildOrderMessage(order: WhatsAppOrderDetails): string {
  const lines = order.items
    .map(
      (item) =>
        `• ${item.name}${item.size ? ` (${item.size})` : ""} ×${item.quantity} — ${formatNaira(
          item.price * item.quantity
        )}`
    )
    .join("\n");

  return (
    `Hi ${SITE_NAME}! 👋 I'd like to place an order.\n\n` +
    `Order ref: ${order.reference}\n\n` +
    `${lines}\n\n` +
    `Total: ${formatNaira(order.total)}\n\n` +
    `Name: ${order.customerName}\n` +
    `Phone: ${order.customerPhone}\n` +
    (order.customerEmail ? `Email: ${order.customerEmail}\n` : "") +
    `Delivery address: ${order.address}`
  );
}

/** Builds the wa.me deep link that opens WhatsApp with the order pre-filled. */
export function buildWhatsAppUrl(number: string, message: string): string {
  const digits = number.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}
