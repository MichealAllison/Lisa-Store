import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { checkoutSchema } from "@/lib/validation";
import { buildOrderMessage, buildWhatsAppUrl } from "@/lib/whatsapp";
import { ORDER_REFERENCE_PREFIX } from "@/lib/site";

function generateReference() {
  return `${ORDER_REFERENCE_PREFIX}-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

/**
 * WhatsApp checkout. Persists the order so it shows up in the admin dashboard,
 * then hands back a pre-filled wa.me link that the browser opens.
 * There is no online payment gateway — everything is confirmed over WhatsApp.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }
    const input = parsed.data;
    const settings = await getSettings();
    if (!settings.whatsappNumber) {
      return NextResponse.json({ error: "Store WhatsApp number not configured" }, { status: 500 });
    }

    // Recalculate total from DB prices to avoid client tampering
    let total = 0;
    const itemsData: {
      productId: string;
      name: string;
      size: string | null;
      quantity: number;
      price: number;
    }[] = [];

    for (const item of input.items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product || !product.inStock) {
        return NextResponse.json({ error: `"${item.name}" is no longer available` }, { status: 400 });
      }
      total += product.price * item.quantity;
      itemsData.push({
        productId: product.id,
        name: product.name,
        size: item.size ?? null,
        quantity: item.quantity,
        price: product.price,
      });
    }

    const reference = generateReference();

    const order = await prisma.order.create({
      data: {
        reference,
        status: "pending_whatsapp",
        channel: "whatsapp",
        customerName: input.customerName,
        customerPhone: input.customerPhone,
        customerEmail: input.customerEmail || null,
        address: input.address,
        total,
        items: { create: itemsData },
      },
    });

    const message = buildOrderMessage({
      reference: order.reference,
      items: itemsData,
      total,
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      address: input.address,
      customerEmail: input.customerEmail,
    });

    return NextResponse.json({
      orderId: order.id,
      reference,
      channel: "whatsapp",
      whatsappUrl: buildWhatsAppUrl(settings.whatsappNumber, message),
    });
  } catch (err) {
    console.error("Checkout error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Checkout failed" },
      { status: 500 }
    );
  }
}
