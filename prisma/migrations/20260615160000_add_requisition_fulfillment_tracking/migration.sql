-- AlterTable
ALTER TABLE "requisition" ADD COLUMN "initialQuantity" DECIMAL(12,2),
ADD COLUMN "fulfilledQuantity" DECIMAL(12,2) NOT NULL DEFAULT 0;

-- Migrate existing requested quantity into initialQuantity
UPDATE "requisition"
SET "initialQuantity" = "quantity"
WHERE "quantity" IS NOT NULL;

-- Backfill fulfilledQuantity from existing dispatch size lines
UPDATE "requisition" r
SET "fulfilledQuantity" = COALESCE(totals.total, 0)
FROM (
  SELECT
    dr."requisitionId" AS "requisitionId",
    SUM(drsl."quantity") AS total
  FROM "dispatch_requisition" dr
  INNER JOIN "dispatch_requisition_size_line" drsl
    ON drsl."dispatchRequisitionId" = dr."id"
  GROUP BY dr."requisitionId"
) totals
WHERE r."id" = totals."requisitionId";

-- AlterTable
ALTER TABLE "requisition" DROP COLUMN "quantity";

-- DropIndex
DROP INDEX "dispatch_requisition_requisitionId_key";

-- CreateIndex
CREATE INDEX "dispatch_requisition_requisitionId_idx" ON "dispatch_requisition"("requisitionId");

-- CreateIndex
CREATE UNIQUE INDEX "dispatch_requisition_dispatchId_requisitionId_key" ON "dispatch_requisition"("dispatchId", "requisitionId");
