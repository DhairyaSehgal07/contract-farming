import { redirect } from "next/navigation";
import { PermissionsTabs } from "@/components/permissions/permissions-tabs";
import { canAccessPermissionsSection } from "@/lib/auth/authorization";
import { getServerSession } from "@/lib/auth/session";

export default async function PermissionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();
  if (!session) {
    redirect("/signin");
  }

  const canAccess = await canAccessPermissionsSection(session);
  if (!canAccess) {
    redirect("/");
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-2xl font-medium">Permissions</h1>
        <p className="text-muted-foreground">
          Manage role permissions, users, sessions, and impersonation.
        </p>
      </div>
      <PermissionsTabs />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
