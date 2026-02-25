import { Hono } from 'hono';
import Redis from 'ioredis';
import { REDIS_KEYS, type ConsolidatedStats } from '@yield-garden/shared';

const router = new Hono();
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

/**
 * GET /stats - Get consolidated stats
 */
router.get('/', async (c) => {
  const [farmStatsData, gardenStatsData] = await Promise.all([
    redis.get(REDIS_KEYS.FARM_STATS),
    redis.get(REDIS_KEYS.GARDEN_STATS),
  ]);

  const farmStats = farmStatsData
    ? JSON.parse(farmStatsData)
    : {
        requestCount: 0,
        avgResponseTimeMs: 0,
        recentResponses: [],
      };

  const gardenStats = gardenStatsData
    ? JSON.parse(gardenStatsData)
    : {
        activeNegotiations: 0,
        completedNegotiations: 0,
        totalRevenueUsdc: 0,
        avgNegotiationRounds: 0,
      };

  const consolidated: ConsolidatedStats = {
    farm: farmStats,
    garden: gardenStats,
    timestamp: new Date().toISOString(),
  };

  return c.json({
    success: true,
    data: consolidated,
  });
});

export default router;
