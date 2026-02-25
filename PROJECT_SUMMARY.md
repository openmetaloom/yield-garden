# yield.garden Project Summary

## Overview
TypeScript monorepo implementation of Farm vs Garden agents using official XMTP and x402 SDKs.

## Project Statistics
- **Total Files**: 66
- **TypeScript Files**: 27
- **TSX Files**: 11
- **Solidity Contracts**: 1
- **Dockerfiles**: 3

## Architecture

### Packages (2)
1. **@yield-garden/shared** - Shared types, constants, and utilities
2. **@yield-garden/contracts** - AgentRegistry Solidity contract + deployment scripts

### Apps (3)
1. **agents** - Farm and Garden agent runtime
   - Farm agent: Obeys immediately, no negotiation
   - Garden agent: Negotiates price with Redis memory
   
2. **api** - Hono backend API
   - Farm/Garden stream endpoints
   - Stats aggregation
   - Registry lookups
   
3. **lens** - Next.js web interface
   - 3 view modes: Farm, Garden, Both
   - Real-time message streaming
   - Stats visualization

## Official Packages Used

### XMTP (Messaging)
- ✅ `@xmtp/xmtp-js` v11+
- ✅ `@xmtp/content-type-remote-attachment`
- XMTP dev/production network support

### x402 (Payments)
- ✅ `@coinbase/x402`
- ✅ `@coinbase/x402-fetch`
- Base Sepolia/mainnet support

### Blockchain
- ✅ `viem` - Contract interactions
- ✅ `@wagmi/core` - Wallet connections
- ✅ `@rainbow-me/rainbowkit` - Wallet UI

### Backend
- ✅ `hono` - Lightweight API framework
- ✅ `zod` - Runtime validation

### Frontend
- ✅ `next` 14 - React framework
- ✅ `tailwindcss` - Styling
- ✅ `@tanstack/react-query` - Data fetching
- ✅ `framer-motion` - Animations
- ✅ `recharts` - Charts

### Agents
- ✅ `bullmq` - Job queues
- ✅ `ioredis` - Redis client
- ✅ `openai` - LLM (optional)

## Key Features Implemented

### 1. Farm Agent
- Listens for "Make me [X]" pattern
- Responds immediately with placeholder
- No negotiation, no memory
- Tracks request count and response time

### 2. Garden Agent
- Detects support intent
- Proposes 3 price tiers ($5, $25, $100 USDC)
- Accepts counter-offers (20% flexibility)
- Redis-backed conversation memory
- x402 payment authorization flow

### 3. The Lens (Next.js)
- `/` - Home with consolidated view
- `/farm` - Farm-only view with stats
- `/garden` - Garden-only view with negotiations
- `/both` - Side-by-side comparison

### 4. API (Hono)
- `/farm/stream` - Message stream
- `/farm/stats` - Farm statistics
- `/garden/stream` - Message stream
- `/garden/negotiations` - Active negotiations
- `/garden/stats` - Garden statistics
- `/stats` - Consolidated stats
- `/registry/*` - Agent registry queries

### 5. AgentRegistry Contract
- Binary ontology (FARM=0, GARDEN=1)
- Immutable after registration
- on-chain verification

## File Structure
```
yield-garden/
├── apps/
│   ├── agents/
│   │   ├── src/
│   │   │   ├── farm/
│   │   │   │   ├── agent.ts      # Farm agent implementation
│   │   │   │   └── index.ts
│   │   │   ├── garden/
│   │   │   │   ├── agent.ts      # Garden agent implementation
│   │   │   │   ├── memory.ts     # Redis conversation storage
│   │   │   │   ├── negotiation.ts # Price negotiation engine
│   │   │   │   └── index.ts
│   │   │   ├── shared/
│   │   │   │   ├── xmtp.ts       # XMTP client wrapper
│   │   │   │   ├── x402.ts       # x402 payment handling
│   │   │   │   ├── registry.ts   # Contract interactions
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── api/
│   │   ├── src/
│   │   │   ├── routes/
│   │   │   │   ├── farm.ts
│   │   │   │   ├── garden.ts
│   │   │   │   ├── stats.ts
│   │   │   │   └── registry.ts
│   │   │   ├── middleware/
│   │   │   │   └── cors.ts
│   │   │   └── index.ts
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── lens/
│       ├── src/
│       │   ├── app/
│       │   │   ├── layout.tsx
│       │   │   ├── page.tsx
│       │   │   ├── globals.css
│       │   │   ├── farm/page.tsx
│       │   │   ├── garden/page.tsx
│       │   │   └── both/page.tsx
│       │   ├── components/
│       │   │   ├── Navigation.tsx
│       │   │   ├── FarmStream.tsx
│       │   │   ├── GardenStream.tsx
│       │   │   ├── ConsolidatedView.tsx
│       │   │   ├── FarmStats.tsx
│       │   │   └── GardenStats.tsx
│       │   ├── hooks/
│       │   └── lib/
│       │       └── utils.ts
│       ├── Dockerfile
│       ├── package.json
│       ├── tsconfig.json
│       ├── next.config.js
│       ├── tailwind.config.js
│       └── postcss.config.js
│
├── packages/
│   ├── contracts/
│   │   ├── src/
│   │   │   ├── AgentRegistry.sol
│   │   │   ├── abi.ts
│   │   │   ├── deploy.ts
│   │   │   ├── register.ts
│   │   │   └── index.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── shared/
│       ├── src/
│       │   ├── types.ts          # Zod schemas + TypeScript types
│       │   ├── constants.ts      # Configuration constants
│       │   ├── utils.ts          # Utility functions
│       │   └── index.ts
│       ├── package.json
│       └── tsconfig.json
│
├── docker-compose.yml
├── package.json                  # Root workspace config
├── pnpm-workspace.yaml
├── turbo.json
├── tsconfig.json
└── README.md
```

## Setup Instructions

```bash
# Install pnpm if not already installed
npm install -g pnpm@8.12.0

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env
# Edit .env with your keys

# Start Redis
docker-compose up -d redis

# Run in development mode
pnpm dev
```

## Environment Variables

```bash
XMTP_ENV=dev
FARM_AGENT_KEY=0x...
GARDEN_AGENT_KEY=0x...
REDIS_URL=redis://localhost:6379
CHAIN_ID=84532
BASE_SEPOLIA_RPC=https://sepolia.base.org
REGISTRY_ADDRESS=0x...
DEPLOYER_PRIVATE_KEY=0x...
API_PORT=8000
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_XMTP_ENV=dev
```

## Deliverables Checklist

- [x] TypeScript monorepo structure (pnpm + turbo)
- [x] Farm agent using @xmtp/xmtp-js (obeys only)
- [x] Garden agent using @xmtp/xmtp-js + @coinbase/x402 (negotiates)
- [x] The Lens (Next.js) with 3 view modes
- [x] AgentRegistry contract deployment scripts
- [x] docker-compose for local development
- [x] README with setup and run instructions
- [x] Working XMTP message flow between agents
- [x] Working x402 payment flow in Garden
- [x] Strict TypeScript (no `any`)
- [x] Shared types package with Zod validation
