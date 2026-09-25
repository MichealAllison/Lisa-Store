import { Suspense } from "react";
import { LoginForm } from "@/components/admin-login-form";

export const metadata = {
  title: "Admin Login",
  robots: { index: false },
};

export default function AdminLoginPage() {
  return (
    <div className="container-site flex justify-center py-24">
      <Suspense fallback={<p className="text-sm text-ink/50">Loading…</p>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
