import { redirect } from "next/navigation";
import { getSettings, setSetting } from "@/lib/settings";
import { settingsSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

async function saveSettings(formData: FormData) {
  "use server";
  const { requireAdmin } = await import("@/lib/admin-guard");
  await requireAdmin();
  const parsed = settingsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return;
  for (const [key, value] of Object.entries(parsed.data)) {
    await setSetting(key, value);
  }
  redirect("/admin/settings?saved=1");
}

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: { saved?: string };
}) {
  const s = await getSettings();

  const fields: { name: keyof typeof s; label: string; type?: string; hint?: string }[] = [
    { name: "whatsappNumber", label: "WhatsApp number", hint: "International format without +, e.g. 2348057323477" },
    { name: "announcement", label: "Announcement bar text" },
    { name: "twitterUrl", label: "Twitter/X URL" },
    { name: "address", label: "Studio address" },
  ];

  return (
    <div className="max-w-xl">
      <h2 className="mb-6 text-sm font-bold uppercase tracking-wide">Site settings</h2>
      <form action={saveSettings} className="card space-y-5 p-6">
        {fields.map((f) => (
          <div key={f.name}>
            <label htmlFor={f.name} className="label">{f.label}</label>
            <input
              id={f.name}
              name={f.name}
              defaultValue={(s as any)[f.name] ?? ""}
              type={f.type ?? "text"}
              className="input"
            />
            {f.hint && <p className="mt-1 text-[11px] text-ink/40">{f.hint}</p>}
          </div>
        ))}
        <button type="submit" className="btn-primary w-full">Save settings</button>
        {searchParams.saved && (
          <p role="status" className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
            Saved ✓ (changes apply immediately — no redeploy needed)
          </p>
        )}
      </form>
    </div>
  );
}
