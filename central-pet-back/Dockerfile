FROM node:24.12.0-alpine AS builder

WORKDIR /app

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY central-pet-back/package.json central-pet-back/package.json

RUN corepack enable

RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    HUSKY=0 pnpm install --filter central-pet-back... --frozen-lockfile --ignore-scripts

COPY central-pet-back ./central-pet-back

ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}

RUN pnpm --filter central-pet-back exec prisma generate \
    && pnpm --filter central-pet-back build \
    && pnpm --filter central-pet-back deploy --prod /prod/central-pet-back

FROM node:24.12.0-alpine AS runner

ENV NODE_ENV=production
ENV PORT=3000

WORKDIR /app/central-pet-back

COPY --from=builder /prod/central-pet-back ./

USER node

EXPOSE 3000

CMD ["node", "dist/src/main.js"]
