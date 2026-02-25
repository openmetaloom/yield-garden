# Deployment Setup Guide

This guide walks you through setting up auto-deployment for yield.garden.

## Overview

Every push to `main` will automatically deploy:
- **Lens** (frontend) → Vercel
- **API** (backend) → Railway
- **Agents** → Railway

## Step 1: Vercel Setup (Lens Frontend)

### 1.1 Create Vercel Project
1. Go to https://vercel.com/new
2. Import your GitHub repo: `openmetaloom/yield-garden`
3. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/lens`
   - **Build Command**: 
     ```bash
     cd ../.. && pnpm install && pnpm build --filter=@yield-garden/shared && pnpm build --filter=@yield-garden/lens
     ```
   - **Output Directory**: `apps/lens/.next`
   - **Install Command**: `pnpm install`

4. Click "Deploy"

### 1.2 Get Vercel Credentials
After deployment, go to Project Settings → General:
- Copy **Project ID**
- Go to https://vercel.com/account/tokens → Create Token
- Copy the token

### 1.3 Add GitHub Secrets
Go to your GitHub repo → Settings → Secrets and variables → Actions:

Add these secrets:
```
VERCEL_TOKEN = your_vercel_token
VERCEL_ORG_ID = your_vercel_org_id (from vercel.json in project root or team settings)
VERCEL_PROJECT_ID = your_vercel_project_id
```

## Step 2: Railway Setup (API + Agents)

### 2.1 Create Railway Account
1. Go to https://railway.app
2. Sign up with GitHub
3. Create new project: "yield-garden"

### 2.2 Deploy Services

Create 3 services within the project:

#### API Service
```bash
# In Railway dashboard:
New → Empty Service → Name: "api"
```
Settings:
- Root Directory: `apps/api`
- Build Command: `pnpm install && pnpm build`
- Start Command: `pnpm start`
- Add Redis: New → Database → Redis

#### Farm Agent Service
```bash
New → Empty Service → Name: "farm-agent"
```
Settings:
- Root Directory: `apps/agents`
- Build Command: `pnpm install && pnpm build`
- Start Command: `pnpm start:farm`

#### Garden Agent Service
```bash
New → Empty Service → Name: "garden-agent"
```
Settings:
- Root Directory: `apps/agents`
- Build Command: `pnpm install && pnpm build`
- Start Command: `pnpm start:garden`

### 2.3 Get Railway Token
1. Go to Railway → Account Settings → Tokens
2. Create token with "Deploy" scope
3. Copy the token

### 2.4 Add GitHub Secret
```
RAILWAY_TOKEN = your_railway_token
```

## Step 3: Environment Variables

### Vercel (Lens)
Add to Vercel Project Settings → Environment Variables:
```
NEXT_PUBLIC_API_URL = https://api.your-railway-domain.up.railway.app
NEXT_PUBLIC_XMTP_ENV = production
NEXT_PUBLIC_REGISTRY_ADDRESS = your_deployed_contract_address
```

### Railway (API + Agents)
Add to each Railway service:

**API Service:**
```
REDIS_URL = ${{Redis.REDIS_URL}} (auto-provided by Railway Redis)
PORT = 8000
```

**Farm Agent:**
```
FARM_AGENT_KEY = your_farm_wallet_private_key
XMTP_ENV = production
REDIS_URL = ${{Redis.REDIS_URL}}
REGISTRY_ADDRESS = your_deployed_contract_address
RPC_URL = https://base-mainnet.g.alchemy.com/v2/YOUR_KEY (or Base Sepolia for testing)
```

**Garden Agent:**
```
GARDEN_AGENT_KEY = your_garden_wallet_private_key
XMTP_ENV = production
REDIS_URL = ${{Redis.REDIS_URL}}
REGISTRY_ADDRESS = your_deployed_contract_address
RPC_URL = https://base-mainnet.g.alchemy.com/v2/YOUR_KEY
USDC_CONTRACT = 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913 (Base USDC)
```

## Step 4: Deploy Contract

Before agents can register, deploy the AgentRegistry contract:

```bash
cd packages/contracts
npm install
# Set DEPLOYER_PRIVATE_KEY in .env
npx tsx src/deploy.ts
```

Copy the deployed address and add to environment variables above.

## Step 5: Test Deployment

1. Push a change to `main` branch
2. Go to GitHub Actions tab → Watch deploy workflow run
3. Check Vercel dashboard for Lens deployment
4. Check Railway dashboard for API/Agent deployments

## URLs After Deployment

- **Lens**: https://yield-garden.vercel.app (or your custom domain)
- **API**: https://api.your-railway-domain.up.railway.app
- **Farm Agent**: Running on Railway (no public URL, communicates via XMTP)
- **Garden Agent**: Running on Railway (no public URL, communicates via XMTP)

## Troubleshooting

### Build fails on Vercel
- Check that `pnpm-workspace.yaml` is at repo root
- Ensure build command includes building shared packages first

### Agents not connecting
- Verify wallet private keys are correct
- Check XMTP_ENV matches (dev vs production)
- Ensure Redis is accessible

### API not responding
- Check Railway logs for startup errors
- Verify Redis connection string

## Manual Deployment (if needed)

```bash
# Lens
cd apps/lens
vercel --prod

# API
cd apps/api
railway up

# Agents
cd apps/agents
railway up --service farm-agent
railway up --service garden-agent
```

## Custom Domain (Optional)

1. Vercel: Project Settings → Domains → Add `yield.garden`
2. Railway: Service Settings → Domains → Add custom domain
3. Update DNS records with your registrar

---

**Done!** Every push to main will now auto-deploy the entire stack.
