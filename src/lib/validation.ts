import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(1, "Name is required").max(120),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, hyphens"),
  description: z.string().max(5000).default(""),
  priceNaira: z.coerce.number().int().positive("Price must be positive"),
  images: z.array(z.string().url()).min(1, "At least one image is required"),
  sizes: z.array(z.string()).default([]),
  stock: z.coerce.number().int().min(0).default(0),
  inStock: z.boolean().default(true),
  isNew: z.boolean().default(false),
  categoryId: z.string().optional().nullable(),
});
export type ProductInput = z.infer<typeof productSchema>;

export const categorySchema = z.object({
  name: z.string().min(1).max(60),
  slug: z.string().regex(/^[a-z0-9-]+$/),
});

export const checkoutSchema = z.object({
  customerName: z.string().min(2, "Full name is required"),
  customerPhone: z
    .string()
    .regex(/^(\+?234|0)[789][01]\d{8}$/, "Enter a valid Nigerian phone number"),
  customerEmail: z.union([z.literal(""), z.string().email("Invalid email")]).optional(),
  address: z.string().min(5, "Delivery address is required"),
  items: z
    .array(
      z.object({
        productId: z.string(),
        name: z.string(),
        size: z.string().nullable().optional(),
        quantity: z.number().int().min(1).max(50),
        price: z.number().int().positive(), // kobo
      })
    )
    .min(1, "Cart is empty"),
});
export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const settingsSchema = z.object({
  whatsappNumber: z.string().min(7),
  announcement: z.string().max(200),
  twitterUrl: z.string(),
  address: z.string(),
});
