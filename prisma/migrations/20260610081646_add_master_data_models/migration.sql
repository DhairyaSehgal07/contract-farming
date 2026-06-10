-- CreateTable
CREATE TABLE "station" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "station_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "locality" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT,
    "state" TEXT,
    "postalCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "stationId" TEXT NOT NULL,

    CONSTRAINT "locality_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "farmer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "mobileNumber" TEXT NOT NULL,
    "aadharNumber" TEXT NOT NULL,
    "panCardNumber" TEXT,
    "bankAccountName" TEXT,
    "bankName" TEXT,
    "bankAccountNumber" TEXT,
    "bankIfscCode" TEXT,
    "bankBranchName" TEXT,
    "contractUrl" TEXT,
    "stationId" TEXT NOT NULL,
    "localityId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "farmer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "variety" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "variety_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "size" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "size_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "generation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "generation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "locality_stationId_idx" ON "locality"("stationId");

-- CreateIndex
CREATE UNIQUE INDEX "farmer_accountNumber_key" ON "farmer"("accountNumber");

-- CreateIndex
CREATE UNIQUE INDEX "farmer_aadharNumber_key" ON "farmer"("aadharNumber");

-- CreateIndex
CREATE UNIQUE INDEX "farmer_panCardNumber_key" ON "farmer"("panCardNumber");

-- CreateIndex
CREATE INDEX "farmer_stationId_idx" ON "farmer"("stationId");

-- CreateIndex
CREATE INDEX "farmer_localityId_idx" ON "farmer"("localityId");

-- CreateIndex
CREATE UNIQUE INDEX "variety_name_key" ON "variety"("name");

-- CreateIndex
CREATE UNIQUE INDEX "size_name_key" ON "size"("name");

-- CreateIndex
CREATE UNIQUE INDEX "generation_name_key" ON "generation"("name");

-- AddForeignKey
ALTER TABLE "locality" ADD CONSTRAINT "locality_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "station"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "farmer" ADD CONSTRAINT "farmer_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "station"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "farmer" ADD CONSTRAINT "farmer_localityId_fkey" FOREIGN KEY ("localityId") REFERENCES "locality"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
