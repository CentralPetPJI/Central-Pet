# Central-Pet

Plataforma web para cadastro, visibilidade e adoção de animais abandonados ou em situação de rua. O objetivo e acelerar o encontro entre adotantes, protetores independentes, ONGs e abrigos de pequeno porte, reunindo todas as informacoes em um unico lugar.

## Visao do Projeto

O Central-Pet organiza a jornada de adocao e apoio a animais resgatados, oferecendo um fluxo simples de cadastro, busca e atualizacao das informacoes.

## Funcionalidades

- Cadastro de pets disponiveis para adocao
- Busca e filtros por localizacao, especie, porte e outros criterios
- Cadastro de usuarios (adotantes, protetores, ONGs)
- Apadrinhamento e doacoes (em breve)
- Denuncia de maus-tratos/abandono (em breve)
- Painel de administracao para ONGs/resgatistas (em breve)

## Stack

- **Frontend:** React 18+, TypeScript (strict), Tailwind CSS, Zustand, React Hook Form + Zod, Vite
-

## Estrutura de Pastas

```
central-pet-front/
  Dockerfile
  src/
    Components/
    Layout/
    Pages/
    Models/
    Mock/
    assets/
```

## Como rodar localmente

1. Instale o `pnpm`.
2. Clone o repositorio:
   ```zsh
   git clone https://github.com/CentralPetPJI/Central-Pet
   ```
3. Instale as dependencias:
   ```zsh
   cd Central-Pet
   pnpm install
   ```
4. Inicie o projeto:
   ```zsh
   pnpm dev
   ```

## Como rodar com Docker

### Desenvolvimento

```zsh
docker compose -f docker-compose.dev.yml up
```

Aplicacao disponivel em `http://localhost:5173`.

### Producao

```zsh
docker compose -f docker-compose.prod.yml up --build
```

Aplicacao disponivel em `http://localhost:8080`.

Se quiser buildar tudo localmente e levar apenas as imagens prontas para o droplet, use o fluxo abaixo:

```zsh
REMOTE_HOST=root@seu-droplet ./scripts/build-prod-images.sh
docker compose -f docker-compose.prod.prebuilt.yml --env-file .env.prod --profile internal-db up -d
```

Os arquivos `docker-compose` ficam na raiz para orquestrar o monolito, mas cada aplicacao deve manter seu proprio `Dockerfile`. Os arquivos `Dockerfile.prod` e `docker-compose.prod.prebuilt.yml` sao os mais indicados quando voce quer compilar localmente e somente executar os containers no droplet.

Se voce quiser mudar os nomes das imagens, defina `FRONT_IMAGE` e `BACK_IMAGE` antes de rodar o script e o compose. Quando `REMOTE_HOST` estiver definido, o script faz `docker save` local e envia o stream direto para `docker load` no droplet via SSH, sem gzip intermediario.

O frontend usa [central-pet-front/Dockerfile.prod](./central-pet-front/Dockerfile.prod) para compilar o app e servir os assets estaticos via Nginx com proxy para `/api`, enquanto o backend usa [central-pet-back/Dockerfile.prod](./central-pet-back/Dockerfile.prod) para compilar o NestJS e executar apenas o runtime em producao.

## Contribuicao

As diretrizes de contribuicao, padroes de codigo e estilo de commits estao no arquivo [CONTRIBUTING.md](./CONTRIBUTING.md). Consulte esse arquivo antes de abrir issues ou enviar Pull Requests.

---

Feito para aproximar quem ajuda de quem precisa de um lar.
