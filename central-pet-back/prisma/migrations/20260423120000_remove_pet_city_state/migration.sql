-- DropIndex
DROP INDEX IF EXISTS "Pet_city_idx";

-- AlterTable
ALTER TABLE "Pet"
DROP COLUMN IF EXISTS "city",
DROP COLUMN IF EXISTS "state";
