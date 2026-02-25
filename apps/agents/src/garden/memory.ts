/**
 * Garden Agent Memory - Redis-based conversation storage
 */
import Redis from 'ioredis';
import { REDIS_KEYS, type GardenNegotiation } from '@yield-garden/shared';

export class GardenMemory {
  private redis: Redis;
  private ttl: number;

  constructor(redisUrl?: string, ttl: number = 86400) {
    this.redis = new Redis(redisUrl || process.env.REDIS_URL || 'redis://localhost:6379');
    this.ttl = ttl; // 24 hours default
  }

  /**
   * Load conversation from Redis
   */
  async loadConversation(userAddress: string): Promise<GardenNegotiation | null> {
    const key = REDIS_KEYS.GARDEN_CONVERSATION(userAddress);
    const data = await this.redis.get(key);
    
    if (data) {
      return JSON.parse(data) as GardenNegotiation;
    }
    return null;
  }

  /**
   * Save conversation to Redis
   */
  async saveConversation(negotiation: GardenNegotiation): Promise<void> {
    const key = REDIS_KEYS.GARDEN_CONVERSATION(negotiation.userAddress);
    await this.redis.setex(key, this.ttl, JSON.stringify(negotiation));
  }

  /**
   * Delete conversation
   */
  async deleteConversation(userAddress: string): Promise<void> {
    const key = REDIS_KEYS.GARDEN_CONVERSATION(userAddress);
    await this.redis.del(key);
  }

  /**
   * Get all active conversations
   */
  async getActiveConversations(): Promise<string[]> {
    const keys = await this.redis.keys(REDIS_KEYS.GARDEN_CONVERSATION('*'));
    return keys.map((key) => key.replace('garden:conv:', ''));
  }

  /**
   * Close Redis connection
   */
  async close(): Promise<void> {
    await this.redis.quit();
  }
}

export function createMemory(redisUrl?: string, ttl?: number): GardenMemory {
  return new GardenMemory(redisUrl, ttl);
}
