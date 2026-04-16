-- Enforce no hard-delete cascades on core relations
ALTER TABLE "Session" DROP CONSTRAINT IF EXISTS "Session_userId_fkey";
ALTER TABLE "Session"
  ADD CONSTRAINT "Session_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "AdoptionRequest" DROP CONSTRAINT IF EXISTS "AdoptionRequest_petId_fkey";
ALTER TABLE "AdoptionRequest"
  ADD CONSTRAINT "AdoptionRequest_petId_fkey"
  FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "AdoptionRequest" DROP CONSTRAINT IF EXISTS "AdoptionRequest_responsibleUserId_fkey";
ALTER TABLE "AdoptionRequest"
  ADD CONSTRAINT "AdoptionRequest_responsibleUserId_fkey"
  FOREIGN KEY ("responsibleUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "AdoptionRequest" DROP CONSTRAINT IF EXISTS "AdoptionRequest_adopterId_fkey";
ALTER TABLE "AdoptionRequest"
  ADD CONSTRAINT "AdoptionRequest_adopterId_fkey"
  FOREIGN KEY ("adopterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
