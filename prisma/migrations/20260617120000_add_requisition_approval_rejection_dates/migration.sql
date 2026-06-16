-- AlterTable
ALTER TABLE "requisition" ADD COLUMN "approvalDate" DATE,
ADD COLUMN "rejectionDate" DATE;

-- Backfill from reviewedAt for existing records
UPDATE "requisition"
SET "approvalDate" = "reviewedAt"::date
WHERE "status" = 'APPROVED' AND "reviewedAt" IS NOT NULL;

UPDATE "requisition"
SET "rejectionDate" = "reviewedAt"::date
WHERE "status" = 'REJECTED' AND "reviewedAt" IS NOT NULL;
