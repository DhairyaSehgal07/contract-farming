type RequisitionQuantityFields = {
  acres: string | null;
  initialQuantity: string | null;
  fulfilledQuantity?: string | null;
  fulfilledAcres?: string | null;
};

type SizeWithStandard = {
  id: string;
  bagsPerAcre: number | null;
};

function parseNonNegativeNumber(value: string | null | undefined) {
  if (!value?.trim()) return null;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function parsePositiveNumber(value: string | null | undefined) {
  if (!value?.trim()) return null;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function isAcresBasedRequisition(requisition: RequisitionQuantityFields) {
  return (
    parsePositiveNumber(requisition.acres) !== null &&
    parsePositiveNumber(requisition.initialQuantity) === null
  );
}

export function isBagsBasedRequisition(requisition: RequisitionQuantityFields) {
  return (
    parsePositiveNumber(requisition.initialQuantity) !== null &&
    parsePositiveNumber(requisition.acres) === null
  );
}

export function calculateBagsFromAcres(acres: number, bagsPerAcre: number) {
  return Math.round(acres * bagsPerAcre);
}

export function calculateAcresFromBags(bags: number, bagsPerAcre: number) {
  if (bagsPerAcre <= 0) return null;
  return bags / bagsPerAcre;
}

export const ACRES_DISPATCH_OVERAGE_TOLERANCE = 0.5;

export function isAcresDispatchWithinTolerance(
  acresConsumed: number | null,
  remainingAcres: number | null,
): boolean {
  if (acresConsumed === null || remainingAcres === null) return false;
  if (remainingAcres <= 0) return false;
  return acresConsumed <= remainingAcres + ACRES_DISPATCH_OVERAGE_TOLERANCE;
}

export function getAcresDispatchCredit(
  acresConsumed: number,
  remainingAcres: number,
): number {
  return Math.min(acresConsumed, Math.max(0, remainingAcres));
}

function roundAcres(value: number) {
  return Math.round(value * 100) / 100;
}

export function getAcresDispatchDebit(
  acresFromBags: number,
  currentFulfilledAcres: number,
  orderedAcres: number,
): number {
  const roundedFulfilled = roundAcres(currentFulfilledAcres);
  const roundedOrdered = roundAcres(orderedAcres);
  const remainingIfFullRevert = roundAcres(
    Math.max(0, roundedOrdered - roundAcres(roundedFulfilled - acresFromBags)),
  );

  if (remainingIfFullRevert > acresFromBags) {
    return acresFromBags;
  }

  let fulfilledBefore = roundAcres(roundedFulfilled - acresFromBags);

  for (let i = 0; i < 8; i++) {
    const remainingBefore = roundAcres(roundedOrdered - fulfilledBefore);
    const credit = getAcresDispatchCredit(acresFromBags, remainingBefore);
    const nextFulfilledBefore = roundAcres(roundedFulfilled - credit);

    if (Math.abs(nextFulfilledBefore - fulfilledBefore) < 0.005) {
      return credit;
    }

    fulfilledBefore = nextFulfilledBefore;
  }

  return getAcresDispatchCredit(acresFromBags, remainingIfFullRevert);
}

export function getRemainingAcres(requisition: RequisitionQuantityFields) {
  const acres = parsePositiveNumber(requisition.acres);
  if (acres === null) return null;

  const fulfilledAcres =
    parseNonNegativeNumber(requisition.fulfilledAcres ?? null) ?? 0;
  return Math.max(0, acres - fulfilledAcres);
}

export function getMaxBagsForRemainingAcres(
  remainingAcres: number,
  bagsPerAcre: number,
) {
  if (remainingAcres <= 0 || bagsPerAcre <= 0) return 0;
  return calculateBagsFromAcres(remainingAcres, bagsPerAcre);
}

export function getTotalBagsForSize(
  requisition: RequisitionQuantityFields,
  size: Pick<SizeWithStandard, "bagsPerAcre">,
) {
  const bags = parsePositiveNumber(requisition.initialQuantity);
  if (bags !== null) {
    return bags;
  }

  const acres = parsePositiveNumber(requisition.acres);
  if (acres === null || size.bagsPerAcre == null) {
    return null;
  }

  return calculateBagsFromAcres(acres, size.bagsPerAcre);
}

export function getRemainingBagsForSize(
  requisition: RequisitionQuantityFields,
  size: Pick<SizeWithStandard, "bagsPerAcre">,
) {
  if (isBagsBasedRequisition(requisition)) {
    const initial = parsePositiveNumber(requisition.initialQuantity);
    if (initial === null) return null;

    const fulfilled =
      parseNonNegativeNumber(requisition.fulfilledQuantity ?? null) ?? 0;
    return Math.max(0, initial - fulfilled);
  }

  if (isAcresBasedRequisition(requisition)) {
    const remainingAcres = getRemainingAcres(requisition);
    if (remainingAcres === null || size.bagsPerAcre == null) {
      return null;
    }

    return getMaxBagsForRemainingAcres(remainingAcres, size.bagsPerAcre);
  }

  return null;
}

export function getRemainingQuantityForRequisition(
  requisition: RequisitionQuantityFields,
): string | null {
  if (isBagsBasedRequisition(requisition)) {
    const initial = parsePositiveNumber(requisition.initialQuantity);
    if (initial === null) return null;

    const fulfilled =
      parseNonNegativeNumber(requisition.fulfilledQuantity ?? null) ?? 0;
    return Math.max(0, initial - fulfilled).toString();
  }

  if (isAcresBasedRequisition(requisition)) {
    const remainingAcres = getRemainingAcres(requisition);
    return remainingAcres !== null ? formatDecimal(remainingAcres) : null;
  }

  return null;
}

export function getOrderedBagQuantity(
  requisition: RequisitionQuantityFields,
): number | null {
  if (isBagsBasedRequisition(requisition)) {
    return parsePositiveNumber(requisition.initialQuantity);
  }

  return null;
}

export function getOrderedAcres(requisition: RequisitionQuantityFields) {
  if (!isAcresBasedRequisition(requisition)) return null;
  return parsePositiveNumber(requisition.acres);
}

export function getFulfillmentPercent(
  requisition: RequisitionQuantityFields,
): number {
  if (isBagsBasedRequisition(requisition)) {
    const fulfilled =
      parseNonNegativeNumber(requisition.fulfilledQuantity ?? null) ?? 0;
    const initial = parsePositiveNumber(requisition.initialQuantity);
    if (initial === null || initial <= 0) {
      return fulfilled > 0 ? 100 : 0;
    }
    return Math.min(100, Math.round((fulfilled / initial) * 100));
  }

  if (isAcresBasedRequisition(requisition)) {
    const orderedAcres = parsePositiveNumber(requisition.acres);
    if (orderedAcres === null || orderedAcres <= 0) {
      const fulfilledAcres =
        parseNonNegativeNumber(requisition.fulfilledAcres ?? null) ?? 0;
      return fulfilledAcres > 0 ? 100 : 0;
    }

    const fulfilledAcres =
      parseNonNegativeNumber(requisition.fulfilledAcres ?? null) ?? 0;
    return Math.min(
      100,
      Math.round((fulfilledAcres / orderedAcres) * 100),
    );
  }

  return 0;
}

export function isDispatchableRequisition(
  requisition: RequisitionQuantityFields,
  sizes: SizeWithStandard[],
) {
  if (isBagsBasedRequisition(requisition)) {
    const total = parsePositiveNumber(requisition.initialQuantity);
    const fulfilled =
      parseNonNegativeNumber(requisition.fulfilledQuantity ?? null) ?? 0;
    return total !== null && total - fulfilled > 0;
  }

  if (isAcresBasedRequisition(requisition)) {
    const remainingAcres = getRemainingAcres(requisition);
    if (remainingAcres === null || remainingAcres <= 0) return false;
    return sizes.some((size) => size.bagsPerAcre != null);
  }

  return false;
}

export function hasPendingDispatchQuantity(
  requisition: RequisitionQuantityFields,
  sizes: SizeWithStandard[] = [],
) {
  return isDispatchableRequisition(requisition, sizes);
}

export function getPendingRequisitionsSummary(
  rows: Array<{
    orderBasis: "acres" | "bags";
    remainingQuantity: string | null;
  }>,
) {
  let bagsRemaining = 0;
  let acresPending = 0;
  let bagsBasedCount = 0;
  let acresBasedCount = 0;

  for (const row of rows) {
    if (row.orderBasis === "bags") {
      bagsBasedCount += 1;
      if (row.remainingQuantity) {
        bagsRemaining += Number.parseFloat(row.remainingQuantity);
      }
      continue;
    }

    acresBasedCount += 1;
    if (row.remainingQuantity) {
      acresPending += Number.parseFloat(row.remainingQuantity);
    }
  }

  return {
    bagsRemaining,
    acresPending,
    bagsBasedCount,
    acresBasedCount,
  };
}

function formatDecimal(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

export function formatAcresPendingSummary(acresPending: number) {
  return `${formatDecimal(acresPending)} acres`;
}

export function getRequisitionsSummary(
  rows: Array<{
    status: "PENDING" | "APPROVED" | "REJECTED" | "FULFILLED";
    acres: string | null;
    initialQuantity: string | null;
  }>,
) {
  let pendingCount = 0;
  let approvedCount = 0;
  let rejectedCount = 0;
  let fulfilledCount = 0;
  let approvedBags = 0;
  let approvedAcres = 0;
  let approvedBagsBased = 0;
  let approvedAcresBased = 0;

  for (const row of rows) {
    switch (row.status) {
      case "PENDING":
        pendingCount += 1;
        break;
      case "APPROVED":
        approvedCount += 1;
        if (parsePositiveNumber(row.acres) !== null) {
          approvedAcresBased += 1;
          approvedAcres += Number.parseFloat(row.acres ?? "0");
        } else if (parsePositiveNumber(row.initialQuantity) !== null) {
          approvedBagsBased += 1;
          approvedBags += Number.parseFloat(row.initialQuantity ?? "0");
        }
        break;
      case "REJECTED":
        rejectedCount += 1;
        break;
      case "FULFILLED":
        fulfilledCount += 1;
        break;
    }
  }

  return {
    total: rows.length,
    pendingCount,
    approvedCount,
    rejectedCount,
    fulfilledCount,
    approvedBags,
    approvedAcres,
    approvedBagsBased,
    approvedAcresBased,
  };
}
