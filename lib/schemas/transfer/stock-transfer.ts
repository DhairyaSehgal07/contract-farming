import { z } from "zod";

const positiveQuantity = z
  .string()
  .trim()
  .refine((value) => {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) && parsed > 0;
  }, "Quantity must be a positive number.");

export const stockTransferLineSchema = z.object({
  varietyId: z.string().min(1, "Variety is required."),
  sizeId: z.string().min(1, "Size is required."),
  generationId: z.string().min(1, "Generation is required."),
  quantity: positiveQuantity,
});

export const createStockTransferSchema = z
  .object({
    transferDate: z.string().min(1, "Transfer date is required."),
    fromFarmerId: z.string().min(1, "Source farmer is required."),
    toFarmerId: z.string().min(1, "Destination farmer is required."),
    remarks: z.string().trim().optional(),
    lines: z
      .array(stockTransferLineSchema)
      .min(1, "At least one stock line is required."),
  })
  .refine((data) => data.fromFarmerId !== data.toFarmerId, {
    message: "Source and destination farmers must be different.",
    path: ["toFarmerId"],
  });

export type CreateStockTransferInput = z.infer<typeof createStockTransferSchema>;
export type StockTransferLineInput = z.infer<typeof stockTransferLineSchema>;

export function normalizeCreateStockTransferInput(
  input: CreateStockTransferInput,
) {
  return {
    transferDate: input.transferDate,
    fromFarmerId: input.fromFarmerId,
    toFarmerId: input.toFarmerId,
    remarks: input.remarks?.trim() || null,
    lines: input.lines.map((line) => ({
      varietyId: line.varietyId,
      sizeId: line.sizeId,
      generationId: line.generationId,
      quantity: Number.parseFloat(line.quantity),
    })),
  };
}
