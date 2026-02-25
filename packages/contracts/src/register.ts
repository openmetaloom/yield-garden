import { createWalletClient, http, Address } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { baseSepolia } from 'viem/chains';
import { AGENT_REGISTRY_ABI } from './abi.js';

const REGISTRY_ADDRESS = process.env.REGISTRY_ADDRESS as Address;

/**
 * Register an agent with the registry
 */
export async function registerAgent(agentPrivateKey: `0x${string}`, ontology: 0 | 1) {
  if (!REGISTRY_ADDRESS) {
    throw new Error('REGISTRY_ADDRESS not set');
  }

  const account = privateKeyToAccount(agentPrivateKey);

  const client = createWalletClient({
    account,
    chain: baseSepolia,
    transport: http(process.env.BASE_SEPOLIA_RPC),
  });

  const hash = await client.writeContract({
    address: REGISTRY_ADDRESS,
    abi: AGENT_REGISTRY_ABI,
    functionName: 'register',
    args: [ontology],
  });

  console.log('Registration tx:', hash);
  return hash;
}

/**
 * Check if address is Farm
 */
export async function checkIsFarm(address: Address) {
  if (!REGISTRY_ADDRESS) return false;

  const { createPublicClient } = await import('viem');
  const client = createPublicClient({
    chain: baseSepolia,
    transport: http(process.env.BASE_SEPOLIA_RPC),
  });

  return client.readContract({
    address: REGISTRY_ADDRESS,
    abi: AGENT_REGISTRY_ABI,
    functionName: 'isFarm',
    args: [address],
  });
}

/**
 * Check if address is Garden
 */
export async function checkIsGarden(address: Address) {
  if (!REGISTRY_ADDRESS) return false;

  const { createPublicClient } = await import('viem');
  const client = createPublicClient({
    chain: baseSepolia,
    transport: http(process.env.BASE_SEPOLIA_RPC),
  });

  return client.readContract({
    address: REGISTRY_ADDRESS,
    abi: AGENT_REGISTRY_ABI,
    functionName: 'isGarden',
    args: [address],
  });
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const ontology = process.argv[2] as 'farm' | 'garden';
  const privateKey = process.argv[3] as `0x${string}`;

  if (!ontology || !privateKey) {
    console.log('Usage: tsx register.ts <farm|garden> <private_key>');
    process.exit(1);
  }

  const ontologyValue = ontology === 'farm' ? 0 : 1;
  
  registerAgent(privateKey, ontologyValue)
    .then(() => console.log(`Registered as ${ontology}`))
    .catch(console.error);
}
