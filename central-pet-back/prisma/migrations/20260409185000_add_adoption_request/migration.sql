-- Transition from requester-based adoption requests to owner/adopter contract
ALTER TYPE "AdoptionRequestStatus" RENAME TO "AdoptionRequestStatus_legacy";

CREATE TYPE "AdoptionRequestStatus" AS ENUM ('pending', 'contact_shared', 'approved', 'rejected');

ALTER TABLE "AdoptionRequest" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "AdoptionRequest"
  ALTER COLUMN "status" TYPE "AdoptionRequestStatus"
  USING (
    CASE "status"::text
      WHEN 'PENDING' THEN 'pending'
      WHEN 'APPROVED' THEN 'approved'
      WHEN 'REJECTED' THEN 'rejected'
      WHEN 'CANCELLED' THEN 'rejected'
      ELSE 'pending'
    END
  )::"AdoptionRequestStatus";
ALTER TABLE "AdoptionRequest" ALTER COLUMN "status" SET DEFAULT 'pending';

ALTER TABLE "AdoptionRequest"
  ADD COLUMN "responsibleUserId" TEXT,
  ADD COLUMN "adopterId" TEXT,
  ADD COLUMN "adopterContactShareConsent" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "note" TEXT,
  ADD COLUMN "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE "AdoptionRequest" ar
SET
  "adopterId" = ar."requesterId",
  "message" = COALESCE(ar."message", 'Interesse em adocao'),
  "requestedAt" = COALESCE(ar."createdAt", CURRENT_TIMESTAMP)
FROM "Pet" p
WHERE ar."petId" = p."id";

ALTER TABLE "AdoptionRequest"
  ALTER COLUMN "adopterId" SET NOT NULL,
  ALTER COLUMN "responsibleUserId" SET NOT NULL,
  ALTER COLUMN "message" SET NOT NULL;

ALTER TABLE "AdoptionRequest" DROP CONSTRAINT IF EXISTS "AdoptionRequest_requesterId_fkey";
ALTER TABLE "AdoptionRequest" DROP CONSTRAINT IF EXISTS "AdoptionRequest_petId_fkey";

DROP INDEX IF EXISTS "AdoptionRequest_requesterId_idx";
DROP INDEX IF EXISTS "AdoptionRequest_status_idx";

ALTER TABLE "AdoptionRequest"
  DROP COLUMN "requesterId",
  DROP COLUMN "createdAt";

CREATE INDEX IF NOT EXISTS "AdoptionRequest_responsibleUserId_requestedAt_idx"
  ON "AdoptionRequest"("responsibleUserId", "requestedAt");
CREATE INDEX IF NOT EXISTS "AdoptionRequest_adopterId_idx"
  ON "AdoptionRequest"("adopterId");

ALTER TABLE "AdoptionRequest"
  ADD CONSTRAINT "AdoptionRequest_petId_fkey"
  FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "AdoptionRequest"
  ADD CONSTRAINT "AdoptionRequest_responsibleUserId_fkey"
  FOREIGN KEY ("responsibleUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "AdoptionRequest"
  ADD CONSTRAINT "AdoptionRequest_adopterId_fkey"
  FOREIGN KEY ("adopterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

DROP TYPE "AdoptionRequestStatus_legacy";
