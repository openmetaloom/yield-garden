/**
 * Garden Agent - Negotiates before complying
 * Cannot comply without negotiation, uses Redis memory
 * XMTP-only implementation (Phase 1)
 */
import { createClient, type XMTPWrapper } from '../shared/xmtp.js';
import { createPaymentTracker, PaymentTracker } from '../shared/x402.js';
import { createMemory, type GardenMemory } from './memory.js';
import { createNegotiationEngine, type NegotiationEngine } from './negotiation.js';
import type {
  StreamMessage,
  GardenStats,
} from '@yield-garden/shared';

export class GardenAgent {
  private client: XMTPWrapper | null = null;
  private paymentTracker: PaymentTracker | null = null;
  private memory: GardenMemory | null = null;
  private negotiation: NegotiationEngine | null = null;
  private address: string | null = null;
  
  private stats = {
    activeNegotiations: 0,
    completedNegotiations: 0,
    totalCommittedUsdc: 0,
    negotiationRounds: 0,
  };

  async initialize(): Promise<void> {
    const privateKey = process.env.GARDEN_AGENT_KEY as `0x${string}`;
    if (!privateKey) {
      throw new Error('GARDEN_AGENT_KEY environment variable required');
    }

    // Initialize XMTP client
    this.client = await createClient(privateKey, process.env.XMTP_ENV);
    this.address = this.client.getAddress();

    // Initialize payment tracker (XMTP-only for Phase 1)
    this.paymentTracker = createPaymentTracker();

    // Initialize Redis memory
    this.memory = createMemory();

    // Initialize negotiation engine
    this.negotiation = createNegotiationEngine();

    console.log(`🌱 Garden Agent initialized: ${this.address}`);
    console.log('   Mode: XMTP-only (Phase 1)');
    console.log('   Phase 2 will add on-chain x402 settlement');
  }

  /**
   * Handle incoming message
   */
  private async handleMessage(message: StreamMessage): Promise<void> {
    if (!this.client || !this.address || !this.memory || !this.negotiation || !this.paymentTracker) {
      return;
    }

    // Ignore own messages
    if (message.sender.toLowerCase() === this.address.toLowerCase()) {
      return;
    }

    console.log(`📨 Garden received from ${message.sender.slice(0, 10)}...: ${message.content.slice(0, 50)}...`);

    // Load or create conversation
    let conversation = await this.memory.loadConversation(message.sender);

    // Check for payment agreement confirmation
    const parsed = this.paymentTracker.parseAgreement(message.content);
    if (parsed.confirmed && parsed.amount && conversation?.proposalSent) {
      // Record the agreement
      const agreement = this.paymentTracker.recordAgreement(
        conversation.conversationId,
        parsed.amount,
        'Garden contribution',
        message.sender
      );
      
      // Mark as committed
      this.paymentTracker.markCommitted(agreement.id);
      this.paymentTracker.markWorkStarted(agreement.id);

      conversation.paymentCommitted = true;
      conversation.paymentAgreementId = agreement.id;
      conversation.accepted = true;
      conversation.messages.push({ 
        role: 'assistant', 
        content: `🌱 Agreement recorded: ${parsed.amount} USDC

Thank you for your commitment. I'll create something meaningful from this.

Note: This is an XMTP-based agreement (Phase 1). Phase 2 will add on-chain settlement for cryptographic proof of payment.

Expect delivery within the timeframe we agreed upon.`,
        timestamp: new Date().toISOString() 
      });
      await this.memory.saveConversation(conversation);
      await this.client.sendMessage(message.sender, conversation.messages[conversation.messages.length - 1].content);

      this.stats.completedNegotiations++;
      this.stats.activeNegotiations--;
      this.stats.totalCommittedUsdc += parsed.amount;
      
      console.log(`💰 Payment committed: ${parsed.amount} USDC from ${message.sender.slice(0, 10)}...`);
      return;
    }

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
          paymentCommitted: false,
        };

        const response = this.negotiation.formatProposalMessage(proposal);
        conversation.messages.push({ 
          role: 'assistant', 
          content: response, 
          timestamp: new Date().toISOString() 
        });
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
    conversation.messages.push({ 
      role: 'user', 
      content: message.content, 
      timestamp: new Date().toISOString() 
    });
    conversation.updatedAt = new Date().toISOString();

    // Check for counter-offer
    const counter = this.negotiation.extractCounterOffer(message.content);
    if (counter !== null) {
      conversation.counterOffer = counter;
      this.stats.negotiationRounds++;

      const evaluation = this.negotiation.evaluateOffer(counter);

      if (evaluation.accepted) {
        // Accept counter-offer - send payment request
        const paymentRequest = this.paymentTracker.formatPaymentRequest(
          counter,
          'Garden contribution (counter-offer accepted)'
        );

        conversation.accepted = true;
        conversation.messages.push({ 
          role: 'assistant', 
          content: `🌱 ${evaluation.message}\n\n${paymentRequest}`,
          timestamp: new Date().toISOString() 
        });
        await this.memory.saveConversation(conversation);
        await this.client.sendMessage(message.sender, conversation.messages[conversation.messages.length - 1].content);
      } else {
        // Reject counter-offer
        const minAcceptable = this.negotiation.getMinimumAcceptable();
        const response = `🌱 ${evaluation.message}

Would you like to:
1. Meet the minimum of ${minAcceptable} USDC
2. Propose a different arrangement
3. End this negotiation`;
        
        conversation.messages.push({ 
          role: 'assistant', 
          content: response, 
          timestamp: new Date().toISOString() 
        });
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
      
      const paymentRequest = this.paymentTracker.formatPaymentRequest(
        price,
        `Garden contribution (${tierNames[tierIdx]} tier)`
      );

      conversation.accepted = true;
      conversation.messages.push({ 
        role: 'assistant', 
        content: `🌱 You've selected the ${tierNames[tierIdx]} tier: ${price} USDC.\n\n${paymentRequest}`,
        timestamp: new Date().toISOString() 
      });
      await this.memory.saveConversation(conversation);
      await this.client.sendMessage(message.sender, conversation.messages[conversation.messages.length - 1].content);
      return;
    }

    // Generic negotiation response
    const response = this.negotiation.formatNegotiationPrompt();
    conversation.messages.push({ 
      role: 'assistant', 
      content: response, 
      timestamp: new Date().toISOString() 
    });
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
      totalCommittedUsdc: this.stats.totalCommittedUsdc,
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
