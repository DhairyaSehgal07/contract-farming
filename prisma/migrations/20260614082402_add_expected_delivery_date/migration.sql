-- AlterTable
ALTER TABLE "requisition" ADD COLUMN "expectedDeliveryDate" DATE;

-- Backfill existing rows using requisition date
UPDATE "requisition"
SET "expectedDeliveryDate" = "requisitionDate"
WHERE "expectedDeliveryDate" IS NULL;

ALTER TABLE "requisition" ALTER COLUMN "expectedDeliveryDate" SET NOT NULL;

-- CreateIndex
CREATE INDEX "requisition_expectedDeliveryDate_idx" ON "requisition"("expectedDeliveryDate");
