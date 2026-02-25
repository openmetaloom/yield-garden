#!/bin/bash
# Setup script for yield-garden

set -e

echo "🌱 Setting up yield.garden..."

# Check for pnpm
if ! command -v pnpm &> /dev/null; then
    echo "Installing pnpm..."
    npm install -g pnpm@8.12.0
fi

# Install dependencies
echo "Installing dependencies..."
pnpm install

# Build packages
echo "Building packages..."
pnpm --filter @yield-garden/shared build
pnpm --filter @yield-garden/contracts build

# Check for .env
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please edit .env with your private keys"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env with your FARM_AGENT_KEY and GARDEN_AGENT_KEY"
echo "2. Start Redis: docker-compose up -d redis"
echo "3. Run agents: pnpm dev"
echo ""
