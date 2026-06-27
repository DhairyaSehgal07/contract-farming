import { describe, expect, it } from "vitest";
import {
  assertSufficientStock,
  type StockLineInput,
} from "@/lib/transfer/stock-balance";

describe("assertSufficientStock", () => {
  const balances = [
    {
      varietyId: "v1",
      sizeId: "s1",
      generationId: "g1",
      quantity: "10",
    },
    {
      varietyId: "v1",
      sizeId: "s2",
      generationId: "g1",
      quantity: "5",
    },
  ];

  it("passes when requested quantity is within balance", () => {
    const lines: StockLineInput[] = [
      { varietyId: "v1", sizeId: "s1", generationId: "g1", quantity: 10 },
      { varietyId: "v1", sizeId: "s2", generationId: "g1", quantity: 3 },
    ];

    expect(() => assertSufficientStock(balances, lines)).not.toThrow();
  });

  it("throws when quantity exceeds available stock", () => {
    const lines: StockLineInput[] = [
      { varietyId: "v1", sizeId: "s1", generationId: "g1", quantity: 11 },
    ];

    expect(() => assertSufficientStock(balances, lines)).toThrow(
      "Transfer quantity exceeds available stock.",
    );
  });

  it("throws when line has no matching balance", () => {
    const lines: StockLineInput[] = [
      { varietyId: "v2", sizeId: "s1", generationId: "g1", quantity: 1 },
    ];

    expect(() => assertSufficientStock(balances, lines)).toThrow(
      "Transfer quantity exceeds available stock.",
    );
  });

  it("throws when line quantity is not positive", () => {
    const lines: StockLineInput[] = [
      { varietyId: "v1", sizeId: "s1", generationId: "g1", quantity: 0 },
    ];

    expect(() => assertSufficientStock(balances, lines)).toThrow(
      "Each transfer line must have a positive quantity.",
    );
  });
});
