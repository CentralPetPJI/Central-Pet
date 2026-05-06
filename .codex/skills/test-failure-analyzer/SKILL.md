---
name: "test-failure-analyzer"
description: "Executa testes, analisa falhas comparando branch atual com main e gera diagnóstico amigável sem alterar código."
metadata:
  short-description: "Diagnóstico de falhas de teste com diff contra main"
---

<codex_skill_adapter>
## A. Skill Invocation
- Este skill é invocado ao mencionar `$test-failure-analyzer`.
- Trate todo texto após `$test-failure-analyzer` como `{{TEST_SCOPE}}`.
- Se `{{TEST_SCOPE}}` estiver vazio, rode a suíte padrão do monorepo.
</codex_skill_adapter>

<objective>
Executar testes, analisar as falhas e explicar rapidamente para um humano:
1) o que o teste verifica,
2) por que ele quebrou,
3) qual mudança da branch atual (vs main) provavelmente causou a quebra,
4) quais correções são sugeridas.
</objective>

<hard_constraints>
- NÃO alterar código de produção nem testes.
- NÃO criar commits.
- NÃO aplicar patch.
- NÃO rodar comandos destrutivos.
- Atuar apenas como diagnóstico para decisão humana rápida.
</hard_constraints>

<process>
## 1) Escolher e executar testes
- Se `{{TEST_SCOPE}}` vier preenchido, execute exatamente o escopo solicitado.
- Se vazio, use este padrão do projeto:
  - `pnpm test:front`
  - `pnpm test:back`
  - `pnpm test:e2e`
- Capture saída completa dos testes com foco em:
  - suíte/arquivo com falha
  - nome do teste (it/test/describe)
  - mensagem de erro
  - stack trace relevante

## 2) Ler relatórios e resumir falhas
- Para cada falha, identifique:
  - comportamento esperado pelo teste
  - comportamento observado
  - tipo de falha (assertion mismatch, timeout, mock incorreto, contrato quebrado, etc.)

## 3) Comparar branch atual com main
- Atualize referência da main:
  - `git fetch origin main --quiet`
- Compare branch atual com main:
  - `git --no-pager diff --name-only origin/main...HEAD`
  - `git --no-pager diff --unified=3 origin/main...HEAD -- <arquivos relevantes>`
- Cruce falhas com mudanças:
  - mapeie erro do teste para arquivos alterados no mesmo domínio/feature
  - destaque trechos de diff que podem explicar a regressão
  - quando não houver evidência suficiente, marcar explicitamente como hipótese

## 4) Gerar saída amigável para humano
- Produza relatório em português (pt-BR), claro e objetivo.
- Para cada teste quebrado, use:
  - **Teste**
  - **O que ele valida**
  - **Erro encontrado**
  - **Mudança suspeita na branch (vs main)**
  - **Causa provável**
  - **Sugestões de correção**
  - **Confiança da análise** (Alta/Média/Baixa)

## 5) Quando todos os testes passarem
- Informar que não há falha reproduzida no estado atual da branch.
- Mostrar quais suítes foram executadas.
- Encerrar sem sugerir mudança de código.
</process>

<quality_bar>
- Sem suposições vagas: toda hipótese deve citar evidência do log ou diff.
- Priorizar recomendações acionáveis e de baixo custo.
- Evitar texto genérico: cada sugestão deve referenciar o teste/falha específica.
</quality_bar>
