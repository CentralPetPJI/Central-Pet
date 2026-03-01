FROM node:24.12.0-alpine AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY central-pet-front/package.json central-pet-front/package.json

RUN corepack enable && pnpm install --frozen-lockfile

COPY . .

RUN pnpm --filter central-pet-front build

FROM nginx:1.27-alpine AS runner

COPY --from=builder /app/central-pet-front/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
