import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout-form";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Checkout",
  description: `Complete your ${SITE_NAME} order on WhatsApp — your cart details are pre-filled for you.`,
  robots: { index: false },
};

export default function CheckoutPage() {
  return (
    <div className="container-site py-10">
      <h1 className="mb-8 text-3xl font-extrabold uppercase tracking-tight">Checkout</h1>
      <CheckoutForm />
    </div>
  );
}
