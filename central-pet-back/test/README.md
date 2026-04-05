# Testes E2E do Backend

## Banco de Dados de Teste

Os testes E2E usam um banco de dados PostgreSQL **separado** para garantir isolamento completo.

### Configuração

1. **Copie o arquivo de exemplo** (se ainda não existir `.env.test`):

   ```bash
   cp .env.example .env.test
   ```

2. **Configure o banco de teste** no `.env.test`:

   ```env
   DATABASE_URL=postgresql://centralpet:centralpet123@localhost:5432/centralpetdb_test?schema=public
   ```

   ⚠️ **Importante**: O banco DEVE ter sufixo `_test` no nome.

3. **Execute o script de setup** (cria o banco e roda migrations):
   ```bash
   pnpm test:setup
   ```

### Executando os Testes

```bash
# Roda todos os testes E2E
pnpm test:e2e

# Modo watch (re-executa ao salvar)
pnpm test:e2e:watch
```

### Como Funciona

- **`TestDatabaseHelper`**: Gerencia a conexão com o banco de teste
  - `setup()`: Conecta e executa migrations
  - `cleanup()`: Limpa dados entre testes (mantém schema)
  - `teardown()`: Desconecta após todos os testes

- **Isolamento**: Cada suite de testes:
  1. Conecta ao banco de teste
  2. Limpa dados antes de cada teste
  3. Executa os testes
  4. Desconecta ao finalizar

### Estrutura

```
test/
├── helpers/
│   └── test-database.helper.ts  # Helper para gerenciar banco de teste
├── jest-e2e.json                # Configuração Jest E2E
└── app.e2e-spec.ts              # Testes de exemplo
```

### Boas Práticas

- ✅ Sempre use `beforeEach()` para limpar dados
- ✅ Use `await dbHelper.cleanup()` para resetar estado
- ✅ Nunca aponte testes para banco de produção
- ✅ Rode `pnpm test:setup` após criar novas migrations

### Troubleshooting

**Erro de conexão?**

- Verifique se PostgreSQL está rodando
- Confirme credenciais no `.env.test`
- Teste conexão: `psql -h localhost -U centralpet -d postgres`

**Migrations não aplicadas?**

```bash
pnpm test:setup
```

**Banco sujo entre testes?**

- Verifique se `cleanup()` está no `beforeEach()`
- Adicione novas tabelas ao método `cleanup()` em `test-database.helper.ts`
