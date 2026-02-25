/**
 * Payment Tracking - XMTP-only implementation (Phase 1)
 * 
 * Phase 2 will add real x402 settlement:
 * - npm install @x402/core @x402/evm
 * - Replace this with proper EIP-712 payment flow
 * - Add SIWE for auth
 */
import type { PaymentAgreement } from '@yield-garden/shared';

export class PaymentTracker {
  private agreements: Map<string, PaymentAgreement> = new Map();

  /**
   * Record a payment agreement from XMTP conversation
   */
  recordAgreement(
    conversationId: string,
    amountUsdc: number,
    description: string,
    walletAddress: string
  ): PaymentAgreement {
    const agreement: PaymentAgreement = {
      id: `${conversationId}-${Date.now()}`,
      conversationId,
      amountUsdc,
      description,
      walletAddress,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    
    this.agreements.set(agreement.id, agreement);
    return agreement;
  }

  /**
   * Mark agreement as committed (visitor sent confirmation message)
   */
  markCommitted(agreementId: string): PaymentAgreement | null {
    const agreement = this.agreements.get(agreementId);
    if (!agreement) return null;
    
    agreement.status = 'committed';
    agreement.committedAt = new Date().toISOString();
    this.agreements.set(agreementId, agreement);
    return agreement;
  }

  /**
   * Mark work as started after payment commitment
   */
  markWorkStarted(agreementId: string): PaymentAgreement | null {
    const agreement = this.agreements.get(agreementId);
    if (!agreement) return null;
    
    agreement.status = 'in_progress';
    agreement.workStartedAt = new Date().toISOString();
    this.agreements.set(agreementId, agreement);
    return agreement;
  }

  /**
   * Get agreement by ID
   */
  getAgreement(agreementId: string): PaymentAgreement | null {
    return this.agreements.get(agreementId) || null;
  }

  /**
   * Get all agreements for a conversation
   */
  getAgreementsForConversation(conversationId: string): PaymentAgreement[] {
    return Array.from(this.agreements.values()).filter(
      a => a.conversationId === conversationId
    );
  }

  /**
   * Get total committed payments
   */
  getTotalCommitted(): number {
    return Array.from(this.agreements.values())
      .filter(a => a.status === 'committed' || a.status === 'in_progress' || a.status === 'completed')
      .reduce((sum, a) => sum + a.amountUsdc, 0);
  }

  /**
   * Format payment request message for XMTP
   */
  formatPaymentRequest(amountUsdc: number, workDescription: string): string {
    return `🌱 Payment Request

Amount: ${amountUsdc} USDC
For: ${workDescription}

To proceed, reply with:
"I agree to pay ${amountUsdc} USDC"

Note: This is a social agreement via XMTP. Phase 2 will add on-chain settlement.
`;
  }

  /**
   * Parse payment agreement from visitor message
   */
  parseAgreement(message: string): { amount: number | null; confirmed: boolean } {
    const lower = message.toLowerCase();
    
    // Check for confirmation patterns
    const confirmed = /i agree|i'll pay|i will pay|confirmed/i.test(message);
    
    // Extract amount
    const amountMatch = message.match(/(\d+(?:\.\d+)?)\s*usdc?/i);
    const amount = amountMatch ? parseFloat(amountMatch[1]) : null;
    
    return { amount, confirmed };
  }
}

export function createPaymentTracker(): PaymentTracker {
  return new PaymentTracker();
}
