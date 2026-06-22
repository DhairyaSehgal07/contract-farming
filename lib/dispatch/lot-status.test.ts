import { describe, expect, it } from "vitest";
import {
  canDeleteDispatch,
  getDispatchReceiptProgress,
  getLatestReceivedAt,
  shouldMarkRequisitionFulfilled,
  shouldRevertRequisitionToApproved,
} from "@/lib/dispatch/lot-status";

describe("dispatch lot status helpers", () => {
  it("calculates receipt progress", () => {
    expect(
      getDispatchReceiptProgress([
        { status: "RECEIVED" },
        { status: "PENDING" },
        { status: "RECEIVED" },
      ]),
    ).toEqual({
      received: 2,
      total: 3,
      isComplete: false,
    });
  });

  it("marks progress complete when all lots are received", () => {
    expect(
      getDispatchReceiptProgress([
        { status: "RECEIVED" },
        { status: "RECEIVED" },
      ]).isComplete,
    ).toBe(true);
  });

  it("blocks deleting closed dispatches and received lots", () => {
    expect(
      canDeleteDispatch({ status: "CLOSED" }, [{ status: "RECEIVED" }]),
    ).toEqual({
      allowed: false,
      reason: "Closed dispatches cannot be deleted.",
    });

    expect(
      canDeleteDispatch({ status: "OPEN" }, [{ status: "RECEIVED" }]),
    ).toEqual({
      allowed: false,
      reason: "Dispatches with received lots cannot be deleted.",
    });

    expect(canDeleteDispatch({ status: "OPEN" }, [{ status: "PENDING" }])).toEqual(
      { allowed: true },
    );
  });

  it("marks bags-based requisitions fulfilled when remaining is zero", () => {
    expect(
      shouldMarkRequisitionFulfilled(
        {
          status: "APPROVED",
          acres: null,
          initialQuantity: "100",
          fulfilledQuantity: "100",
        },
        [],
      ),
    ).toBe(true);
  });

  it("reverts fulfilled requisitions when quantity becomes dispatchable again", () => {
    expect(
      shouldRevertRequisitionToApproved(
        {
          status: "FULFILLED",
          acres: null,
          initialQuantity: "100",
          fulfilledQuantity: "40",
        },
        [],
      ),
    ).toBe(true);
  });

  it("marks acres-based requisitions fulfilled when no acres remain", () => {
    expect(
      shouldMarkRequisitionFulfilled(
        {
          status: "APPROVED",
          acres: "2",
          initialQuantity: null,
          fulfilledQuantity: "65",
          fulfilledAcres: "2",
        },
        [{ id: "size-1", bagsPerAcre: 30 }],
      ),
    ).toBe(true);
  });

  it("reverts fulfilled acres-based requisitions when acres remain", () => {
    expect(
      shouldRevertRequisitionToApproved(
        {
          status: "FULFILLED",
          acres: "2",
          initialQuantity: null,
          fulfilledQuantity: "30",
          fulfilledAcres: "1",
        },
        [{ id: "size-1", bagsPerAcre: 30 }],
      ),
    ).toBe(true);
  });

  it("returns the latest received timestamp", () => {
    const latest = getLatestReceivedAt([
      new Date("2026-06-12T10:00:00.000Z"),
      new Date("2026-06-13T10:00:00.000Z"),
      null,
    ]);

    expect(latest?.toISOString()).toBe("2026-06-13T10:00:00.000Z");
  });
});
