-- CreateEnum
CREATE TYPE "ContentCategory" AS ENUM ('CITIES', 'APARTMENT', 'LUXURY', 'BRANDED', 'COMMERCIAL', 'RENTAL', 'VILLAS');

-- CreateTable
CREATE TABLE "CategoryPost" (
    "id" TEXT NOT NULL,
    "category" "ContentCategory" NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT,
    "description" TEXT,
    "imageUrl" TEXT,
    "location" TEXT,
    "priceLabel" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CategoryPost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CategoryPost_category_slug_key" ON "CategoryPost"("category", "slug");
CREATE INDEX "CategoryPost_category_isActive_sortOrder_idx" ON "CategoryPost"("category", "isActive", "sortOrder");
