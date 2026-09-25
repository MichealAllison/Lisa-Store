import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { SITE_ADDRESS } from "../src/lib/site";

const prisma = new PrismaClient();

/**
 * Demo product imagery. These are placeholders so the seeded catalogue renders
 * on a clean install — upload the real photos in Admin → Products (they are
 * stored on Cloudinary, or locally in /public/uploads in development).
 */
const placeholder = (text: string) =>
  `https://placehold.co/900x1125/ffffff/ff2d87/png?text=${text}`;

const products = [
  {
    name: "Silk Twill Tie — Onyx",
    slug: "silk-twill-tie-onyx",
    description:
      "Hand-rolled silk twill tie in deep onyx. 8cm blade, keeps its shape after a full day of wear and takes a clean four-in-hand knot.",
    price: 18000,
    sizes: ["Standard (150cm)", "Extra long (160cm)"],
    stock: 42,
    isNew: true,
    category: "ties",
    images: [placeholder("Silk+Twill+Tie+Onyx"), placeholder("Silk+Twill+Tie+Onyx+Detail")],
  },
  {
    name: "Herringbone Wool Tie — Slate",
    slug: "herringbone-wool-tie-slate",
    description:
      "Woven wool herringbone in slate grey. Matte finish, ideal for boardroom days and cooler weather.",
    price: 22000,
    sizes: ["Standard (150cm)"],
    stock: 15,
    isNew: true,
    category: "ties",
    images: [placeholder("Herringbone+Wool+Tie+Slate")],
  },
  {
    name: "Cashmere Blend Scarf — Ivory",
    slug: "cashmere-blend-scarf-ivory",
    description:
      "Soft cashmere-blend scarf with hand-knotted fringing. Warm without the bulk — sizes generously so it drapes well.",
    price: 35000,
    sizes: ["One size"],
    stock: 23,
    isNew: false,
    category: "scarves",
    images: [placeholder("Cashmere+Scarf+Ivory")],
  },
  {
    name: "Silk Square Scarf — Magenta Bloom",
    slug: "silk-square-scarf-magenta-bloom",
    description:
      "90cm silk square printed in the house magenta bloom motif. Wear it at the neck, in a pocket or tied to a bag.",
    price: 28000,
    sizes: ["90 x 90cm"],
    stock: 30,
    isNew: true,
    category: "scarves",
    images: [placeholder("Silk+Square+Scarf+Magenta")],
  },
  {
    name: "Linen Pocket Square — Blush",
    slug: "linen-pocket-square-blush",
    description:
      "Hand-rolled linen pocket square in blush. Softens a dark suit without competing with your tie.",
    price: 9000,
    sizes: ["One size"],
    stock: 48,
    isNew: false,
    category: "pocket-squares",
    images: [placeholder("Linen+Pocket+Square+Blush")],
  },
  {
    name: "The Gift Set — Tie & Pocket Square",
    slug: "gift-set-tie-pocket-square",
    description:
      "A silk twill tie paired with a matching pocket square, boxed and ribboned. Our most-gifted set.",
    price: 45000,
    sizes: ["Standard (150cm)"],
    stock: 12,
    isNew: true,
    category: "gift-sets",
    images: [placeholder("Tie+and+Pocket+Square+Gift+Set")],
  },
];

const categories = [
  { name: "Ties", slug: "ties" },
  { name: "Scarves", slug: "scarves" },
  { name: "Pocket Squares", slug: "pocket-squares" },
  { name: "Gift Sets", slug: "gift-sets" },
];

async function main() {
  console.log("Seeding database...");

  const adminEmail = (process.env.ADMIN_EMAIL || "admin@lisaties.com").toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash: await bcrypt.hash(adminPassword, 10),
    },
  });
  console.log(`Admin created: ${adminEmail} / ${adminPassword}`);

  await prisma.setting.upsert({ where: { key: "whatsappNumber" }, update: {}, create: { key: "whatsappNumber", value: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "2348057323477" } });
  await prisma.setting.upsert({ where: { key: "announcement" }, update: {}, create: { key: "announcement", value: "Free nationwide delivery on orders over ₦50,000" } });
  await prisma.setting.upsert({ where: { key: "address" }, update: {}, create: { key: "address", value: SITE_ADDRESS } });

  for (const c of categories) {
    await prisma.category.upsert({ where: { slug: c.slug }, update: {}, create: c });
  }

  for (const p of products) {
    const cat = await prisma.category.findUnique({ where: { slug: p.category } });
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: Math.round(p.price * 100), // kobo
        images: JSON.stringify(p.images),
        sizes: JSON.stringify(p.sizes),
        stock: p.stock,
        isNew: p.isNew,
        categoryId: cat?.id,
      },
    });
  }

  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
