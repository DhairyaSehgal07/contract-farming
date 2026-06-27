-- CreateTable
CREATE TABLE "farmer_field" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "acres" DECIMAL(10,2) NOT NULL,
    "farmerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "farmer_field_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plantation" (
    "id" TEXT NOT NULL,
    "fieldId" TEXT NOT NULL,
    "varietyId" TEXT NOT NULL,
    "bagVolume" DECIMAL(12,2) NOT NULL,
    "imageUrl" TEXT,
    "plantedAt" DATE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plantation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "irrigation_cycle" (
    "id" TEXT NOT NULL,
    "fieldId" TEXT NOT NULL,
    "cycleNumber" INTEGER NOT NULL,
    "irrigatedAt" DATE NOT NULL,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "irrigation_cycle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "farmer_field_farmerId_idx" ON "farmer_field"("farmerId");

-- CreateIndex
CREATE UNIQUE INDEX "plantation_fieldId_key" ON "plantation"("fieldId");

-- CreateIndex
CREATE INDEX "plantation_varietyId_idx" ON "plantation"("varietyId");

-- CreateIndex
CREATE INDEX "irrigation_cycle_fieldId_idx" ON "irrigation_cycle"("fieldId");

-- CreateIndex
CREATE UNIQUE INDEX "irrigation_cycle_fieldId_cycleNumber_key" ON "irrigation_cycle"("fieldId", "cycleNumber");

-- AddForeignKey
ALTER TABLE "farmer_field" ADD CONSTRAINT "farmer_field_farmerId_fkey" FOREIGN KEY ("farmerId") REFERENCES "farmer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plantation" ADD CONSTRAINT "plantation_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "farmer_field"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plantation" ADD CONSTRAINT "plantation_varietyId_fkey" FOREIGN KEY ("varietyId") REFERENCES "variety"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "irrigation_cycle" ADD CONSTRAINT "irrigation_cycle_fieldId_fkey" FOREIGN KEY ("fieldId") REFERENCES "farmer_field"("id") ON DELETE CASCADE ON UPDATE CASCADE;
