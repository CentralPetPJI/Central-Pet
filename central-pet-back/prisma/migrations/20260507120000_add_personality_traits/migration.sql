CREATE TABLE "PersonalityTrait" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "conflictsWithJson" TEXT NOT NULL DEFAULT '[]',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PersonalityTrait_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "PersonalityTrait_active_idx" ON "PersonalityTrait"("active");
CREATE INDEX "PersonalityTrait_sortOrder_idx" ON "PersonalityTrait"("sortOrder");

INSERT INTO "PersonalityTrait" ("id", "title", "description", "conflictsWithJson", "sortOrder")
VALUES
  ('playful', 'Brincalhão', 'Adora interagir, correr e transformar qualquer momento em diversão.', '[]', 10),
  ('calm', 'Calmo', 'Prefere rotinas tranquilas, cochilos longos e ambientes serenos.', '["energetic"]', 20),
  ('energetic', 'Agitado', 'Tem muita energia, gosta de movimento e precisa de atividades frequentes.', '["calm"]', 30),
  ('protective', 'Protetor', 'Se apega rápido à família e fica sempre atento ao redor.', '[]', 40),
  ('curious', 'Curioso', 'Explora cantos novos, cheira tudo e gosta de novidades.', '[]', 50),
  ('independent', 'Independente', 'Gosta de autonomia e costuma decidir o próprio ritmo.', '[]', 60),
  ('friendly', 'Sociável', 'Recebe bem visitas, outros pets e busca companhia com facilidade.', '["shy"]', 70),
  ('shy', 'Tímido', 'Precisa de aproximação gradual e prefere ambientes previsíveis.', '["friendly"]', 80),
  ('affectionate', 'Carinhoso', 'Busca contato, atenção e demonstra afeto com frequência.', '[]', 90),
  ('adaptable', 'Adaptável', 'Lida bem com mudanças de rotina e diferentes ambientes.', '[]', 100);
