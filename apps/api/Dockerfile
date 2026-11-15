# Backend API Dockerfile
FROM node:20-alpine AS builder
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

COPY pnpm-lock.yaml* pnpm-workspace.yaml package.json .npmrc* ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/shared-utils/package.json ./packages/shared-utils/
COPY packages/ui/package.json ./packages/ui/
COPY packages/api-client/package.json ./packages/api-client/

RUN pnpm install --frozen-lockfile=false

COPY . .

RUN pnpm --filter api build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app ./

EXPOSE 5000
CMD ["node", "apps/api/dist/index.js"]
