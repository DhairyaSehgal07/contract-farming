import { RequisitionsSection } from "@/components/requisition/requisitions-section";
import { getEffectiveRole, roleHasPermission } from "@/lib/auth/authorization";
import { getServerSession } from "@/lib/auth/session";

export default async function RequisitionPage() {
  const session = await getServerSession();
  const canApprove = session
    ? await roleHasPermission(
        getEffectiveRole(session),
        "requisition",
        "approve",
      )
    : false;

  return <RequisitionsSection canApprove={canApprove} />;
}
