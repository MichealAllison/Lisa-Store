import { prisma } from "@/lib/db";
import { ProductCard } from "@/components/product-card";
import { getSettings } from "@/lib/settings";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { SITE_NAME } from "@/lib/site";
import Link from "next/link";

export const revalidate = 60;

export default async function HomePage() {
  const [featured, latest, settings] = await Promise.all([
    prisma.product.findMany({
      where: { isNew: true, inStock: true },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
    prisma.product.findMany({
      where: { inStock: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    getSettings(),
  ]);

  const whatsappChatUrl = settings.whatsappNumber
    ? buildWhatsAppUrl(
        settings.whatsappNumber,
        `Hi ${SITE_NAME}! I'd like to ask about your ties and scarves.`
      )
    : null;

  return (
    <div className="container-site py-10">
      <section className="mb-16 text-center">
        <h1 className="mx-auto max-w-2xl text-4xl font-extrabold uppercase leading-tight tracking-tight sm:text-5xl">
          Ties &amp; scarves,
          <br />
          <span className="text-accent">finished by hand.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm text-ink/60">
          Silk twill ties, wool blends, scarves and pocket squares — made in small batches.
          Order straight through WhatsApp.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/shop" className="btn-primary">Shop the collection</Link>
          {whatsappChatUrl && (
            <a
              href={whatsappChatUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline"
            >
              Chat on WhatsApp
            </a>
          )}
        </div>
      </section>

      {featured.length > 0 && (
        <section aria-labelledby="new-heading" className="mb-16">
          <div className="mb-6 flex items-center justify-between">
            <h2 id="new-heading" className="text-xl font-bold uppercase">New arrivals</h2>
            <Link href="/shop" className="text-sm text-ink/60 hover:text-accent">View all →</Link>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {featured.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      <section aria-labelledby="latest-heading">
        <h2 id="latest-heading" className="mb-6 text-xl font-bold uppercase">Our collection</h2>
        {latest.length === 0 ? (
          <p className="py-16 text-center text-sm text-ink/50">
            No products yet — check back soon.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {latest.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>
    </div>
  );
}
