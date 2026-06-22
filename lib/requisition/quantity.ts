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
