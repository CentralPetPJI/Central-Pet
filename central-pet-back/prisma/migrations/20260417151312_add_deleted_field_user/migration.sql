-- AlterTable
ALTER TABLE "User" ADD COLUMN     "deleted" BOOLEAN NOT NULL DEFAULT false;

-- Partial index to speed up queries filtering on deleted = false
CREATE INDEX "User_deleted_idx" ON "User" ("deleted") WHERE "deleted" = false;
