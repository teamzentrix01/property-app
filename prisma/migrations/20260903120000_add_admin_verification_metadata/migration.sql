CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'ACTIVE', 'REJECTED', 'EXPIRED');
CREATE TYPE "DocumentStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED');

ALTER TABLE "User"
  ADD COLUMN "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
  ADD COLUMN "verificationSubmittedAt" TIMESTAMP(3),
  ADD COLUMN "verificationDeadline" TIMESTAMP(3),
  ADD COLUMN "verifiedAt" TIMESTAMP(3),
  ADD COLUMN "rejectedAt" TIMESTAMP(3),
  ADD COLUMN "rejectionReason" TEXT,
  ADD COLUMN "aadhaarStatus" "DocumentStatus" NOT NULL DEFAULT 'PENDING',
  ADD COLUMN "panStatus" "DocumentStatus" NOT NULL DEFAULT 'PENDING',
  ADD COLUMN "voterIdStatus" "DocumentStatus" NOT NULL DEFAULT 'PENDING',
  ADD COLUMN "aadhaarVerifiedAt" TIMESTAMP(3),
  ADD COLUMN "panVerifiedAt" TIMESTAMP(3),
  ADD COLUMN "voterIdVerifiedAt" TIMESTAMP(3),
  ADD COLUMN "aadhaarVerifiedBy" TEXT,
  ADD COLUMN "panVerifiedBy" TEXT,
  ADD COLUMN "voterIdVerifiedBy" TEXT,
  ADD COLUMN "aadhaarRejectionReason" TEXT,
  ADD COLUMN "panRejectionReason" TEXT,
  ADD COLUMN "voterIdRejectionReason" TEXT,
  ADD COLUMN "aadhaarRejectedAt" TIMESTAMP(3),
  ADD COLUMN "panRejectedAt" TIMESTAMP(3),
  ADD COLUMN "voterIdRejectedAt" TIMESTAMP(3);

ALTER TABLE "Listing"
  ADD COLUMN "approvedAt" TIMESTAMP(3),
  ADD COLUMN "approvedBy" TEXT,
  ADD COLUMN "activatedAt" TIMESTAMP(3),
  ADD COLUMN "activatedBy" TEXT,
  ADD COLUMN "rejectedAt" TIMESTAMP(3),
  ADD COLUMN "rejectedBy" TEXT;

UPDATE "User"
SET "verificationStatus" = 'ACTIVE', "verifiedAt" = COALESCE("updatedAt", CURRENT_TIMESTAMP)
WHERE "verified" = true;