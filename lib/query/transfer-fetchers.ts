import {
  createStockTransfer,
  getStockTransfer,
  listFarmerStock,
  listStockTransfers,
  listTransferableFarmers,
  listTransferDestinationFarmers,
} from "@/app/actions/transfer/stock-transfers";

async function unwrap<T>(
  promise: Promise<
    { success: true; data: T } | { success: false; error: string }
  >,
) {
  const result = await promise;
  if (!result.success) {
    throw new Error(result.error);
  }
  return result.data;
}

export async function fetchStockTransfers() {
  return unwrap(listStockTransfers());
}

export async function fetchStockTransfer(id: string) {
  return unwrap(getStockTransfer(id));
}

export async function fetchTransferableFarmers() {
  return unwrap(listTransferableFarmers());
}

export async function fetchTransferDestinationFarmers(
  excludeFarmerId?: string,
) {
  return unwrap(listTransferDestinationFarmers(excludeFarmerId));
}

export async function fetchFarmerStock(farmerId: string) {
  return unwrap(listFarmerStock(farmerId));
}

export { createStockTransfer };
