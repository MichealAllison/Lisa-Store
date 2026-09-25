import type { Metadata } from "next";
import { getSettings } from "@/lib/settings";
import { SITE_NAME } from "@/lib/site";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Contact",
  description: `Reach ${SITE_NAME} on WhatsApp. Based in Abuja, delivering nationwide.`,
  alternates: { canonical: "/contact" },
  openGraph: { title: `Contact ${SITE_NAME}` },
};

export default async function ContactPage() {
  const settings = await getSettings();
  return (
    <div className="container-site py-16">
      <h1 className="text-center text-4xl font-extrabold uppercase tracking-tight">
        Contact<span className="text-accent">.</span>
      </h1>
      <p className="mx-auto mt-4 max-w-md text-center text-sm text-ink/60">
        Questions about sizing, delivery or an order? The fastest way to reach us is WhatsApp.
      </p>

      <dl className="mx-auto mt-12 grid max-w-xl gap-4 text-sm sm:grid-cols-2">
        <div className="card p-6">
          <dt className="label">WhatsApp</dt>
          <dd>
            <a href={`https://wa.me/${settings.whatsappNumber}`} className="font-semibold hover:text-accent">
              +{settings.whatsappNumber}
            </a>
          </dd>
        </div>
        <div className="card p-6">
          <dt className="label">Studio</dt>
          <dd className="font-semibold">{settings.address}</dd>
        </div>
      </dl>
    </div>
  );
}
