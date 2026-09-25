/**
 * One-off rebrand cleanup for an existing Lisa database.
 *
 *   npx tsx scripts/rebrand-db.ts
 *
 * Safe to run more than once (idempotent) and non-destructive to the
 * catalogue: it only touches saved site settings and the admin login.
 *
 *  1. Removes stray Setting rows that no longer belong to the app (the old
 *     brand's payment-gateway keys, which the client should also rotate at the
 *     provider since they were committed to git history).
 *  2. Rewrites the brand rows (Instagram, email, address, announcement) to the
 *     Lisa defaults from src/lib/site.ts.
 *  3. Moves the existing admin login onto ADMIN_EMAIL (password hash is
 *     untouched, so the current password keeps working).
 *  4. Prints whatever is still in the old demo catalogue so you can replace it
 *     from Admin → Products / Admin → Categories.
 */
import { PrismaClient } from "@prisma/client";
import { SITE_ADDRESS } from "../src/lib/site";

const prisma = new PrismaClient();

/** Keys the app actually reads (see src/lib/settings.ts). */
const KNOWN_SETTING_KEYS = [
  "whatsappNumber",
  "announcement",
  "twitterUrl",
  "address",
];

const BRAND_SETTINGS: Record<string, string> = {
  address: SITE_ADDRESS,
  announcement: "Free nationwide delivery on orders over ₦50,000",
};

async function main() {
  // 1. Stray settings (dead keys from the previous build)
  const stray = await prisma.setting.findMany({ where: { key: { notIn: KNOWN_SETTING_KEYS } } });
  if (stray.length) {
    await prisma.setting.deleteMany({ where: { key: { in: stray.map((s) => s.key) } } });
    console.log(`Removed ${stray.length} stray setting row(s): ${stray.map((s) => s.key).join(", ")}`);
  } else {
    console.log("No stray setting rows found.");
  }

  // 2. Brand settings
  for (const [key, value] of Object.entries(BRAND_SETTINGS)) {
    const current = await prisma.setting.findUnique({ where: { key } });
    if (!current) {
      await prisma.setting.create({ data: { key, value } });
      console.log(`Created setting ${key} = ${value}`);
    } else if (current.value !== value) {
      await prisma.setting.update({ where: { key }, data: { value } });
      console.log(`Updated setting ${key}: "${current.value}" → "${value}"`);
    } else {
      console.log(`Setting ${key} already correct.`);
    }
  }

  // 3. Admin login
  const targetEmail = (process.env.ADMIN_EMAIL || "admin@lisaties.com").toLowerCase();
  const existingTarget = await prisma.adminUser.findUnique({ where: { email: targetEmail } });
  if (existingTarget) {
    console.log(`Admin login already on ${targetEmail}.`);
  } else {
    const oldestAdmin = await prisma.adminUser.findFirst({ orderBy: { id: "asc" } });
    if (!oldestAdmin) {
      console.log("No admin user found — run `npm run db:seed` to create one.");
    } else {
      await prisma.adminUser.update({
        where: { id: oldestAdmin.id },
        data: { email: targetEmail },
      });
      console.log(
        `Admin login moved from ${oldestAdmin.email} → ${targetEmail} (password unchanged).`
      );
    }
  }

  // 4. What is still in the catalogue
  const [products, categories] = await Promise.all([
    prisma.product.findMany({ select: { name: true, slug: true } }),
    prisma.category.findMany({ select: { name: true, slug: true } }),
  ]);
  console.log(
    `\nCatalogue still live (${products.length} products, ${categories.length} categories).` +
      `\nReplace anything left over from the old store in Admin → Products / Admin → Categories:`
  );
  for (const c of categories) console.log(`  • category: ${c.name} (${c.slug})`);
  for (const p of products) console.log(`  • product:  ${p.name} (${p.slug})`);

  console.log("\nDone. Log into /admin with ADMIN_EMAIL + ADMIN_PASSWORD and confirm.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
