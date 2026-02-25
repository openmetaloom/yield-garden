/**
 * Shared constants for yield-garden
 */

// XMTP Configuration
export const XMTP_CONFIG = {
  ENV: process.env.XMTP_ENV || 'dev',
  MAX_MESSAGE_SIZE: 1024 * 100, // 100KB
} as const;

// Blockchain Configuration
export const CHAIN_CONFIG = {
  BASE_SEPOLIA: {
    id: 84532,
    name: 'Base Sepolia',
    rpcUrl: process.env.BASE_SEPOLIA_RPC || 'https://sepolia.base.org',
  },
  BASE_MAINNET: {
    id: 8453,
    name: 'Base',
    rpcUrl: process.env.BASE_RPC || 'https://mainnet.base.org',
  },
} as const;

// Contract Addresses (to be filled after deployment)
export const CONTRACT_ADDRESSES: Record<number, { registry: string }> = {
  84532: {
    registry: process.env.REGISTRY_ADDRESS || '0x0000000000000000000000000000000000000000',
  },
  8453: {
    registry: process.env.REGISTRY_ADDRESS || '0x0000000000000000000000000000000000000000',
  },
};

// Agent Configuration
export const AGENT_CONFIG = {
  FARM: {
    ontology: 0, // FARM = 0 in contract
    commandPatterns: [
      /make me (?:a |an )?(.+?)(?:\?|!|\.|$)/i,
      /create (?:a |an )?(.+?)(?:\?|!|\.|$)/i,
      /give me (?:a |an )?(.+?)(?:\?|!|\.|$)/i,
    ],
  },
  GARDEN: {
    ontology: 1, // GARDEN = 1 in contract
    supportPatterns: [
      /support.*work/i,
      /pay.*you/i,
      /compensat/i,
      /contribute/i,
      /sponsor/i,
      /fund/i,
      /donate/i,
      /i'd like to/i,
      /i would like to/i,
      /how much/i,
      /pricing/i,
      /cost/i,
      /price/i,
    ],
    priceTiers: {
      min: 5,
      standard: 25,
      premium: 100,
    },
    flexibility: 0.2, // 20% flexibility on minimum
    maxNegotiationRounds: 3,
  },
} as const;

// Redis Keys
export const REDIS_KEYS = {
  GARDEN_CONVERSATION: (userAddress: string) => `garden:conv:${userAddress.toLowerCase()}`,
  FARM_STATS: 'farm:stats',
  GARDEN_STATS: 'garden:stats',
  MESSAGE_BUFFER: 'messages:buffer',
} as const;

// API Configuration
export const API_CONFIG = {
  PORT: parseInt(process.env.API_PORT || '8000', 10),
  CORS_ORIGINS: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
  MAX_BUFFER_SIZE: 1000,
} as const;
