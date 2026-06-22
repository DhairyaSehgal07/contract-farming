-- AlterTable
ALTER TABLE "requisition" ADD COLUMN "fulfilledAcres" DECIMAL(10,2) NOT NULL DEFAULT 0;

-- Backfill fulfilledAcres from dispatch size lines (bags / bagsPerAcre)
UPDATE "requisition" r
SET "fulfilledAcres" = sub.total_acres
FROM (
  SELECT
    dr."requisitionId",
    COALESCE(SUM(dsl."quantity" / s."bagsPerAcre"), 0) AS total_acres
  FROM "dispatch_requisition" dr
  INNER JOIN "dispatch_requisition_size_line" dsl
    ON dsl."dispatchRequisitionId" = dr."id"
  INNER JOIN "size" s
    ON s."id" = dsl."sizeId"
  WHERE s."bagsPerAcre" IS NOT NULL
    AND s."bagsPerAcre" > 0
  GROUP BY dr."requisitionId"
) sub
WHERE r."id" = sub."requisitionId";
