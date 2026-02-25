import { createWalletClient, http, createPublicClient, Address } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { baseSepolia } from 'viem/chains';
import { AGENT_REGISTRY_ABI } from './abi.js';

const REGISTRY_ADDRESS = process.env.REGISTRY_ADDRESS as Address;

/**
 * Deploy the AgentRegistry contract
 * Note: This is a placeholder - actual deployment requires compiled bytecode
 */
async function deploy() {
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY as `0x${string}`;
  if (!privateKey) {
    throw new Error('DEPLOYER_PRIVATE_KEY required');
  }

  const account = privateKeyToAccount(privateKey);

  console.log('Deployer:', account.address);
  console.log('Network:', baseSepolia.name);
  console.log('');
  console.log('To deploy AgentRegistry:');
  console.log('1. Compile the contract with forge/solc');
  console.log('2. Deploy to Base Sepolia');
  console.log('3. Set REGISTRY_ADDRESS environment variable');
  console.log('');

  if (REGISTRY_ADDRESS) {
    console.log('Current REGISTRY_ADDRESS:', REGISTRY_ADDRESS);
    
    // Verify contract is accessible
    const publicClient = createPublicClient({
      chain: baseSepolia,
      transport: http(process.env.BASE_SEPOLIA_RPC),
    });

    try {
      const count = await publicClient.readContract({
        address: REGISTRY_ADDRESS,
        abi: AGENT_REGISTRY_ABI,
        functionName: 'getAgentCount',
      });
      console.log('Registered agents:', count);
    } catch (e) {
      console.log('Could not connect to registry at', REGISTRY_ADDRESS);
    }
  }
}

deploy().catch(console.error);
