-- CreateEnum
CREATE TYPE "DispatchStatus" AS ENUM ('OPEN', 'CLOSED');

-- CreateEnum
CREATE TYPE "DispatchLotStatus" AS ENUM ('PENDING', 'RECEIVED');

-- AlterEnum
ALTER TYPE "RequisitionStatus" ADD VALUE 'FULFILLED';

-- AlterTable
ALTER TABLE "dispatch" ADD COLUMN     "status" "DispatchStatus" NOT NULL DEFAULT 'OPEN';

-- CreateTable
CREATE TABLE "dispatch_lot" (
    "id" TEXT NOT NULL,
    "dispatchRequisitionId" TEXT NOT NULL,
    "status" "DispatchLotStatus" NOT NULL DEFAULT 'PENDING',
    "receivedAt" TIMESTAMP(3),
    "receivedById" TEXT,
    "otpSentAt" TIMESTAMP(3),
    "otpVerifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dispatch_lot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "otp_challenge" (
    "id" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "referenceId" TEXT NOT NULL,
    "mobileNumber" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otp_challenge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "dispatch_lot_dispatchRequisitionId_key" ON "dispatch_lot"("dispatchRequisitionId");

-- CreateIndex
CREATE INDEX "dispatch_lot_status_idx" ON "dispatch_lot"("status");

-- CreateIndex
CREATE INDEX "dispatch_lot_receivedById_idx" ON "dispatch_lot"("receivedById");

-- CreateIndex
CREATE INDEX "otp_challenge_purpose_referenceId_idx" ON "otp_challenge"("purpose", "referenceId");

-- CreateIndex
CREATE INDEX "dispatch_status_idx" ON "dispatch"("status");

-- AddForeignKey
ALTER TABLE "dispatch_lot" ADD CONSTRAINT "dispatch_lot_dispatchRequisitionId_fkey" FOREIGN KEY ("dispatchRequisitionId") REFERENCES "dispatch_requisition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispatch_lot" ADD CONSTRAINT "dispatch_lot_receivedById_fkey" FOREIGN KEY ("receivedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Backfill lots for existing dispatch requisition assignments
INSERT INTO "dispatch_lot" ("id", "dispatchRequisitionId", "status", "createdAt", "updatedAt")
SELECT
  gen_random_uuid()::text,
  dr."id",
  'PENDING',
  NOW(),
  NOW()
FROM "dispatch_requisition" dr
LEFT JOIN "dispatch_lot" dl ON dl."dispatchRequisitionId" = dr."id"
WHERE dl."id" IS NULL;
