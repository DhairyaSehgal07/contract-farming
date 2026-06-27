import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { TransfersSection } from "@/components/transfer/transfers-section";
import { getEffectiveRole, roleHasPermission } from "@/lib/auth/authorization";
import { getServerSession } from "@/lib/auth/session";
import { prefetchTransferList } from "@/lib/query/prefetch-transfer";

export default async function TransferPage() {
  const session = await getServerSession();
  const canWrite = session
    ? await roleHasPermission(getEffectiveRole(session), "transfer", "write")
    : false;

  const queryClient = await prefetchTransferList();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TransfersSection canWrite={canWrite} />
    </HydrationBoundary>
  );
}
