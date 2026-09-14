-- Existing users predate mandatory email verification. Preserve their access
-- while all subsequently created accounts must verify their email before login.
UPDATE "User"
SET "emailVerifiedAt" = COALESCE("emailVerifiedAt", "createdAt")
WHERE "emailVerifiedAt" IS NULL;
