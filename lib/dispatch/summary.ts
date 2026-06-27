export function getDispatchesSummary(
  rows: Array<{
    status: "OPEN" | "CLOSED";
    lotsReceived: number;
    lotsTotal: number;
  }>,
) {
  let openCount = 0;
  let closedCount = 0;
  let lotsPendingReceipt = 0;
  let openWithPendingLots = 0;

  for (const row of rows) {
    if (row.status === "OPEN") {
      openCount += 1;
      const pending = row.lotsTotal - row.lotsReceived;
      if (pending > 0) {
        lotsPendingReceipt += pending;
        openWithPendingLots += 1;
      }
    } else {
      closedCount += 1;
    }
  }

  return {
    total: rows.length,
    openCount,
    closedCount,
    lotsPendingReceipt,
    openWithPendingLots,
  };
}
