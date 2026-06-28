import type { FarmerStockRow } from "@/app/actions/transfer/stock-transfers";

type StockBalanceRow = {
  varietyId: string;
  variety: { id: string; name: string };
  sizeId: string;
  size: { id: string; name: string };
  generationId: string;
  generation: { id: string; name: string };
  quantity: string | number | { toString(): string };
};

function stockLineKey(row: StockBalanceRow) {
  return `${row.varietyId}:${row.sizeId}:${row.generationId}`;
}

export function aggregateFamilyStock(
  rows: ReadonlyArray<StockBalanceRow>,
): FarmerStockRow[] {
  const totals = new Map<string, FarmerStockRow>();

  for (const row of rows) {
    const key = stockLineKey(row);
    const quantity = Number.parseFloat(row.quantity.toString());
    if (quantity <= 0) continue;

    const existing = totals.get(key);
    if (existing) {
      const nextQuantity =
        Number.parseFloat(existing.quantity) + quantity;
      totals.set(key, {
        ...existing,
        quantity: nextQuantity.toString(),
      });
      continue;
    }

    totals.set(key, {
      varietyId: row.varietyId,
      variety: row.variety,
      sizeId: row.sizeId,
      size: row.size,
      generationId: row.generationId,
      generation: row.generation,
      quantity: quantity.toString(),
    });
  }

  return [...totals.values()].sort((left, right) => {
    const varietyCompare = left.variety.name.localeCompare(right.variety.name);
    if (varietyCompare !== 0) return varietyCompare;

    const sizeCompare = left.size.name.localeCompare(right.size.name);
    if (sizeCompare !== 0) return sizeCompare;

    return left.generation.name.localeCompare(right.generation.name);
  });
}
