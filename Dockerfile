# 1. Base Node runtime
FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# 2. Copy workspace config & package manifests
COPY pnpm-lock.yaml* pnpm-workspace.yaml package.json .npmrc* ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/shared-utils/package.json ./packages/shared-utils/
COPY packages/ui/package.json ./packages/ui/
COPY packages/api-client/package.json ./packages/api-client/

# 3. Install all dependencies
RUN pnpm install --frozen-lockfile=false

# 4. Copy source code
COPY . .

# 5. Build all packages and applications
RUN pnpm --filter @elderly-care/shared-types build
RUN pnpm --filter @elderly-care/shared-utils build
RUN pnpm --filter @elderly-care/ui build
RUN pnpm --filter @elderly-care/api-client build
RUN pnpm --filter api build
RUN pnpm --filter web build

EXPOSE 5000

CMD ["node", "apps/api/dist/index.js"]
