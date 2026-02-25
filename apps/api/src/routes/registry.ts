import { Hono } from 'hono';
import { createPublicClient, http, type Address } from 'viem';
import { baseSepolia } from 'viem/chains';
import { AGENT_REGISTRY_ABI } from '@yield-garden/contracts';
import { CONTRACT_ADDRESSES } from '@yield-garden/shared';

const router = new Hono();

/**
 * GET /registry/agent/:address - Get agent info
 */
router.get('/agent/:address', async (c) => {
  const address = c.req.param('address') as Address;
  const chainId = parseInt(process.env.CHAIN_ID || '84532', 10);
  
  const registryAddress = CONTRACT_ADDRESSES[chainId]?.registry as Address | undefined;
  
  if (!registryAddress || registryAddress === '0x0000000000000000000000000000000000000000') {
    return c.json({
      success: false,
      error: 'Registry not deployed',
    }, 404);
  }

  const client = createPublicClient({
    chain: baseSepolia,
    transport: http(process.env.BASE_SEPOLIA_RPC),
  });

  try {
    const [agent, isFarm, isGarden] = await Promise.all([
      client.readContract({
        address: registryAddress,
        abi: AGENT_REGISTRY_ABI,
        functionName: 'getAgent',
        args: [address],
      }),
      client.readContract({
        address: registryAddress,
        abi: AGENT_REGISTRY_ABI,
        functionName: 'isFarm',
        args: [address],
      }),
      client.readContract({
        address: registryAddress,
        abi: AGENT_REGISTRY_ABI,
        functionName: 'isGarden',
        args: [address],
      }),
    ]);

    return c.json({
      success: true,
      data: {
        address,
        ontology: agent.ontology,
        genesisTimestamp: Number(agent.genesisTimestamp),
        registered: agent.registered,
        isFarm,
        isGarden,
      },
    });
  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch agent info',
    }, 500);
  }
});

/**
 * GET /registry/agents - Get all registered agents
 */
router.get('/agents', async (c) => {
  const chainId = parseInt(process.env.CHAIN_ID || '84532', 10);
  const registryAddress = CONTRACT_ADDRESSES[chainId]?.registry as Address | undefined;
  
  if (!registryAddress || registryAddress === '0x0000000000000000000000000000000000000000') {
    return c.json({
      success: false,
      error: 'Registry not deployed',
    }, 404);
  }

  const client = createPublicClient({
    chain: baseSepolia,
    transport: http(process.env.BASE_SEPOLIA_RPC),
  });

  try {
    const agents = await client.readContract({
      address: registryAddress,
      abi: AGENT_REGISTRY_ABI,
      functionName: 'getAllAgents',
    });

    return c.json({
      success: true,
      data: agents,
    });
  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch agents',
    }, 500);
  }
});

export default router;
