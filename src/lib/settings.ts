import { prisma } from "@/lib/db";
import { SITE_ADDRESS } from "@/lib/site";

export type SiteSettings = {
  whatsappNumber: string;
  announcement: string;
  twitterUrl: string;
  address: string;
};

const DEFAULTS: SiteSettings = {
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "",
  announcement: "Free nationwide delivery on orders over ₦50,000",
  twitterUrl: "",
  address: SITE_ADDRESS,
};

export async function getSettings(): Promise<SiteSettings> {
  try {
    const rows = await prisma.setting.findMany();
    const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    return {
      whatsappNumber: map.whatsappNumber ?? DEFAULTS.whatsappNumber,
      announcement: map.announcement ?? DEFAULTS.announcement,
      twitterUrl: map.twitterUrl ?? DEFAULTS.twitterUrl,
      address: map.address ?? DEFAULTS.address,
    };
  } catch {
    return DEFAULTS;
  }
}

export async function setSetting(key: string, value: string) {
  await prisma.setting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}

export function formatNaira(kobo: number): string {
  return `₦${(kobo / 100).toLocaleString("en-NG")}`;
}
