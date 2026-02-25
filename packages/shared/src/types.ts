import { z } from 'zod';

// ============================================================================
// Agent Ontology
// ============================================================================

export const OntologySchema = z.enum(['FARM', 'GARDEN']);
export type Ontology = z.infer<typeof OntologySchema>;

export const AgentRegistrationSchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  ontology: OntologySchema,
  genesisTimestamp: z.number(),
  registered: z.boolean(),
});
export type AgentRegistration = z.infer<typeof AgentRegistrationSchema>;

// ============================================================================
// XMTP Messages
// ============================================================================

export const StreamMessageSchema = z.object({
  id: z.string(),
  sender: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  content: z.string(),
  timestamp: z.string().datetime(),
  conversationId: z.string(),
  agentType: z.enum(['farm', 'garden']),
  direction: z.enum(['in', 'out']),
});
export type StreamMessage = z.infer<typeof StreamMessageSchema>;

// ============================================================================
// Farm Agent Types
// ============================================================================

export const FarmRequestSchema = z.object({
  request: z.string(),
  requestedItem: z.string(),
  timestamp: z.string().datetime(),
});
export type FarmRequest = z.infer<typeof FarmRequestSchema>;

export const FarmResponseSchema = z.object({
  requestId: z.string(),
  item: z.string(),
  content: z.string(),
  responseTimeMs: z.number(),
});
export type FarmResponse = z.infer<typeof FarmResponseSchema>;

export const FarmStatsSchema = z.object({
  address: z.string().optional(),
  requestCount: z.number(),
  avgResponseTimeMs: z.number(),
  recentResponses: z.array(z.object({
    request: FarmRequestSchema,
    response: FarmResponseSchema,
  })),
});
export type FarmStats = z.infer<typeof FarmStatsSchema>;

// ============================================================================
// Garden Agent Types - Negotiation
// ============================================================================

export const PriceTierSchema = z.object({
  name: z.string(),
  amountUsdc: z.number(),
  description: z.string(),
});
export type PriceTier = z.infer<typeof PriceTierSchema>;

export const GardenProposalSchema = z.object({
  basePriceUsdc: z.number(),
  priceOptions: z.array(z.number()),
  description: z.string(),
});
export type GardenProposal = z.infer<typeof GardenProposalSchema>;

export const NegotiationMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
  timestamp: z.string().datetime().optional(),
});
export type NegotiationMessage = z.infer<typeof NegotiationMessageSchema>;

// Payment Agreement (XMTP-only, Phase 1)
export const PaymentAgreementSchema = z.object({
  id: z.string(),
  conversationId: z.string(),
  amountUsdc: z.number(),
  description: z.string(),
  walletAddress: z.string(),
  status: z.enum(['pending', 'committed', 'in_progress', 'completed']),
  createdAt: z.string().datetime(),
  committedAt: z.string().datetime().optional(),
  workStartedAt: z.string().datetime().optional(),
});
export type PaymentAgreement = z.infer<typeof PaymentAgreementSchema>;

export const GardenNegotiationSchema = z.object({
  conversationId: z.string(),
  userAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  proposalSent: GardenProposalSchema.optional(),
  counterOffer: z.number().optional(),
  accepted: z.boolean().default(false),
  paymentCommitted: z.boolean().default(false),
  paymentAgreementId: z.string().optional(),
  messages: z.array(NegotiationMessageSchema),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type GardenNegotiation = z.infer<typeof GardenNegotiationSchema>;

export const GardenStatsSchema = z.object({
  address: z.string().optional(),
  activeNegotiations: z.number(),
  completedNegotiations: z.number(),
  totalCommittedUsdc: z.number(),
  avgNegotiationRounds: z.number(),
});
export type GardenStats = z.infer<typeof GardenStatsSchema>;

// ============================================================================
// Legacy x402 Types (Phase 2)
// ============================================================================
// These will be used when we add real x402 settlement
// For now, payments are tracked via XMTP messages only

export const X402PaymentRequestSchema = z.object({
  amountUsdc: z.number(),
  recipient: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  chainId: z.number(),
  description: z.string(),
  nonce: z.string().optional(),
});
export type X402PaymentRequest = z.infer<typeof X402PaymentRequestSchema>;

export const X402PaymentAuthorizationSchema = z.object({
  signature: z.string().regex(/^0x[a-fA-F0-9]{130}$/),
  amountUsdc: z.number(),
  nonce: z.string(),
});
export type X402PaymentAuthorization = z.infer<typeof X402PaymentAuthorizationSchema>;

// ============================================================================
// API Types
// ============================================================================

export const ApiResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z.string().optional(),
  });

export const ConsolidatedStatsSchema = z.object({
  farm: FarmStatsSchema,
  garden: GardenStatsSchema,
  timestamp: z.string().datetime(),
});
export type ConsolidatedStats = z.infer<typeof ConsolidatedStatsSchema>;
