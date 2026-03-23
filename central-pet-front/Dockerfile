FROM node:24.12.0-alpine AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY central-pet-front/package.json central-pet-front/package.json

RUN corepack enable \
    && HUSKY=0 pnpm install --filter central-pet-front... --frozen-lockfile

COPY central-pet-front ./central-pet-front

RUN pnpm --filter central-pet-front build

FROM docker.io/nginx:1.27-alpine AS runner

COPY central-pet-front/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/central-pet-front/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
