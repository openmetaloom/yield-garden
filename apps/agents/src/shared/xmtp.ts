/**
 * XMTP Client Wrapper
 * Official @xmtp/xmtp-js SDK
 */
import { Client, Stream, type Conversation } from '@xmtp/xmtp-js';
import { Wallet } from 'ethers';
import { AGENT_CONFIG, XMTP_CONFIG } from '@yield-garden/shared';
import type { StreamMessage } from '@yield-garden/shared';

export interface MessageHandler {
  (message: StreamMessage): Promise<void>;
}

export class XMTPWrapper {
  private client: Client;
  private address: string;
  private env: string;

  constructor(client: Client) {
    this.client = client;
    this.address = client.address;
    this.env = client.environment;
  }

  static async create(privateKey: string, env: string = XMTP_CONFIG.ENV): Promise<XMTPWrapper> {
    const wallet = new Wallet(privateKey);
    const client = await Client.create(wallet, { env: env as 'dev' | 'production' });
    return new XMTPWrapper(client);
  }

  getAddress(): string {
    return this.address;
  }

  getEnvironment(): string {
    return this.env;
  }

  async sendMessage(toAddress: string, content: string): Promise<string> {
    const conversation = await this.client.conversations.newConversation(toAddress);
    const message = await conversation.send(content);
    return message.id;
  }

  async streamMessages(handler: MessageHandler): Promise<void> {
    const stream = await this.client.conversations.streamMessages();
    
    for await (const message of stream) {
      const isOutgoing = message.senderAddress.toLowerCase() === this.address.toLowerCase();
      
      const streamMessage: StreamMessage = {
        id: message.id,
        sender: message.senderAddress,
        content: message.content as string,
        timestamp: new Date().toISOString(),
        conversationId: message.conversation.peerAddress,
        agentType: 'farm', // Will be set by caller
        direction: isOutgoing ? 'out' : 'in',
      };

      await handler(streamMessage);
    }
  }

  async getConversations(): Promise<Conversation[]> {
    return this.client.conversations.list();
  }
}

export async function createClient(privateKey: string, env?: string): Promise<XMTPWrapper> {
  return XMTPWrapper.create(privateKey, env);
}
