ALTER TABLE "Pet"
ALTER COLUMN "selectedPersonalitiesJson" DROP DEFAULT;

ALTER TABLE "Pet"
ALTER COLUMN "galleryPhotosJson" TYPE JSONB USING "galleryPhotosJson"::jsonb,
ALTER COLUMN "selectedPersonalitiesJson" TYPE JSONB USING "selectedPersonalitiesJson"::jsonb,
ALTER COLUMN "selectedPersonalitiesJson" SET DEFAULT '[]'::jsonb;

ALTER TABLE "PersonalityTrait"
ALTER COLUMN "conflictsWithJson" DROP DEFAULT;

ALTER TABLE "PersonalityTrait"
ALTER COLUMN "conflictsWithJson" TYPE JSONB USING "conflictsWithJson"::jsonb,
ALTER COLUMN "conflictsWithJson" SET DEFAULT '[]'::jsonb;
