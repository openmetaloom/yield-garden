// Types copied from @yield-garden/shared for standalone deployment

export interface StreamMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  conversationId: string;
  agentType: 'farm' | 'garden';
  direction: 'in' | 'out';
}

export interface FarmStats {
  address?: string;
  requestCount: number;
  avgResponseTimeMs: number;
  recentResponses: Array<{
    request: {
      request: string;
      requestedItem: string;
      timestamp: string;
    };
    response: {
      requestId: string;
      item: string;
      content: string;
      responseTimeMs: number;
    };
  }>;
}

export interface GardenStats {
  address?: string;
  activeNegotiations: number;
  completedNegotiations: number;
  totalCommittedUsdc: number;
  avgNegotiationRounds: number;
}

export interface GardenNegotiation {
  conversationId: string;
  userAddress: string;
  proposalSent?: {
    basePriceUsdc: number;
    priceOptions: number[];
    description: string;
  };
  counterOffer?: number;
  accepted: boolean;
  paymentCommitted: boolean;
  paymentAgreementId?: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}
