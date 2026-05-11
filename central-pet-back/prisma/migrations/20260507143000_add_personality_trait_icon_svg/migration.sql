ALTER TABLE "PersonalityTrait"
ADD COLUMN "iconSvg" TEXT NOT NULL DEFAULT '';

UPDATE "PersonalityTrait"
SET "iconSvg" = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3v18" /><path d="M3 12h18" /><path d="M5.5 5.5l13 13" /><path d="M18.5 5.5l-13 13" /></svg>'
WHERE "id" = 'playful';

UPDATE "PersonalityTrait"
SET "iconSvg" = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 15c1.5 2.5 4.2 4 8 4s6.5-1.5 8-4" /><path d="M8 10c.5-.9 1.5-1.5 3-1.5s2.5.6 3 1.5" /><path d="M7 7h.01" /><path d="M17 7h.01" /></svg>'
WHERE "id" = 'calm';

UPDATE "PersonalityTrait"
SET "iconSvg" = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m13 2-8 12h6l-1 8 8-12h-6l1-8Z" /></svg>'
WHERE "id" = 'energetic';

UPDATE "PersonalityTrait"
SET "iconSvg" = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6l7-3Z" /><path d="M9.5 12.5l1.7 1.7 3.3-3.7" /></svg>'
WHERE "id" = 'protective';

UPDATE "PersonalityTrait"
SET "iconSvg" = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="6" /><path d="m20 20-4.2-4.2" /><path d="M11 8v3l2 2" /></svg>'
WHERE "id" = 'curious';

UPDATE "PersonalityTrait"
SET "iconSvg" = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M7 17 17 7" /><path d="M9 7h8v8" /><path d="M5 12v7h7" /></svg>'
WHERE "id" = 'independent';

UPDATE "PersonalityTrait"
SET "iconSvg" = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z" /><path d="M16 13a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z" /><path d="M4 19c0-2.2 1.8-4 4-4" /><path d="M12 19c0-2.2 1.8-4 4-4" /><path d="M10 19c0-2.2 1.8-4 4-4" /></svg>'
WHERE "id" = 'friendly';

UPDATE "PersonalityTrait"
SET "iconSvg" = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 21a8 8 0 0 0 8-8V7l-8-4-8 4v6a8 8 0 0 0 8 8Z" /><path d="M9 10h.01" /><path d="M15 10h.01" /><path d="M9 15c1.5-1 4.5-1 6 0" /></svg>'
WHERE "id" = 'shy';

UPDATE "PersonalityTrait"
SET "iconSvg" = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" /></svg>'
WHERE "id" = 'affectionate';

UPDATE "PersonalityTrait"
SET "iconSvg" = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17 2v6h-6" /><path d="M7 22v-6h6" /><path d="M20 11a8 8 0 0 0-14-5l5 2" /><path d="M4 13a8 8 0 0 0 14 5l-5-2" /></svg>'
WHERE "id" = 'adaptable';
