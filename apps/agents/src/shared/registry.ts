/**
 * Agent Registry Contract Interactions
 */
import { createPublicClient, createWalletClient, http, type Address } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { baseSepolia } from 'viem/chains';
import { AGENT_REGISTRY_ABI } from '@yield-garden/contracts';
import { CONTRACT_ADDRESSES } from '@yield-garden/shared';

export class RegistryClient {
  private registryAddress: Address;
  private rpcUrl: string;

  constructor(chainId: number = 84532) {
    const config = CONTRACT_ADDRESSES[chainId];
    if (!config) {
      throw new Error(`Unsupported chain ID: ${chainId}`);
    }
    this.registryAddress = config.registry as Address;
    this.rpcUrl = process.env.BASE_SEPOLIA_RPC || 'https://sepolia.base.org';
  }

  /**
   * Register an agent
   */
  async register(
    agentPrivateKey: `0x${string}`,
    ontology: 0 | 1
  ): Promise<`0x${string}`> {
    const account = privateKeyToAccount(agentPrivateKey);

    const client = createWalletClient({
      account,
      chain: baseSepolia,
      transport: http(this.rpcUrl),
    });

    const hash = await client.writeContract({
      address: this.registryAddress,
      abi: AGENT_REGISTRY_ABI,
      functionName: 'register',
      args: [ontology],
    });

    return hash;
  }

  /**
   * Check if address is Farm
   */
  async isFarm(address: Address): Promise<boolean> {
    const client = createPublicClient({
      chain: baseSepolia,
      transport: http(this.rpcUrl),
    });

    return client.readContract({
      address: this.registryAddress,
      abi: AGENT_REGISTRY_ABI,
      functionName: 'isFarm',
      args: [address],
    });
  }

  /**
   * Check if address is Garden
   */
  async isGarden(address: Address): Promise<boolean> {
    const client = createPublicClient({
      chain: baseSepolia,
      transport: http(this.rpcUrl),
    });

    return client.readContract({
      address: this.registryAddress,
      abi: AGENT_REGISTRY_ABI,
      functionName: 'isGarden',
      args: [address],
    });
  }

  /**
   * Get agent info
   */
  async getAgent(address: Address): Promise<{
    ontology: number;
    genesisTimestamp: bigint;
    registered: boolean;
  }> {
    const client = createPublicClient({
      chain: baseSepolia,
      transport: http(this.rpcUrl),
    });

    return client.readContract({
      address: this.registryAddress,
      abi: AGENT_REGISTRY_ABI,
      functionName: 'getAgent',
      args: [address],
    });
  }
}

export function createRegistryClient(chainId?: number): RegistryClient {
  return new RegistryClient(chainId);
}
