import { Hono } from 'hono';
import Redis from 'ioredis';
import { REDIS_KEYS, type FarmStats, type StreamMessage } from '@yield-garden/shared';

const router = new Hono();
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Message buffer (in-memory for now, could be Redis)
const messageBuffer: StreamMessage[] = [];
const MAX_BUFFER_SIZE = 1000;

/**
 * Add message to buffer
 */
export function addToBuffer(message: StreamMessage): void {
  messageBuffer.push(message);
  if (messageBuffer.length > MAX_BUFFER_SIZE) {
    messageBuffer.shift();
  }
}

/**
 * GET /farm/stream - Get Farm message stream
 */
router.get('/stream', async (c) => {
  const limit = parseInt(c.req.query('limit') || '100', 10);
  const messages = messageBuffer
    .filter((m) => m.agentType === 'farm')
    .slice(-limit);

  return c.json({
    success: true,
    data: messages,
  });
});

/**
 * GET /farm/stats - Get Farm agent statistics
 */
router.get('/stats', async (c) => {
  const stats = await redis.get(REDIS_KEYS.FARM_STATS);
  
  const farmStats: FarmStats = stats
    ? JSON.parse(stats)
    : {
        requestCount: 0,
        avgResponseTimeMs: 0,
        recentResponses: [],
      };

  return c.json({
    success: true,
    data: farmStats,
  });
});

/**
 * POST /farm/stats - Update Farm stats (called by agent)
 */
router.post('/stats', async (c) => {
  const body = await c.req.json();
  await redis.set(REDIS_KEYS.FARM_STATS, JSON.stringify(body));
  
  return c.json({
    success: true,
    data: body,
  });
});

export default router;
export { addToBuffer };
