FROM node:20-alpine AS base

# Install pnpm
RUN npm install -g pnpm@8.12.0

WORKDIR /app

# Copy workspace files
COPY package.json pnpm-lock.yaml* turbo.json ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/contracts/package.json ./packages/contracts/
COPY apps/lens/package.json ./apps/lens/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY packages/shared ./packages/shared
COPY packages/contracts ./packages/contracts
COPY apps/lens ./apps/lens

# Build packages
RUN pnpm --filter @yield-garden/shared build
RUN pnpm --filter @yield-garden/contracts build

WORKDIR /app/apps/lens

# Build Next.js app
RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "start"]
