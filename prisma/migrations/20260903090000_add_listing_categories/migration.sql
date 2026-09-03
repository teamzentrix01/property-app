-- CreateTable
CREATE TABLE "ListingCategory" (
    "listingId" TEXT NOT NULL,
    "category" "ContentCategory" NOT NULL,
    CONSTRAINT "ListingCategory_pkey" PRIMARY KEY ("listingId", "category")
);

-- CreateIndex
CREATE INDEX "ListingCategory_category_listingId_idx" ON "ListingCategory"("category", "listingId");

-- AddForeignKey
ALTER TABLE "ListingCategory" ADD CONSTRAINT "ListingCategory_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;