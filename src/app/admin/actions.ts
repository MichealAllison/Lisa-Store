"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-guard";
import { productSchema, categorySchema } from "@/lib/validation";

function slugify(input: string) {
  return input.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export async function saveProduct(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const images = String(formData.get("images") || "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  const sizes = String(formData.get("sizes") || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    slug: slugify(String(formData.get("slug") || formData.get("name") || "")),
    description: formData.get("description") ?? "",
    priceNaira: formData.get("priceNaira"),
    images,
    sizes,
    stock: formData.get("stock"),
    inStock: formData.get("inStock") === "on",
    isNew: formData.get("isNew") === "on",
    categoryId: String(formData.get("categoryId") || "") || null,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const data = parsed.data;

  const dbData = {
    name: data.name,
    slug: data.slug,
    description: data.description,
    price: data.priceNaira * 100,
    images: JSON.stringify(data.images),
    sizes: JSON.stringify(data.sizes),
    stock: data.stock,
    inStock: data.inStock,
    isNew: data.isNew,
    categoryId: data.categoryId,
  };

  if (id) {
    await prisma.product.update({ where: { id }, data: dbData });
  } else {
    const existing = await prisma.product.findUnique({ where: { slug: data.slug } });
    if (existing) return { error: "A product with this slug already exists" };
    await prisma.product.create({ data: dbData });
  }

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/");
  return { ok: true };
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  // remove order items referencing the product first
  await prisma.orderItem.deleteMany({ where: { productId: id } });
  await prisma.product.delete({ where: { id } });
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/");
}

export async function saveCategory(formData: FormData) {
  await requireAdmin();
  const raw = {
    name: String(formData.get("name") || ""),
    slug: slugify(String(formData.get("slug") || formData.get("name") || "")),
  };
  const parsed = categorySchema.safeParse(raw);
  if (!parsed.success) return;
  const existing = await prisma.category.findUnique({ where: { slug: parsed.data.slug } });
  if (existing) return;
  await prisma.category.create({ data: parsed.data });
  revalidatePath("/admin/categories");
  revalidatePath("/shop");
}

export async function deleteCategory(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  await prisma.category.delete({ where: { id } }).catch(() => {});
  revalidatePath("/admin/categories");
  revalidatePath("/shop");
}

export async function updateOrderStatus(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");
  const allowed = ["paid", "pending_whatsapp", "confirmed", "fulfilled", "cancelled"];
  if (!allowed.includes(status)) return;
  await prisma.order.update({ where: { id }, data: { status } });
  revalidatePath("/admin/orders");
  revalidatePath("/admin");
}
