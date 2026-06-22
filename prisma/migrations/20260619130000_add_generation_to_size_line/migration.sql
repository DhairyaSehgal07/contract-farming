-- DropIndex
DROP INDEX IF EXISTS "dispatch_requisition_size_line_dispatchRequisitionId_sizeId_key";

-- AlterTable
ALTER TABLE "dispatch_requisition_size_line" ADD COLUMN IF NOT EXISTS "generationId" TEXT;

-- Backfill existing size lines with the first available generation
UPDATE "dispatch_requisition_size_line" drsl
SET "generationId" = (SELECT "id" FROM "generation" ORDER BY "name" ASC LIMIT 1)
WHERE drsl."generationId" IS NULL;

ALTER TABLE "dispatch_requisition_size_line" ALTER COLUMN "generationId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "dispatch_requisition_size_line_dispatchRequisitionId_sizeId_generationId_key"
ON "dispatch_requisition_size_line"("dispatchRequisitionId", "sizeId", "generationId");

CREATE INDEX IF NOT EXISTS "dispatch_requisition_size_line_generationId_idx"
ON "dispatch_requisition_size_line"("generationId");

-- AddForeignKey
ALTER TABLE "dispatch_requisition_size_line" DROP CONSTRAINT IF EXISTS "dispatch_requisition_size_line_generationId_fkey";

ALTER TABLE "dispatch_requisition_size_line" ADD CONSTRAINT "dispatch_requisition_size_line_generationId_fkey"
FOREIGN KEY ("generationId") REFERENCES "generation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
