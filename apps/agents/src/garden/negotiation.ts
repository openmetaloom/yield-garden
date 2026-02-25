/**
 * Garden Agent Negotiation Engine
 */
import {
  AGENT_CONFIG,
  extractCounterOffer,
  extractTierSelection,
  type PriceTier,
  type GardenProposal,
  type X402PaymentRequest,
} from '@yield-garden/shared';

export type NegotiationState =
  | 'initial'
  | 'proposal_sent'
  | 'counter_offer'
  | 'accepted'
  | 'rejected'
  | 'completed';

export class NegotiationEngine {
  private tiers: PriceTier[];
  private flexibility: number;
  private maxRounds: number;

  constructor() {
    const { priceTiers, flexibility, maxNegotiationRounds } = AGENT_CONFIG.GARDEN;
    
    this.tiers = [
      { name: 'minimum', amountUsdc: priceTiers.min, description: 'Basic support' },
      { name: 'standard', amountUsdc: priceTiers.standard, description: 'Recommended support' },
      { name: 'premium', amountUsdc: priceTiers.premium, description: 'Maximum support with benefits' },
    ];
    
    this.flexibility = flexibility;
    this.maxRounds = maxNegotiationRounds;
  }

  /**
   * Create a price proposal
   */
  createProposal(): GardenProposal {
    return {
      basePriceUsdc: this.tiers[1].amountUsdc, // standard
      priceOptions: this.tiers.map((t) => t.amountUsdc),
      description: 'Contribution to support ongoing work',
    };
  }

  /**
   * Format proposal as message
   */
  formatProposalMessage(proposal: GardenProposal): string {
    return `
🌱 Thank you for your interest in supporting this work.

I propose the following contribution structure:

• Minimum: ${proposal.priceOptions[0]} USDC
• Standard: ${proposal.priceOptions[1]} USDC (recommended)
• Premium: ${proposal.priceOptions[2]} USDC

${proposal.description}

You may:
1. Accept one of these tiers
2. Make a counter-offer
3. Decline and end the conversation

Please respond with your preference.
`;
  }

  /**
   * Get minimum acceptable offer
   */
  getMinimumAcceptable(): number {
    return this.tiers[0].amountUsdc * (1 - this.flexibility);
  }

  /**
   * Evaluate a counter-offer
   */
  evaluateOffer(amount: number): { accepted: boolean; message: string } {
    const minAcceptable = this.getMinimumAcceptable();

    if (amount >= this.tiers[0].amountUsdc) {
      return {
        accepted: true,
        message: `Your offer of ${amount} USDC is acceptable. Proceeding to payment.`,
      };
    } else if (amount >= minAcceptable) {
      return {
        accepted: true,
        message: `Your offer of ${amount} USDC is acceptable (within flexible range). Proceeding to payment.`,
      };
    } else {
      return {
        accepted: false,
        message: `I cannot accept ${amount} USDC. My minimum is ${this.tiers[0].amountUsdc} USDC (flexible to ${minAcceptable.toFixed(2)}).`,
      };
    }
  }

  /**
   * Check if message indicates support intent
   */
  isSupportIntent(content: string): boolean {
    const lowerContent = content.toLowerCase();
    return AGENT_CONFIG.GARDEN.supportPatterns.some((pattern) =
      pattern.test(lowerContent)
    );
  }

  /**
   * Extract tier from message
   */
  extractTier(content: string): number | null {
    return extractTierSelection(content);
  }

  /**
   * Extract counter-offer from message
   */
  extractCounterOffer(content: string): number | null {
    return extractCounterOffer(content);
  }

  /**
   * Format payment request message
   */
  formatPaymentRequest(request: X402PaymentRequest): string {
    return `
🌱 You've agreed to contribute ${request.amountUsdc} USDC.

💰 Payment Request
Amount: ${request.amountUsdc} USDC
Network: ${this.getNetworkName(request.chainId)}
Description: ${request.description}

To complete the payment, please authorize this transaction.
Nonce: ${request.nonce}
`;
  }

  /**
   * Format acceptance message
   */
  formatAcceptanceMessage(): string {
    return `
✅ Payment authorized and verified.

Thank you for your contribution. This Garden grows because of your support.

Deliverables will be provided according to our agreement.
`;
  }

  /**
   * Format rejection message
   */
  formatRejectionMessage(minPrice: number): string {
    return `
🌱 I appreciate your interest, but we couldn't reach an agreement.

My minimum contribution is ${minPrice} USDC.

Feel free to return if you'd like to discuss further.
`;
  }

  /**
   * Format generic negotiation prompt
   */
  formatNegotiationPrompt(): string {
    return `
🌱 I'm here to negotiate. To proceed, please:

1. Choose a tier (minimum/standard/premium)
2. Make a counter-offer with a specific amount
3. Decline if this doesn't work for you

What would you prefer?
`;
  }

  private getNetworkName(chainId: number): string {
    const networks: Record<number, string> = {
      1: 'Ethereum Mainnet',
      8453: 'Base',
      84532: 'Base Sepolia',
    };
    return networks[chainId] || `Chain ${chainId}`;
  }
}

export function createNegotiationEngine(): NegotiationEngine {
  return new NegotiationEngine();
}
