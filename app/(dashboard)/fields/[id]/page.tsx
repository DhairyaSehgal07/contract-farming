import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { notFound } from "next/navigation";
import { getFieldDetail } from "@/app/actions/field/field-activities";
import { FieldDetailSection } from "@/components/fields/field-detail-section";
import { getEffectiveRole, roleHasPermission } from "@/lib/auth/authorization";
import { getServerSession } from "@/lib/auth/session";
import { prefetchFieldDetail } from "@/lib/query/prefetch-field";

type FieldDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function FieldDetailPage({ params }: FieldDetailPageProps) {
  const { id } = await params;
  const session = await getServerSession();

  const role = session ? getEffectiveRole(session) : null;
  const canWriteMaster = role
    ? await roleHasPermission(role, "master", "write")
    : false;

  const result = await getFieldDetail(id);
  if (!result.success) {
    notFound();
  }

  const queryClient = await prefetchFieldDetail(id);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <FieldDetailSection id={id} canWriteMaster={canWriteMaster} />
    </HydrationBoundary>
  );
}
