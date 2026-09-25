/**
 * ── Lisa brand config ────────────────────────────────────────────────────────
 * Single source of truth for brand-wide copy and identifiers.
 * Nothing else in the codebase should hardcode the store name — change it here
 * (or set NEXT_PUBLIC_SITE_NAME) and the whole storefront follows.
 *
 * Customer-facing settings that the client may want to edit without a deploy
 * (WhatsApp number, announcement, address) live in the
 * database and are read through `@/lib/settings`. The values below are the
 * fallbacks used before anything is saved in Admin → Settings.
 */
export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || "Lisa";

/** Short descriptor used in the document title, e.g. "Lisa — Ties & Scarves". */
export const SITE_TAGLINE = "Ties & Scarves";

export const SITE_DESCRIPTION =
  "Lisa is an Abuja-based label making silk ties, wool blends, scarves and pocket squares — hand-finished in small batches and delivered nationwide. Order on WhatsApp.";

export const SITE_ADDRESS = "Abuja, Nigeria";

/** Prefix for order references (e.g. LSA-1727780000000-A1B2C). */
export const ORDER_REFERENCE_PREFIX = "LSA";

/** localStorage key for the guest cart. */
export const CART_STORAGE_KEY = "lisa-cart-v1";

/** Public site origin — used for metadata, canonicals, sitemap and OG tags. */
export function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}
