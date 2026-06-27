import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { notFound } from "next/navigation";
import { getStockTransfer } from "@/app/actions/transfer/stock-transfers";
import { TransferDetailSection } from "@/components/transfer/transfer-detail-section";
import { prefetchTransfer } from "@/lib/query/prefetch-transfer";

type TransferDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function TransferDetailPage({
  params,
}: TransferDetailPageProps) {
  const { id } = await params;

  const result = await getStockTransfer(id);
  if (!result.success) {
    notFound();
  }

  const queryClient = await prefetchTransfer(id);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <TransferDetailSection id={id} />
    </HydrationBoundary>
  );
}
