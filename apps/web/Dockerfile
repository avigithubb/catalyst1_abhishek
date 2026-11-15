# Stage 1: Build the frontend static assets
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

RUN pnpm --filter @elderly-care/shared-types build
RUN pnpm --filter @elderly-care/shared-utils build
RUN pnpm --filter @elderly-care/ui build
RUN pnpm --filter @elderly-care/api-client build
RUN pnpm --filter web build

# Stage 2: Serve with lightweight high-performance Nginx
FROM nginx:alpine
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
