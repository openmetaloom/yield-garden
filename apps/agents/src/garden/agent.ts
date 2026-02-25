/**
 * Garden Agent - Negotiates before complying
 * Cannot comply without negotiation, uses Redis memory
 */
import { createClient, type XMTPWrapper } from '../shared/xmtp.js';
import { createX402Handler, type X402Handler } from '../shared/x402.js';
import { createMemory, type GardenMemory } from './memory.js';
import { createNegotiationEngine, type NegotiationEngine } from './negotiation.js';
import {
  isSignature,
  extractSignature,
  type StreamMessage,
  type GardenNegotiation,
  type GardenStats,
  type GardenProposal,
  type NegotiationMessage,
} from '@yield-garden/shared';

export class GardenAgent {
  private client: XMTPWrapper | null = null;
  private x402: X402Handler | null = null;
  private memory: GardenMemory | null = null;
  private negotiation: NegotiationEngine | null = null;
  private address: string | null = null;
  
  private stats = {
    activeNegotiations: 0,
    completedNegotiations: 0,
    totalRevenueUsdc: 0,
    negotiationRounds: 0,
  };

  async initialize(): Promise<void> {
    const privateKey = process.env.GARDEN_AGENT_KEY;
    if (!privateKey) {
      throw new Error('GARDEN_AGENT_KEY environment variable required');
    }

    // Initialize XMTP client
    this.client = await createClient(privateKey, process.env.XMTP_ENV);
    this.address = this.client.getAddress();

    // Initialize x402 handler
    const chainId = parseInt(process.env.CHAIN_ID || '84532', 10);
    this.x402 = createX402Handler(this.address, chainId);

    // Initialize Redis memory
    this.memory = createMemory();

    // Initialize negotiation engine
    this.negotiation = createNegotiationEngine();

    console.log(`🌱 Garden Agent initialized: ${this.address}`);
  }

  /**
   * Handle incoming message
   */
  private async handleMessage(message: StreamMessage): Promise<void> {
    if (!this.client || !this.address || !this.memory || !this.negotiation || !this.x402) {
      return;
    }

    // Ignore own messages
    if (message.sender.toLowerCase() === this.address.toLowerCase()) {
      return;
    }

    console.log(`📨 Garden received from ${message.sender.slice(0, 10)}...: ${message.content.slice(0, 50)}...`);

    // Load or create conversation
    let conversation = await this.memory.loadConversation(message.sender);

    if (!conversation) {
      // New conversation
      if (this.negotiation.isSupportIntent(message.content)) {
        // Start negotiation
        const proposal = this.negotiation.createProposal();
        
        conversation = {
          conversationId: message.conversationId,
          userAddress: message.sender,
          proposalSent: proposal,
          messages: [{ role: 'user', content: message.content, timestamp: new Date().toISOString() }],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          accepted: false,
          paymentAuthorized: false,
        };

        const response = this.negotiation.formatProposalMessage(proposal);
        conversation.messages.push({ role: 'assistant', content: response, timestamp: new Date().toISOString() });
        await this.memory.saveConversation(conversation);

        await this.client.sendMessage(message.sender, response);
        console.log(`🌱 Sent proposal to ${message.sender.slice(0, 10)}...`);
        this.stats.activeNegotiations++;
      } else {
        // Not a support intent
        await this.client.sendMessage(
          message.sender,
          "🌱 I appreciate your message. I'm a Garden agent—I only engage through negotiation. " +
            "If you'd like to support this work, please let me know and I'll share contribution options."
        );
      }
      return;
    }

    // Ongoing negotiation
    conversation.messages.push({ role: 'user', content: message.content, timestamp: new Date().toISOString() });
    conversation.updatedAt = new Date().toISOString();

    // Check for signature (payment authorization)
    if (isSignature(message.content)) {
      const sig = extractSignature(message.content);
      if (sig && conversation.proposalSent) {
        // Process payment
        const response = this.negotiation.formatAcceptanceMessage();
        conversation.paymentAuthorized = true;
        conversation.accepted = true;
        conversation.messages.push({ role: 'assistant', content: response, timestamp: new Date().toISOString() });
        await this.memory.saveConversation(conversation);

        await this.client.sendMessage(message.sender, response);
        console.log(`💰 Payment received from ${message.sender.slice(0, 10)}...`);
        
        this.stats.completedNegotiations++;
        this.stats.activeNegotiations--;
        if (conversation.counterOffer) {
          this.stats.totalRevenueUsdc += conversation.counterOffer;
        } else if (conversation.proposalSent) {
          this.stats.totalRevenueUsdc += conversation.proposalSent.basePriceUsdc;
        }
        return;
      }
    }

    // Check for counter-offer
    const counter = this.negotiation.extractCounterOffer(message.content);
    if (counter !== null) {
      conversation.counterOffer = counter;
      this.stats.negotiationRounds++;

      const evaluation = this.negotiation.evaluateOffer(counter);

      if (evaluation.accepted) {
        // Accept counter-offer
        const paymentRequest = this.x402.createPaymentRequest(
          counter,
          'Garden contribution (counter-offer accepted)'
        );

        const response = `🌱 ${evaluation.message}\n\n${this.negotiation.formatPaymentRequest(paymentRequest)}\n\nOnce you provide your signature, I'll authorize the payment.`;
        conversation.accepted = true;
        conversation.messages.push({ role: 'assistant', content: response, timestamp: new Date().toISOString() });
        await this.memory.saveConversation(conversation);
        await this.client.sendMessage(message.sender, response);
      } else {
        // Reject counter-offer
        const minAcceptable = this.negotiation.getMinimumAcceptable();
        const response = `🌱 ${evaluation.message}\n\nWould you like to:\n1. Meet the minimum of ${conversation.proposalSent?.priceOptions[0] || 5} USDC\n2. Propose a different arrangement\n3. End this negotiation`;
        
        conversation.messages.push({ role: 'assistant', content: response, timestamp: new Date().toISOString() });
        await this.memory.saveConversation(conversation);
        await this.client.sendMessage(message.sender, response);
      }
      return;
    }

    // Check for tier acceptance
    const tierIdx = this.negotiation.extractTier(message.content);
    if (tierIdx !== null && conversation.proposalSent) {
      const price = conversation.proposalSent.priceOptions[tierIdx];
      const tierNames = ['minimum', 'standard', 'premium'];
      
      const paymentRequest = this.x402.createPaymentRequest(
        price,
        `Garden contribution (${tierNames[tierIdx]} tier)`
      );

      const response = `🌱 You've selected the ${tierNames[tierIdx]} tier: ${price} USDC.\n\n${this.negotiation.formatPaymentRequest(paymentRequest)}\n\nPlease reply with your signed authorization to complete the payment.`;
      
      conversation.accepted = true;
      conversation.messages.push({ role: 'assistant', content: response, timestamp: new Date().toISOString() });
      await this.memory.saveConversation(conversation);
      await this.client.sendMessage(message.sender, response);
      return;
    }

    // Generic negotiation response
    const response = this.negotiation.formatNegotiationPrompt();
    conversation.messages.push({ role: 'assistant', content: response, timestamp: new Date().toISOString() });
    await this.memory.saveConversation(conversation);
    await this.client.sendMessage(message.sender, response);
  }

  /**
   * Get agent statistics
   */
  getStats(): GardenStats {
    const avgRounds =
      this.stats.completedNegotiations > 0
        ? this.stats.negotiationRounds / this.stats.completedNegotiations
        : 0;

    return {
      address: this.address || undefined,
      activeNegotiations: this.stats.activeNegotiations,
      completedNegotiations: this.stats.completedNegotiations,
      totalRevenueUsdc: this.stats.totalRevenueUsdc,
      avgNegotiationRounds: avgRounds,
    };
  }

  /**
   * Run the agent
   */
  async run(): Promise<void> {
    await this.initialize();
    console.log('🌱 Garden Agent listening...');
    console.log("Trigger: 'I'd like to support your work' or similar");

    await this.client!.streamMessages(this.handleMessage.bind(this));
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const agent = new GardenAgent();
  
  agent.run().catch((error) => {
    console.error('Garden Agent error:', error);
    process.exit(1);
  });

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🌱 Garden Agent shutting down');
    console.log('Final stats:', agent.getStats());
    process.exit(0);
  });
}

export default GardenAgent;
