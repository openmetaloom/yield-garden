import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { corsMiddleware, errorHandler } from './middleware/cors.js';
import farmRoutes from './routes/farm.js';
import gardenRoutes from './routes/garden.js';
import statsRoutes from './routes/stats.js';
import registryRoutes from './routes/registry.js';
import { API_CONFIG } from '@yield-garden/shared';

const app = new Hono();

// Middleware
app.use('*', corsMiddleware);
app.use('*', errorHandler);

// Routes
app.route('/farm', farmRoutes);
app.route('/garden', gardenRoutes);
app.route('/stats', statsRoutes);
app.route('/registry', registryRoutes);

// Health check
app.get('/health', (c) => {
  return c.json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
    },
  });
});

// Root
app.get('/', (c) => {
  return c.json({
    name: 'yield.garden API',
    version: '0.1.0',
    endpoints: [
      '/farm/stream',
      '/farm/stats',
      '/garden/stream',
      '/garden/negotiations',
      '/garden/stats',
      '/stats',
      '/registry/agents',
      '/registry/agent/:address',
      '/health',
    ],
  });
});

const port = API_CONFIG.PORT;

console.log(`🌐 yield.garden API starting on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});

export default app;
