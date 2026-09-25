import Link from "next/link";
import { SITE_NAME } from "@/lib/site";

/**
 * Text wordmark used in the header and footer while there is no logo asset yet.
 *
 * TO SWAP IN A REAL LOGO later:
 *   1. Drop the file in /public (e.g. /public/logo.svg)
 *   2. Replace the <span> below with:
 *        <Image src="/logo.svg" alt={SITE_NAME} width={140} height={32} className="h-8 w-auto" />
 *      and add `import Image from "next/image";`
 * That is the only change needed — the header and footer both render <Wordmark />.
 */
export function Wordmark({ size = "md" }: { size?: "md" | "lg" }) {
  const text = size === "lg" ? "text-3xl" : "text-2xl";
  return (
    <Link
      href="/"
      aria-label={`${SITE_NAME} — home`}
      className="inline-flex items-baseline gap-2 focus-visible:outline-none"
    >
      <span className={`${text} font-extrabold uppercase leading-none tracking-[0.18em]`}>
        {SITE_NAME}
      </span>
      <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
    </Link>
  );
}
