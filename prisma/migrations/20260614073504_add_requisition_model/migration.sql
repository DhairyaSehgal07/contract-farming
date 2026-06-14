-- CreateEnum
CREATE TYPE "RequisitionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "requisition" (
    "id" TEXT NOT NULL,
    "requisitionDate" DATE NOT NULL,
    "acres" DECIMAL(10,2),
    "quantity" DECIMAL(12,3),
    "status" "RequisitionStatus" NOT NULL DEFAULT 'PENDING',
    "rejectionRemarks" TEXT,
    "farmerId" TEXT NOT NULL,
    "varietyId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "requisition_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "requisition_farmerId_idx" ON "requisition"("farmerId");

-- CreateIndex
CREATE INDEX "requisition_varietyId_idx" ON "requisition"("varietyId");

-- CreateIndex
CREATE INDEX "requisition_createdById_idx" ON "requisition"("createdById");

-- CreateIndex
CREATE INDEX "requisition_reviewedById_idx" ON "requisition"("reviewedById");

-- CreateIndex
CREATE INDEX "requisition_status_idx" ON "requisition"("status");

-- CreateIndex
CREATE INDEX "requisition_requisitionDate_idx" ON "requisition"("requisitionDate");

-- AddForeignKey
ALTER TABLE "requisition" ADD CONSTRAINT "requisition_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "farmer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requisition" ADD CONSTRAINT "requisition_varietyId_fkey" FOREIGN KEY ("varietyId") REFERENCES "variety"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requisition" ADD CONSTRAINT "requisition_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "requisition" ADD CONSTRAINT "requisition_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
