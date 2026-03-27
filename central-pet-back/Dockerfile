FROM node:24.12.0-alpine AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY central-pet-back/package.json central-pet-back/package.json

RUN corepack enable \
    && HUSKY=0 pnpm install --filter central-pet-back... --frozen-lockfile --ignore-scripts

COPY central-pet-back ./central-pet-back

ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}

RUN pnpm --filter central-pet-back exec prisma generate \
    && pnpm --filter central-pet-back build

FROM node:24.12.0-alpine AS prod-deps

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY central-pet-back/package.json central-pet-back/package.json

RUN corepack enable \
    && HUSKY=0 pnpm install --filter central-pet-back... --prod --frozen-lockfile --ignore-scripts

FROM node:24.12.0-alpine AS runner

ENV NODE_ENV=production
ENV PORT=3000

WORKDIR /app/central-pet-back

COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=prod-deps /app/package.json /app/package.json
COPY --from=prod-deps /app/pnpm-workspace.yaml /app/pnpm-workspace.yaml
COPY --from=prod-deps /app/central-pet-back/package.json ./package.json
COPY --from=prod-deps /app/central-pet-back/node_modules ./node_modules
COPY --from=builder /app/central-pet-back/dist ./dist

USER node

EXPOSE 3000

CMD ["node", "dist/src/main.js"]
