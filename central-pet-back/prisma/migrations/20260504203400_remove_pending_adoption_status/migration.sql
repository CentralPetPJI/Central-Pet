-- Normalize potential residual rows before enum migration
UPDATE "Pet"
SET "status" = 'AVAILABLE'
WHERE "status" = 'PENDING_ADOPTION';

-- Remove PENDING_ADOPTION from PetStatus enum
CREATE TYPE "PetStatus_new" AS ENUM ('AVAILABLE', 'ADOPTED', 'UNAVAILABLE');

ALTER TABLE "Pet" ALTER COLUMN "status" DROP DEFAULT;

ALTER TABLE "Pet"
ALTER COLUMN "status" TYPE "PetStatus_new"
USING ("status"::text::"PetStatus_new");

DROP TYPE "PetStatus";

ALTER TYPE "PetStatus_new" RENAME TO "PetStatus";

ALTER TABLE "Pet" ALTER COLUMN "status" SET DEFAULT 'AVAILABLE';
