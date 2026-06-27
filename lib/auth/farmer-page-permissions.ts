import { getEffectiveRole, roleHasPermission } from "@/lib/auth/authorization";
import { getServerSession } from "@/lib/auth/session";

export async function getFarmerDetailPermissions(
  session: NonNullable<Awaited<ReturnType<typeof getServerSession>>>,
) {
  const role = getEffectiveRole(session);

  const [canWriteMaster, canReadRequisitions, canReadDispatches, canReadTransfer] =
    await Promise.all([
      roleHasPermission(role, "master", "write"),
      roleHasPermission(role, "requisition", "read"),
      roleHasPermission(role, "dispatch", "read"),
      roleHasPermission(role, "transfer", "read"),
    ]);

  return {
    canWriteMaster,
    canReadRequisitions,
    canReadDispatches,
    canReadTransfer,
  };
}
