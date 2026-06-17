-- AlterTable
ALTER TABLE "requisition" RENAME COLUMN "expectedDeliveryDate" TO "requestedDeliveryDate";

-- RenameIndex
ALTER INDEX "requisition_expectedDeliveryDate_idx" RENAME TO "requisition_requestedDeliveryDate_idx";
