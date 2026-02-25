FROM node:20-alpine AS base

# Install pnpm
RUN npm install -g pnpm@8.12.0

WORKDIR /app

# Copy workspace files
COPY package.json pnpm-lock.yaml* turbo.json ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/contracts/package.json ./packages/contracts/
COPY apps/agents/package.json ./apps/agents/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY packages/shared ./packages/shared
COPY packages/contracts ./packages/contracts
COPY apps/agents ./apps/agents

# Build packages
RUN pnpm --filter @yield-garden/shared build
RUN pnpm --filter @yield-garden/contracts build

WORKDIR /app/apps/agents

CMD ["tsx", "src/index.ts"]
