import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { redirect } from "next/navigation";
import { TransferCreateForm } from "@/components/transfer/transfer-create-form";
import { getEffectiveRole, roleHasPermission } from "@/lib/auth/authorization";
import { getServerSession } from "@/lib/auth/session";
import { prefetchTransferCreate } from "@/lib/query/prefetch-transfer";

export default async function NewTransferPage() {
  const session = await getServerSession();
  if (!session) {
    redirect("/signin");
  }

  const canWrite = await roleHasPermission(
    getEffectiveRole(session),
    "transfer",
    "write",
  );
  if (!canWrite) {
    redirect("/transfer");
  }

  const queryClient = await prefetchTransferCreate();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TransferCreateForm />
    </HydrationBoundary>
  );
}
