import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { AdminNav, LogoutButton } from "@/components/admin-nav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) {
    // middleware normally handles this; belt-and-braces for direct renders
    return <>{children}</>;
  }

  return (
    <div className="container-site py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-lg font-extrabold uppercase tracking-tight">
          Admin<span className="text-accent">.</span>
        </h1>
        <LogoutButton />
      </div>
      <AdminNav />
      <div className="pt-8">{children}</div>
    </div>
  );
}
