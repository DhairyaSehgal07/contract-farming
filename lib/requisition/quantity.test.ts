import { describe, expect, it } from "vitest";
import {
  calculateAcresFromBags,
  calculateBagsFromAcres,
  getAcresDispatchCredit,
  getAcresDispatchDebit,
  getFulfillmentPercent,
  getMaxBagsForRemainingAcres,
  getPendingRequisitionsSummary,
  getRemainingAcres,
  getRemainingBagsForSize,
  getRemainingQuantityForRequisition,
  getTotalBagsForSize,
  hasPendingDispatchQuantity,
  isAcresBasedRequisition,
  isAcresDispatchWithinTolerance,
  isBagsBasedRequisition,
  isDispatchableRequisition,
} from "@/lib/requisition/quantity";

describe("requisition quantity helpers", () => {
  it("identifies acres-based and bags-based requisitions", () => {
    expect(
      isAcresBasedRequisition({ acres: "2", initialQuantity: null }),
    ).toBe(true);
    expect(
      isBagsBasedRequisition({ acres: null, initialQuantity: "60" }),
    ).toBe(true);
    expect(
      isAcresBasedRequisition({ acres: "2", initialQuantity: "60" }),
    ).toBe(false);
  });

  it("calculates bags from acres and size standard", () => {
    expect(calculateBagsFromAcres(2, 30)).toBe(60);
    expect(
      getTotalBagsForSize(
        { acres: "2", initialQuantity: null },
        { bagsPerAcre: 30 },
      ),
    ).toBe(60);
  });

  it("calculates fractional acres from bags", () => {
    expect(calculateAcresFromBags(30, 30)).toBe(1);
    expect(calculateAcresFromBags(25, 30)).toBeCloseTo(0.833, 2);
  });

  it("uses direct bag quantity when specified", () => {
    expect(
      getTotalBagsForSize(
        { acres: null, initialQuantity: "75" },
        { bagsPerAcre: 30 },
      ),
    ).toBe(75);
  });

  it("computes remaining acres after partial dispatch", () => {
    expect(
      getRemainingAcres({
        acres: "2",
        initialQuantity: null,
        fulfilledAcres: "1",
      }),
    ).toBe(1);
  });

  it("computes remaining bags for a size from remaining acres", () => {
    expect(
      getRemainingBagsForSize(
        {
          acres: "2",
          initialQuantity: null,
          fulfilledAcres: "1",
        },
        { bagsPerAcre: 35 },
      ),
    ).toBe(35);
  });

  it("computes max bags for remaining acres", () => {
    expect(getMaxBagsForRemainingAcres(1, 35)).toBe(35);
    expect(getMaxBagsForRemainingAcres(0, 30)).toBe(0);
  });

  it("marks acres-based requisitions dispatchable when a size standard exists", () => {
    expect(
      isDispatchableRequisition(
        {
          acres: "2",
          initialQuantity: null,
          fulfilledAcres: "0",
        },
        [{ id: "size-1", bagsPerAcre: 30 }],
      ),
    ).toBe(true);
    expect(
      isDispatchableRequisition(
        {
          acres: "2",
          initialQuantity: null,
          fulfilledAcres: "0",
        },
        [{ id: "size-1", bagsPerAcre: null }],
      ),
    ).toBe(false);
  });

  it("lists acres-based requisitions as pending before first dispatch when a size standard exists", () => {
    expect(
      hasPendingDispatchQuantity(
        {
          acres: "2",
          initialQuantity: null,
          fulfilledAcres: "0",
        },
        [{ id: "size-1", bagsPerAcre: null }],
      ),
    ).toBe(false);
    expect(
      hasPendingDispatchQuantity(
        {
          acres: "2",
          initialQuantity: null,
          fulfilledAcres: "0",
        },
        [{ id: "size-1", bagsPerAcre: 30 }],
      ),
    ).toBe(true);
  });

  it("summarizes bags and acres pending separately", () => {
    expect(
      getPendingRequisitionsSummary([
        {
          orderBasis: "bags",
          remainingQuantity: "40",
        },
        {
          orderBasis: "acres",
          remainingQuantity: "2.5",
        },
      ]),
    ).toEqual({
      bagsRemaining: 40,
      acresPending: 2.5,
      bagsBasedCount: 1,
      acresBasedCount: 1,
    });
  });

  it("returns remaining acres for acres-based requisitions", () => {
    expect(
      getRemainingQuantityForRequisition({
        acres: "2",
        initialQuantity: null,
        fulfilledAcres: "1",
      }),
    ).toBe("1");
  });

  it("returns remaining bags for bags-based requisitions", () => {
    expect(
      getRemainingQuantityForRequisition({
        acres: null,
        initialQuantity: "60",
        fulfilledQuantity: "20",
      }),
    ).toBe("40");
  });

  it("computes fulfillment percent for acres from fulfilledAcres", () => {
    expect(
      getFulfillmentPercent({
        acres: "2",
        initialQuantity: null,
        fulfilledAcres: "1",
      }),
    ).toBe(50);
    expect(
      getFulfillmentPercent({
        acres: "2",
        initialQuantity: null,
        fulfilledAcres: "2",
      }),
    ).toBe(100);
  });

  it("allows different size standards after partial dispatch", () => {
    const requisition = {
      acres: "2",
      initialQuantity: null,
      fulfilledAcres: "1",
      fulfilledQuantity: "30",
    };
    const sizes = [
      { id: "size-25-30", bagsPerAcre: 35 },
      { id: "size-30-40", bagsPerAcre: 30 },
    ];

    expect(isDispatchableRequisition(requisition, sizes)).toBe(true);
    expect(getRemainingBagsForSize(requisition, { bagsPerAcre: 35 })).toBe(35);
    expect(getRemainingBagsForSize(requisition, { bagsPerAcre: 30 })).toBe(30);
  });

  it("marks acres requisition fulfilled when no acres remain", () => {
    const requisition = {
      acres: "2",
      initialQuantity: null,
      fulfilledAcres: "2",
      fulfilledQuantity: "65",
    };
    const sizes = [
      { id: "size-25-30", bagsPerAcre: 35 },
      { id: "size-30-40", bagsPerAcre: 30 },
    ];

    expect(isDispatchableRequisition(requisition, sizes)).toBe(false);
  });

  it("walks through multi-size lot example", () => {
    const afterLot1 = {
      acres: "2",
      initialQuantity: null,
      fulfilledAcres: "1",
      fulfilledQuantity: "30",
    };

    expect(getRemainingAcres(afterLot1)).toBe(1);
    expect(
      getRemainingBagsForSize(afterLot1, { bagsPerAcre: 35 }),
    ).toBe(35);

    const afterLot2 = {
      ...afterLot1,
      fulfilledAcres: "2",
      fulfilledQuantity: "65",
    };

    expect(getRemainingAcres(afterLot2)).toBe(0);
    expect(isDispatchableRequisition(afterLot2, [{ id: "size-1", bagsPerAcre: 30 }])).toBe(
      false,
    );
  });
});

describe("acres dispatch overage tolerance", () => {
  it("allows dispatch within 0.5 acre overage", () => {
    expect(isAcresDispatchWithinTolerance(1.57, 1.5)).toBe(true);
    expect(isAcresDispatchWithinTolerance(2, 1.5)).toBe(true);
    expect(isAcresDispatchWithinTolerance(1.5, 1.5)).toBe(true);
  });

  it("rejects dispatch beyond 0.5 acre overage", () => {
    expect(isAcresDispatchWithinTolerance(2.01, 1.5)).toBe(false);
    expect(isAcresDispatchWithinTolerance(1.57, 0)).toBe(false);
    expect(isAcresDispatchWithinTolerance(null, 1.5)).toBe(false);
  });

  it("credits remaining acres when tolerance caps consumption", () => {
    expect(getAcresDispatchCredit(1.57, 1.5)).toBe(1.5);
    expect(getAcresDispatchCredit(0.8, 2)).toBe(0.8);
    expect(getAcresDispatchCredit(1, 1)).toBe(1);
  });

  it("debits capped tolerance credit below full bag acres", () => {
    const acresFromBags = calculateAcresFromBags(11, 7)!;
    expect(acresFromBags).toBeCloseTo(1.57, 2);

    const credit = getAcresDispatchCredit(acresFromBags, 1.5);
    expect(credit).toBe(1.5);

    const fulfilledAfter = 0.5 + credit;
    const debit = getAcresDispatchDebit(acresFromBags, fulfilledAfter, 2);
    expect(debit).toBeGreaterThan(0);
    expect(debit).toBeLessThanOrEqual(acresFromBags);
  });

  it("debits full bags when no tolerance cap was applied", () => {
    expect(getAcresDispatchDebit(0.8, 1.8, 2)).toBe(0.8);
  });

  it("round-trips tolerance dispatch credit on create", () => {
    const orderedAcres = 2;
    const fulfilledBefore = 0.5;
    const remainingBefore = orderedAcres - fulfilledBefore;
    const acresFromBags = calculateAcresFromBags(11, 7)!;
    const credit = getAcresDispatchCredit(acresFromBags, remainingBefore);
    const fulfilledAfter = fulfilledBefore + credit;

    expect(credit).toBe(1.5);
    expect(
      getRemainingAcres({
        acres: "2",
        initialQuantity: null,
        fulfilledAcres: String(fulfilledAfter),
      }),
    ).toBe(0);
    expect(isAcresDispatchWithinTolerance(acresFromBags, remainingBefore)).toBe(
      true,
    );
  });
});
