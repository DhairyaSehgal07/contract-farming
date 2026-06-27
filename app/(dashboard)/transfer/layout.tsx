import { redirect } from "next/navigation";
import { getEffectiveRole, roleHasPermission } from "@/lib/auth/authorization";
import { getServerSession } from "@/lib/auth/session";

export default async function TransferLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();
  if (!session) {
    redirect("/signin");
  }

  const canAccess = await roleHasPermission(
    getEffectiveRole(session),
    "transfer",
    "read",
  );
  if (!canAccess) {
    redirect("/");
  }

  return <div className="min-w-0">{children}</div>;
}
