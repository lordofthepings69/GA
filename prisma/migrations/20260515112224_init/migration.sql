-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('TeaTaster', 'SeniorTaster', 'CataloguingTeam', 'Salesperson', 'WarehouseStaff', 'Finance', 'Management', 'Admin');

-- CreateEnum
CREATE TYPE "Region" AS ENUM ('NuwaraEliya', 'Dimbula', 'Uva', 'Sabaragamuwa', 'Kandy', 'Ruhuna');

-- CreateEnum
CREATE TYPE "Elevation" AS ENUM ('HG', 'MG', 'LG');

-- CreateEnum
CREATE TYPE "Grade" AS ENUM ('BOP', 'BOPF', 'OP', 'OP1', 'OPA', 'Pekoe', 'Dust1', 'Dust', 'BF', 'FNGS1', 'FNGS', 'PD', 'PEK');

-- CreateEnum
CREATE TYPE "LotStatus" AS ENUM ('Active', 'Withdrawn', 'Passed', 'Sold');

-- CreateEnum
CREATE TYPE "TastingStatus" AS ENUM ('Draft', 'Submitted', 'Approved', 'Overridden');

-- CreateEnum
CREATE TYPE "ResultStatus" AS ENUM ('Sold', 'Unsold', 'Passed');

-- CreateEnum
CREATE TYPE "DispatchStatus" AS ENUM ('Sent', 'Received', 'Lost', 'Disputed');

-- CreateEnum
CREATE TYPE "RecipientType" AS ENUM ('Buyer', 'InternalTaster', 'Seller');

-- CreateEnum
CREATE TYPE "LiquorBrightness" AS ENUM ('Bright', 'Good', 'Fair', 'Dull');

-- CreateEnum
CREATE TYPE "LiquorStrength" AS ENUM ('Strong', 'Medium', 'Light', 'Thin');

-- CreateEnum
CREATE TYPE "LiquorBriskness" AS ENUM ('Brisk', 'Good', 'Fair', 'Lacking');

-- CreateEnum
CREATE TYPE "LiquorFlavor" AS ENUM ('Excellent', 'Good', 'Fair', 'Plain', 'Off');

-- CreateEnum
CREATE TYPE "LiquorAroma" AS ENUM ('Distinctive', 'Good', 'Fair', 'Plain');

-- CreateEnum
CREATE TYPE "OverallQuality" AS ENUM ('Outstanding', 'VeryGood', 'Good', 'Fair', 'BelowAverage', 'Poor');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "passwordHash" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'TeaTaster',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Seller" (
    "id" TEXT NOT NULL,
    "sellerCode" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "contactName" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Seller_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Buyer" (
    "id" TEXT NOT NULL,
    "buyerCode" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "contactName" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Buyer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lot" (
    "id" TEXT NOT NULL,
    "catalogueNumber" TEXT NOT NULL,
    "saleNumber" TEXT NOT NULL,
    "lotNumber" TEXT NOT NULL,
    "saleDate" TIMESTAMP(3) NOT NULL,
    "sellerId" TEXT NOT NULL,
    "estateName" TEXT NOT NULL,
    "factory" TEXT,
    "division" TEXT,
    "region" "Region" NOT NULL,
    "elevation" "Elevation" NOT NULL,
    "grade" "Grade" NOT NULL,
    "numPackages" INTEGER NOT NULL,
    "grossWeight" DECIMAL(10,2) NOT NULL,
    "netWeight" DECIMAL(10,2) NOT NULL,
    "dateOfManufacture" TIMESTAMP(3) NOT NULL,
    "warehouseLocation" TEXT,
    "adviceNoteNumber" TEXT,
    "upsettingPrice" DECIMAL(10,2),
    "lotStatus" "LotStatus" NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TastingRecord" (
    "id" TEXT NOT NULL,
    "lotId" TEXT NOT NULL,
    "tasterId" TEXT NOT NULL,
    "dateTasted" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dryLeafAppearanceScore" INTEGER,
    "dryLeafAppearanceNotes" TEXT,
    "dryLeafColorScore" INTEGER,
    "dryLeafColorNotes" TEXT,
    "dryLeafUniformityScore" INTEGER,
    "dryLeafUniformityNotes" TEXT,
    "dryLeafAromaScore" INTEGER,
    "dryLeafAromaNotes" TEXT,
    "infusionBrightnessScore" INTEGER,
    "infusionBrightnessNotes" TEXT,
    "infusionColorScore" INTEGER,
    "infusionColorNotes" TEXT,
    "infusionEvennessScore" INTEGER,
    "infusionEvennessNotes" TEXT,
    "liquorBrightness" "LiquorBrightness",
    "liquorBrightnessNotes" TEXT,
    "liquorColor" TEXT,
    "liquorStrength" "LiquorStrength",
    "liquorBriskness" "LiquorBriskness",
    "liquorFlavor" "LiquorFlavor",
    "liquorAroma" "LiquorAroma",
    "overallQuality" "OverallQuality",
    "overallQualityNotes" TEXT,
    "priceRecommendation" DECIMAL(10,2),
    "tastingNotes" TEXT,
    "status" "TastingStatus" NOT NULL DEFAULT 'Draft',
    "overrideReason" TEXT,
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TastingRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuctionResult" (
    "id" TEXT NOT NULL,
    "lotId" TEXT NOT NULL,
    "saleNumber" TEXT NOT NULL,
    "hammerPrice" DECIMAL(10,2),
    "buyerId" TEXT,
    "resultStatus" "ResultStatus" NOT NULL,
    "postSaleNotes" TEXT,
    "dateRecorded" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuctionResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SampleDispatch" (
    "id" TEXT NOT NULL,
    "lotId" TEXT NOT NULL,
    "recipientType" "RecipientType" NOT NULL,
    "recipientId" TEXT NOT NULL,
    "dateDispatched" TIMESTAMP(3) NOT NULL,
    "dateReceived" TIMESTAMP(3),
    "sampleWeightSent" DECIMAL(8,3),
    "status" "DispatchStatus" NOT NULL DEFAULT 'Sent',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SampleDispatch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "Seller_sellerCode_key" ON "Seller"("sellerCode");

-- CreateIndex
CREATE UNIQUE INDEX "Buyer_buyerCode_key" ON "Buyer"("buyerCode");

-- CreateIndex
CREATE UNIQUE INDEX "Lot_catalogueNumber_key" ON "Lot"("catalogueNumber");

-- CreateIndex
CREATE INDEX "Lot_estateName_grade_idx" ON "Lot"("estateName", "grade");

-- CreateIndex
CREATE INDEX "Lot_saleDate_idx" ON "Lot"("saleDate");

-- CreateIndex
CREATE INDEX "Lot_region_grade_idx" ON "Lot"("region", "grade");

-- CreateIndex
CREATE INDEX "Lot_saleNumber_idx" ON "Lot"("saleNumber");

-- CreateIndex
CREATE INDEX "TastingRecord_lotId_idx" ON "TastingRecord"("lotId");

-- CreateIndex
CREATE INDEX "TastingRecord_tasterId_idx" ON "TastingRecord"("tasterId");

-- CreateIndex
CREATE INDEX "TastingRecord_dateTasted_idx" ON "TastingRecord"("dateTasted");

-- CreateIndex
CREATE UNIQUE INDEX "AuctionResult_lotId_key" ON "AuctionResult"("lotId");

-- CreateIndex
CREATE INDEX "AuctionResult_saleNumber_idx" ON "AuctionResult"("saleNumber");

-- CreateIndex
CREATE INDEX "AuctionResult_dateRecorded_idx" ON "AuctionResult"("dateRecorded");

-- CreateIndex
CREATE INDEX "SampleDispatch_lotId_idx" ON "SampleDispatch"("lotId");

-- CreateIndex
CREATE INDEX "SampleDispatch_recipientId_idx" ON "SampleDispatch"("recipientId");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lot" ADD CONSTRAINT "Lot_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Seller"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TastingRecord" ADD CONSTRAINT "TastingRecord_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES "Lot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TastingRecord" ADD CONSTRAINT "TastingRecord_tasterId_fkey" FOREIGN KEY ("tasterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TastingRecord" ADD CONSTRAINT "TastingRecord_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuctionResult" ADD CONSTRAINT "AuctionResult_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES "Lot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuctionResult" ADD CONSTRAINT "AuctionResult_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "Buyer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SampleDispatch" ADD CONSTRAINT "SampleDispatch_lotId_fkey" FOREIGN KEY ("lotId") REFERENCES "Lot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
