"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveProduct } from "@/app/admin/actions";

export type ProductFormValues = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  priceNaira: number;
  imagesText: string;
  sizesText: string;
  stock: number;
  inStock: boolean;
  isNew: boolean;
  categoryId: string;
};

export function ProductForm({
  initial = {},
  categories,
}: {
  initial?: Partial<ProductFormValues>;
  categories: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      const ta = document.getElementById("images") as HTMLTextAreaElement | null;
      if (ta) ta.value = (ta.value ? ta.value + "\n" : "") + data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await saveProduct(new FormData(e.currentTarget));
    if (res?.error) {
      setError(res.error);
      setSaving(false);
      return;
    }
    router.push("/admin/products");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-5">
      <input type="hidden" name="id" value={initial.id ?? ""} />
      <div>
        <label htmlFor="name" className="label">Name *</label>
        <input id="name" name="name" required defaultValue={initial.name} className="input" />
      </div>
      <div>
        <label htmlFor="slug" className="label">Slug (auto from name if blank)</label>
        <input id="slug" name="slug" defaultValue={initial.slug} className="input" placeholder="silk-twill-tie-onyx" />
      </div>
      <div>
        <label htmlFor="description" className="label">Description</label>
        <textarea id="description" name="description" rows={4} defaultValue={initial.description} className="input" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="priceNaira" className="label">Price (₦) *</label>
          <input id="priceNaira" name="priceNaira" type="number" min={1} required
            defaultValue={initial.priceNaira} className="input" />
        </div>
        <div>
          <label htmlFor="stock" className="label">Stock quantity</label>
          <input id="stock" name="stock" type="number" min={0} defaultValue={initial.stock ?? 0} className="input" />
        </div>
      </div>
      <div>
        <label htmlFor="sizes" className="label">Sizes / variants (comma separated)</label>
        <input id="sizes" name="sizes" defaultValue={initial.sizesText} className="input" placeholder="S, M, L, XL" />
      </div>
      <div>
        <label htmlFor="categoryId" className="label">Category</label>
        <select id="categoryId" name="categoryId" defaultValue={initial.categoryId ?? ""} className="input">
          <option value="">— None —</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="images" className="label">Image URLs (one per line)</label>
        <textarea id="images" name="images" rows={3} required defaultValue={initial.imagesText}
          className="input font-mono text-xs"
          placeholder="/uploads/xxx.jpg or https://…" />
        <div className="mt-2 flex items-center gap-3 text-xs text-ink/50">
          <span>…or upload a photo:</span>
          <input type="file" accept="image/*" onChange={handleUpload} className="text-xs" disabled={uploading} />
          {uploading && <span>Uploading…</span>}
        </div>
      </div>
      <div className="flex gap-6 text-sm">
        <label className="flex items-center gap-2">
          <input type="checkbox" name="inStock" defaultChecked={initial.inStock ?? true} /> In stock
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" name="isNew" defaultChecked={initial.isNew ?? false} /> Flag as New
        </label>
      </div>

      {error && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <button type="submit" disabled={saving} className="btn-primary w-full">
        {saving ? "Saving…" : "Save product"}
      </button>
    </form>
  );
}
