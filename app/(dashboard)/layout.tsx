import { redirect } from "next/navigation";
import { navItems } from "@/components/layout/nav-config";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getEffectiveRole, roleHasPermission } from "@/lib/auth/authorization";
import { getServerSession } from "@/lib/auth/session";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session) {
    redirect("/signin");
  }

  const role = getEffectiveRole(session);
  const navVisibility = Object.fromEntries(
    await Promise.all(
      navItems.map(async (item) => {
        if (!item.requiredAppPermission) {
          return [item.href, true] as const;
        }

        const allowed = await roleHasPermission(
          role,
          item.requiredAppPermission.resource,
          item.requiredAppPermission.action,
        );
        return [item.href, allowed] as const;
      }),
    ),
  );

  return (
    <DashboardShell user={session.user} navVisibility={navVisibility}>
      {children}
    </DashboardShell>
  );
}
