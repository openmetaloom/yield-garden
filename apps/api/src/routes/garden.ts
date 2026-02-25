import { Hono } from 'hono';
import Redis from 'ioredis';
import { REDIS_KEYS, type GardenStats, type GardenNegotiation, type StreamMessage } from '@yield-garden/shared';

const router = new Hono();
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Message buffer reference (shared with farm router)
let messageBuffer: StreamMessage[] = [];

/**
 * Set message buffer reference
 */
export function setGardenBuffer(buffer: StreamMessage[]): void {
  messageBuffer = buffer;
}

/**
 * GET /garden/stream - Get Garden message stream
 */
router.get('/stream', async (c) => {
  const limit = parseInt(c.req.query('limit') || '100', 10);
  const messages = messageBuffer
    .filter((m) => m.agentType === 'garden')
    .slice(-limit);

  return c.json({
    success: true,
    data: messages,
  });
});

/**
 * GET /garden/negotiations - Get active negotiations
 */
router.get('/negotiations', async (c) => {
  const keys = await redis.keys(REDIS_KEYS.GARDEN_CONVERSATION('*'));
  const negotiations: GardenNegotiation[] = [];

  for (const key of keys) {
    const data = await redis.get(key);
    if (data) {
      negotiations.push(JSON.parse(data));
    }
  }

  return c.json({
    success: true,
    data: negotiations,
  });
});

/**
 * GET /garden/stats - Get Garden agent statistics
 */
router.get('/stats', async (c) => {
  const stats = await redis.get(REDIS_KEYS.GARDEN_STATS);
  
  const gardenStats: GardenStats = stats
    ? JSON.parse(stats)
    : {
        activeNegotiations: 0,
        completedNegotiations: 0,
        totalRevenueUsdc: 0,
        avgNegotiationRounds: 0,
      };

  return c.json({
    success: true,
    data: gardenStats,
  });
});

/**
 * POST /garden/stats - Update Garden stats (called by agent)
 */
router.post('/stats', async (c) => {
  const body = await c.req.json();
  await redis.set(REDIS_KEYS.GARDEN_STATS, JSON.stringify(body));
  
  return c.json({
    success: true,
    data: body,
  });
});

export default router;
export { setGardenBuffer };
