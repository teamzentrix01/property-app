CREATE TABLE "UserDocument" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "cloudinaryUrl" TEXT NOT NULL,
    "cloudinaryPublicId" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "verificationStatus" "DocumentStatus" NOT NULL DEFAULT 'PENDING',
    "rejectionReason" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verifiedAt" TIMESTAMP(3),
    "verifiedBy" TEXT,
    "replacedDocumentId" TEXT,
    CONSTRAINT "UserDocument_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "UserDocument_userId_verificationStatus_idx" ON "UserDocument"("userId", "verificationStatus");
CREATE INDEX "UserDocument_documentType_verificationStatus_idx" ON "UserDocument"("documentType", "verificationStatus");
ALTER TABLE "UserDocument" ADD CONSTRAINT "UserDocument_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;