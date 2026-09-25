import Link from "next/link";
import type { SiteSettings } from "@/lib/settings";
import { SITE_NAME } from "@/lib/site";
import { Wordmark } from "@/components/wordmark";

export function Footer({ settings }: { settings: SiteSettings }) {
  return (
    <footer className="mt-24 border-t border-ink/10 bg-white">
      <div className="container-site flex flex-col gap-8 py-12 md:flex-row md:items-start md:justify-between">
        <div>
          <Wordmark />
          <p className="mt-3 max-w-xs text-sm text-ink/60">{settings.address}</p>
        </div>
        <nav aria-label="Footer" className="flex flex-col gap-3 text-sm">
          <Link href="/shop" className="hover:text-accent">Shop</Link>
          <Link href="/contact" className="hover:text-accent">Contact</Link>
        </nav>
        <div className="flex flex-col gap-3 text-sm">
          {settings.twitterUrl && (
            <a href={settings.twitterUrl} target="_blank" rel="noopener noreferrer" className="hover:text-accent">
              Twitter/X ↗
            </a>
          )}
          {settings.whatsappNumber && (
            <a href={`https://wa.me/${settings.whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="hover:text-accent">
              WhatsApp ↗
            </a>
          )}
        </div>
      </div>
      <div className="container-site border-t border-ink/5 py-6 text-xs text-ink/50">
        © {new Date().getFullYear()} {SITE_NAME}. All rights reserved. Abuja, Nigeria.
      </div>
    </footer>
  );
}
