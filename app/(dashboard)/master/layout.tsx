import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { redirect } from "next/navigation";
import { MasterTabs } from "@/components/master/master-tabs";
import { getEffectiveRole, roleHasPermission } from "@/lib/auth/authorization";
import { getServerSession } from "@/lib/auth/session";

export default async function MasterLayout({
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
    "master",
    "read",
  );
  if (!canAccess) {
    redirect("/");
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-2xl font-medium">Master data</h1>
        <p className="text-muted-foreground">
          Manage stations, farmers, and product reference data.
        </p>
      </div>
      <MasterTabs />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
