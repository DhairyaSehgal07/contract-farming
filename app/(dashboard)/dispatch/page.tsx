import { DispatchesSection } from "@/components/dispatch/dispatches-section";
import { getEffectiveRole, roleHasPermission } from "@/lib/auth/authorization";
import { getServerSession } from "@/lib/auth/session";

export default async function DispatchPage() {
  const session = await getServerSession();
  const canWrite = session
    ? await roleHasPermission(getEffectiveRole(session), "dispatch", "write")
    : false;

  return <DispatchesSection canWrite={canWrite} />;
}
