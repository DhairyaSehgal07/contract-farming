import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getEffectiveRole } from "@/lib/auth/authorization";
import { getVisibleNavHrefs } from "@/lib/auth/nav-visibility";
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
  const visibleNavHrefs = await getVisibleNavHrefs(role);

  return (
    <DashboardShell user={session.user} visibleNavHrefs={visibleNavHrefs}>
      {children}
    </DashboardShell>
  );
}
