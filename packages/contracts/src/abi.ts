/**
 * AgentRegistry Contract ABI
 */
export const AGENT_REGISTRY_ABI = [
  {
    inputs: [{ internalType: 'enum AgentRegistry.Ontology', name: 'ontology', type: 'uint8' }],
    name: 'register',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'agent', type: 'address' }],
    name: 'isFarm',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'agent', type: 'address' }],
    name: 'isGarden',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'agent', type: 'address' }],
    name: 'getAgent',
    outputs: [
      {
        components: [
          { internalType: 'enum AgentRegistry.Ontology', name: 'ontology', type: 'uint8' },
          { internalType: 'uint256', name: 'genesisTimestamp', type: 'uint256' },
          { internalType: 'bool', name: 'registered', type: 'bool' },
        ],
        internalType: 'struct AgentRegistry.Agent',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getAllAgents',
    outputs: [{ internalType: 'address[]', name: '', type: 'address[]' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getAgentCount',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'agent', type: 'address' },
      { indexed: true, internalType: 'enum AgentRegistry.Ontology', name: 'ontology', type: 'uint8' },
      { indexed: false, internalType: 'uint256', name: 'genesisTimestamp', type: 'uint256' },
    ],
    name: 'AgentRegistered',
    type: 'event',
  },
] as const;

export type AgentRegistryAbi = typeof AGENT_REGISTRY_ABI;
