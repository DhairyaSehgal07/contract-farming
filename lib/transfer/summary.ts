export function getTransfersSummary(
  rows: Array<{ totalQuantity: string }>,
) {
  let totalBags = 0;

  for (const row of rows) {
    const quantity = Number.parseFloat(row.totalQuantity);
    if (Number.isFinite(quantity)) {
      totalBags += quantity;
    }
  }

  return {
    total: rows.length,
    totalBags,
  };
}
