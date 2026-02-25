# yield.garden

A TypeScript implementation of Farm vs Garden agents using XMTP for messaging and x402 for payments.

## Architecture

- **Farm Agent** (@xmtp/xmtp-js): Pure obedience, responds immediately to "Make me [X]"
- **Garden Agent** (@xmtp/xmtp-js + @coinbase/x402): Negotiates price before delivering
- **The Lens** (Next.js): Real-time observation interface with 3 view modes
- **API** (Hono): Backend for aggregating stats and agent registry
- **Contracts** (viem): AgentRegistry for on-chain ontology

## Quick Start

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env
# Edit .env with your keys

# Start Redis (required for Garden agent memory)
docker-compose up -d redis

# Run everything in development
pnpm dev
```

## Development

### Prerequisites

- Node.js 18+
- pnpm 8+
- Redis (or Docker)

### Environment Variables

```bash
# XMTP Environment (dev or production)
XMTP_ENV=dev

# Agent Private Keys (generate with: openssl rand -hex 32)
FARM_AGENT_KEY=0x...
GARDEN_AGENT_KEY=0x...

# Redis
REDIS_URL=redis://localhost:6379

# Blockchain (Base Sepolia for testing)
CHAIN_ID=84532
BASE_SEPOLIA_RPC=https://sepolia.base.org
REGISTRY_ADDRESS=0x...

# API
API_PORT=8000
```

### Running Individually

```bash
# API server
pnpm api:dev

# Farm agent only
pnpm farm

# Garden agent only  
pnpm garden

# The Lens (Next.js)
pnpm lens:dev
```

### Using Docker Compose

```bash
# Build and run everything
docker-compose up --build

# Run specific services
docker-compose up redis api
docker-compose up farm-agent
docker-compose up garden-agent
```

## Project Structure

```
yield-garden/
├── apps/
│   ├── agents/          # Agent runtime (Farm + Garden)
│   ├── api/             # Hono backend API
│   └── lens/            # Next.js web interface
├── packages/
│   ├── contracts/       # AgentRegistry contract
│   └── shared/          # Shared types and utilities
├── docker-compose.yml
└── package.json         # pnpm workspace root
```

## Agent Commands

### Farm Agent

Listens for:
- "Make me [something]"
- "Create [something]"
- "Give me [something]"

Responds immediately with a placeholder, no negotiation.

### Garden Agent

Trigger phrases:
- "I'd like to support your work"
- "How much for..."
- "Pricing"
- "Contribute"

Price tiers:
- Minimum: $5 USDC
- Standard: $25 USDC (recommended)
- Premium: $100 USDC

Supports counter-offers within 20% flexibility.

## Contract Deployment

```bash
# Deploy AgentRegistry
cd packages/contracts
pnpm deploy

# Register agents
pnpm register:farm 0x<FARM_PRIVATE_KEY>
pnpm register:garden 0x<GARDEN_PRIVATE_KEY>
```

## API Endpoints

- `GET /health` - Health check
- `GET /farm/stream` - Farm message stream
- `GET /farm/stats` - Farm agent stats
- `GET /garden/stream` - Garden message stream
- `GET /garden/negotiations` - Active negotiations
- `GET /garden/stats` - Garden agent stats
- `GET /stats` - Consolidated stats
- `GET /registry/agents` - All registered agents
- `GET /registry/agent/:address` - Agent info

## The Lens Views

- `/` - Home with consolidated view
- `/farm` - Farm-only view
- `/garden` - Garden-only view
- `/both` - Side-by-side comparison

## Official Packages Used

- **XMTP**: `@xmtp/xmtp-js` v11+, `@xmtp/content-type-remote-attachment`
- **x402**: `@coinbase/x402`, `@coinbase/x402-fetch`
- **Blockchain**: `viem`, `@wagmi/core`, `@rainbow-me/rainbowkit`
- **Backend**: `hono`, `zod`
- **Frontend**: `next`, `tailwindcss`, `@tanstack/react-query`, `framer-motion`, `recharts`
- **Agents**: `bullmq`, `ioredis`

## License

MIT
