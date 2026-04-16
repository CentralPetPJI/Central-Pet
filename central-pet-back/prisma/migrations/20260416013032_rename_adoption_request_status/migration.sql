/*
  Warnings:

  - The values [pending,contact_shared,approved,rejected] on the enum `AdoptionRequestStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AdoptionRequestStatus_new" AS ENUM ('PENDING', 'CONTACT_SHARED', 'APPROVED', 'REJECTED');
ALTER TABLE "public"."AdoptionRequest" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "AdoptionRequest" ALTER COLUMN "status" TYPE "AdoptionRequestStatus_new" USING ("status"::text::"AdoptionRequestStatus_new");
ALTER TYPE "AdoptionRequestStatus" RENAME TO "AdoptionRequestStatus_old";
ALTER TYPE "AdoptionRequestStatus_new" RENAME TO "AdoptionRequestStatus";
DROP TYPE "public"."AdoptionRequestStatus_old";
ALTER TABLE "AdoptionRequest" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterTable
ALTER TABLE "AdoptionRequest" ALTER COLUMN "status" SET DEFAULT 'PENDING';
