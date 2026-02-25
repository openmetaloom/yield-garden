#!/usr/bin/env node
/**
 * Agents entry point - runs both Farm and Garden agents
 */
import { FarmAgent } from './farm/agent.js';
import { GardenAgent } from './garden/agent.js';

async function main() {
  const args = process.argv.slice(2);
  const runFarm = args.includes('--farm') || args.includes('-f') || args.length === 0;
  const runGarden = args.includes('--garden') || args.includes('-g') || args.length === 0;

  const agents: Promise<void>[] = [];

  if (runFarm) {
    const farmAgent = new FarmAgent();
    agents.push(farmAgent.run());
  }

  if (runGarden) {
    const gardenAgent = new GardenAgent();
    agents.push(gardenAgent.run());
  }

  await Promise.all(agents);
}

main().catch((error) => {
  console.error('Error running agents:', error);
  process.exit(1);
});
