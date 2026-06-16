import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { redirect } from "next/navigation";
import { DispatchCreateForm } from "@/components/dispatch/dispatch-create-form";
import { getEffectiveRole, roleHasPermission } from "@/lib/auth/authorization";
import { getServerSession } from "@/lib/auth/session";
import { prefetchDispatchCreate } from "@/lib/query/prefetch-dispatch";

export default async function NewDispatchPage() {
  const session = await getServerSession();
  if (!session) {
    redirect("/signin");
  }

  const canWrite = await roleHasPermission(
    getEffectiveRole(session),
    "dispatch",
    "write",
  );
  if (!canWrite) {
    redirect("/");
  }

  const queryClient = await prefetchDispatchCreate();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DispatchCreateForm />
    </HydrationBoundary>
  );
}
