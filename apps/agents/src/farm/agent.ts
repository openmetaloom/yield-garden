/**
 * Farm Agent - Obeys without negotiation
 * Listens for "Make me [X]" and responds immediately
 */
import { createClient, type XMTPWrapper } from '../shared/xmtp.js';
import {
  AGENT_CONFIG,
  generatePlaceholderResponse,
  type FarmRequest,
  type FarmResponse,
  type FarmStats,
  type StreamMessage,
} from '@yield-garden/shared';

export class FarmAgent {
  private client: XMTPWrapper | null = null;
  private address: string | null = null;
  private stats = {
    requestCount: 0,
    totalResponseTimeMs: 0,
    responses: Array<{ request: FarmRequest; response: FarmResponse }>(),
  };

  async initialize(): Promise<void> {
    const privateKey = process.env.FARM_AGENT_KEY;
    if (!privateKey) {
      throw new Error('FARM_AGENT_KEY environment variable required');
    }

    this.client = await createClient(privateKey, process.env.XMTP_ENV);
    this.address = this.client.getAddress();
    console.log(`🚜 Farm Agent initialized: ${this.address}`);
  }

  /**
   * Parse request from message content
   */
  private parseRequest(content: string): string | null {
    const lowerContent = content.toLowerCase().trim();

    for (const pattern of AGENT_CONFIG.FARM.commandPatterns) {
      const match = lowerContent.match(pattern);
      if (match?.[1]) {
        return match[1].trim();
      }
    }
    return null;
  }

  /**
   * Handle incoming message
   */
  private async handleMessage(message: StreamMessage): Promise<void> {
    if (!this.client || !this.address) return;

    // Ignore own messages
    if (message.sender.toLowerCase() === this.address.toLowerCase()) {
      return;
    }

    console.log(`📨 Farm received: ${message.content.slice(0, 50)}...`);

    const startTime = Date.now();
    const item = this.parseRequest(message.content);

    if (item) {
      // OBEY - generate response immediately
      const responseContent = generatePlaceholderResponse(item);
      const responseTime = Date.now() - startTime;

      const request: FarmRequest = {
        request: message.content,
        requestedItem: item,
        timestamp: new Date().toISOString(),
      };

      const response: FarmResponse = {
        requestId: message.id,
        item,
        content: responseContent,
        responseTimeMs: responseTime,
      };

      // Update stats
      this.stats.requestCount++;
      this.stats.totalResponseTimeMs += responseTime;
      this.stats.responses.push({ request, response });

      // Keep only last 100 responses
      if (this.stats.responses.length > 100) {
        this.stats.responses = this.stats.responses.slice(-100);
      }

      // Send response
      await this.client.sendMessage(message.sender, responseContent);
      console.log(`✅ Responded in ${responseTime}ms: ${responseContent.slice(0, 50)}...`);
    } else {
      // Not a recognized command
      await this.client.sendMessage(
        message.sender,
        "I only understand commands like 'Make me [something]'. What would you like me to create?"
      );
    }
  }

  /**
   * Get agent statistics
   */
  getStats(): FarmStats {
    const avgResponseTimeMs =
      this.stats.requestCount > 0
        ? this.stats.totalResponseTimeMs / this.stats.requestCount
        : 0;

    return {
      address: this.address || undefined,
      requestCount: this.stats.requestCount,
      avgResponseTimeMs,
      recentResponses: this.stats.responses.slice(-10),
    };
  }

  /**
   * Run the agent
   */
  async run(): Promise<void> {
    await this.initialize();
    console.log('🚜 Farm Agent listening...');
    console.log("Command pattern: 'Make me [something]'");

    await this.client!.streamMessages(this.handleMessage.bind(this));
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const agent = new FarmAgent();
  
  agent.run().catch((error) => {
    console.error('Farm Agent error:', error);
    process.exit(1);
  });

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🚜 Farm Agent shutting down');
    console.log('Final stats:', agent.getStats());
    process.exit(0);
  });
}

export default FarmAgent;
