ALTER TABLE "Pet" ADD COLUMN "publicId" TEXT;

UPDATE "Pet"
SET "publicId" = CONCAT('pet_', REPLACE("id", '-', ''))
WHERE "publicId" IS NULL;

ALTER TABLE "Pet" ALTER COLUMN "publicId" SET NOT NULL;

CREATE UNIQUE INDEX "Pet_publicId_key" ON "Pet"("publicId");
