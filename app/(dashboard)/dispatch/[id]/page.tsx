import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { notFound } from "next/navigation";
import { getDispatch } from "@/app/actions/dispatch/dispatches";
import { DispatchDetailSection } from "@/components/dispatch/dispatch-detail-section";
import { getEffectiveRole, roleHasPermission } from "@/lib/auth/authorization";
import { getServerSession } from "@/lib/auth/session";
import { prefetchDispatch } from "@/lib/query/prefetch-dispatch-detail";

type DispatchDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function DispatchDetailPage({
  params,
}: DispatchDetailPageProps) {
  const { id } = await params;
  const session = await getServerSession();

  const canWrite = session
    ? await roleHasPermission(getEffectiveRole(session), "dispatch", "write")
    : false;

  const result = await getDispatch(id);
  if (!result.success) {
    notFound();
  }

  const queryClient = await prefetchDispatch(id);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DispatchDetailSection id={id} canWrite={canWrite} />
    </HydrationBoundary>
  );
}
