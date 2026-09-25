import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/** Guard for admin server actions / route handlers. Throws on unauthenticated. */
export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "admin") {
    throw new Error("Unauthorized");
  }
  return session;
}
