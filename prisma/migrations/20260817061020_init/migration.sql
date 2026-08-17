-- CreateEnum
CREATE TYPE "Role" AS ENUM ('BUYER', 'OWNER', 'BROKER', 'AREA_ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "Purpose" AS ENUM ('SALE', 'RENT');

-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('HOUSE', 'PLOT', 'FLAT', 'SHOP', 'SHOWROOM', 'GODOWN', 'OFFICE', 'PG');

-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "FurnishingStatus" AS ENUM ('UNFURNISHED', 'SEMI_FURNISHED', 'FULLY_FURNISHED');

-- CreateEnum
CREATE TYPE "PossessionStatus" AS ENUM ('READY_TO_MOVE', 'UNDER_CONSTRUCTION');

-- CreateEnum
CREATE TYPE "OwnershipType" AS ENUM ('FREEHOLD', 'LEASEHOLD', 'POWER_OF_ATTORNEY');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'BUYER',
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "adminArea" TEXT,
    "brokerBio" TEXT,
    "brokerAgency" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Listing" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "purpose" "Purpose" NOT NULL,
    "propertyType" "PropertyType" NOT NULL,
    "postedBy" "Role" NOT NULL,
    "status" "ListingStatus" NOT NULL DEFAULT 'PENDING',
    "city" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "contactNumber" TEXT NOT NULL,
    "sizeValue" DOUBLE PRECISION,
    "sizeUnit" TEXT,
    "plotLength" DOUBLE PRECISION,
    "plotWidth" DOUBLE PRECISION,
    "facing" TEXT,
    "bedrooms" INTEGER,
    "bathrooms" INTEGER,
    "floorNumber" INTEGER,
    "totalFloors" INTEGER,
    "furnishing" "FurnishingStatus",
    "propertyAgeYears" INTEGER,
    "possession" "PossessionStatus",
    "ownershipType" "OwnershipType",
    "reraNumber" TEXT,
    "authorityApproved" BOOLEAN,
    "amenities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "roadWidthFt" DOUBLE PRECISION,
    "isCornerPlot" BOOLEAN,
    "nearbyLandmark" TEXT,
    "negotiable" BOOLEAN,
    "loanAvailable" BOOLEAN,
    "description" TEXT,
    "mapLat" DOUBLE PRECISION,
    "mapLng" DOUBLE PRECISION,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Photo" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,

    CONSTRAINT "Photo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "label" TEXT,
    "listingId" TEXT NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CatalogLink" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT,
    "brokerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CatalogLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CatalogLinkListing" (
    "catalogLinkId" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,

    CONSTRAINT "CatalogLinkListing_pkey" PRIMARY KEY ("catalogLinkId","listingId")
);

-- CreateTable
CREATE TABLE "SavedListing" (
    "userId" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedListing_pkey" PRIMARY KEY ("userId","listingId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE INDEX "Listing_city_area_purpose_propertyType_status_idx" ON "Listing"("city", "area", "purpose", "propertyType", "status");

-- CreateIndex
CREATE UNIQUE INDEX "CatalogLink_slug_key" ON "CatalogLink"("slug");

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CatalogLink" ADD CONSTRAINT "CatalogLink_brokerId_fkey" FOREIGN KEY ("brokerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CatalogLinkListing" ADD CONSTRAINT "CatalogLinkListing_catalogLinkId_fkey" FOREIGN KEY ("catalogLinkId") REFERENCES "CatalogLink"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CatalogLinkListing" ADD CONSTRAINT "CatalogLinkListing_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedListing" ADD CONSTRAINT "SavedListing_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
