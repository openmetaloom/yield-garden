'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { FarmStats } from '@yield-garden/shared';

// ============================================================================
// Types
// ============================================================================

interface TimeSeriesPoint {
  time: string;
  requests: number;
  timestamp: number;
}

interface ResponseTimeBucket {
  range: string;
  count: number;
}

interface FarmMetricsData {
  timeSeries: TimeSeriesPoint[];
  responseTimeDistribution: ResponseTimeBucket[];
  throughput: number;
  totalRequests: number;
}

// ============================================================================
// Animated Counter Component
// ============================================================================

interface AnimatedCounterProps {
  value: number;
  duration?: number;
}

function AnimatedCounter({ value, duration = 0.5 }: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const startValue = displayValue;
    const endValue = value;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      
      // Linear easing for mechanical feel
      const current = Math.round(startValue + (endValue - startValue) * progress);
      setDisplayValue(current);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [value, duration]);

  return (
    <span className="farm-digital-display text-3xl font-bold">
      {displayValue.toLocaleString()}
    </span>
  );
}

// ============================================================================
// Gauge Component
// ============================================================================

interface GaugeProps {
  value: number;
  max: number;
  label: string;
  unit: string;
}

function Gauge({ value, max, label, unit }: GaugeProps) {
  const percentage = Math.min((value / max) * 100, 100);
  
  return (
    <div className="farm-card p-4">
      <h4 className="text-xs uppercase tracking-wider text-gray-400 mb-2">{label}</h4>
      <div className="relative h-4 bg-gray-800 rounded overflow-hidden">
        <motion.div
          className="absolute top-0 left-0 h-full rounded"
          style={{
            background: `linear-gradient(90deg, var(--farm-teal) 0%, var(--farm-yellow) 50%, var(--farm-coral) 100%)`,
          }}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ type: 'tween', ease: 'linear', duration: 0.3 }}
        />
      </div>
      <div className="flex justify-between mt-2">
        <span className="farm-digital text-lg text-[var(--farm-teal)]">
          {value.toFixed(1)}
          <span className="text-xs text-gray-500 ml-1">{unit}</span>
        </span>
        <span className="text-xs text-gray-500">{percentage.toFixed(0)}%</span>
      </div>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function FarmMetrics() {
  const [stats, setStats] = useState<FarmStats | null>(null);
  const [metrics, setMetrics] = useState<FarmMetricsData>({
    timeSeries: [],
    responseTimeDistribution: [],
    throughput: 0,
    totalRequests: 0,
  });
  const [loading, setLoading] = useState(true);

  // Generate mock time series data for the last hour
  const generateTimeSeries = (): TimeSeriesPoint[] => {
    const points: TimeSeriesPoint[] = [];
    const now = Date.now();
    for (let i = 59; i >= 0; i--) {
      const timestamp = now - i * 60000;
      points.push({
        time: new Date(timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        requests: Math.floor(Math.random() * 20) + 5,
        timestamp,
      });
    }
    return points;
  };

  // Generate mock response time distribution
  const generateResponseTimeDistribution = (): ResponseTimeBucket[] => {
    return [
      { range: '<100ms', count: Math.floor(Math.random() * 50) + 100 },
      { range: '100-250ms', count: Math.floor(Math.random() * 40) + 80 },
      { range: '250-500ms', count: Math.floor(Math.random() * 30) + 40 },
      { range: '500ms-1s', count: Math.floor(Math.random() * 20) + 20 },
      { range: '>1s', count: Math.floor(Math.random() * 10) + 5 },
    ];
  };

  // Initial data generation
  useEffect(() => {
    setMetrics({
      timeSeries: generateTimeSeries(),
      responseTimeDistribution: generateResponseTimeDistribution(),
      throughput: Math.random() * 50 + 20,
      totalRequests: 15420,
    });
  }, []);

  // Fetch stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/farm/stats');
        const data = await response.json();
        if (data.success) {
          setStats(data.data);
          // Update total requests from real data if available
          if (data.data.requestCount) {
            setMetrics(prev => ({
              ...prev,
              totalRequests: data.data.requestCount,
            }));
          }
        }
      } catch (error) {
        console.error('Failed to fetch farm stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  // Update time series periodically
  useEffect(() => {
    const updateTimeSeries = () => {
      setMetrics(prev => {
        const newPoint: TimeSeriesPoint = {
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          requests: Math.floor(Math.random() * 20) + 5,
          timestamp: Date.now(),
        };
        const newSeries = [...prev.timeSeries.slice(1), newPoint];
        return {
          ...prev,
          timeSeries: newSeries,
          throughput: Math.random() * 50 + 20,
        };
      });
    };

    const interval = setInterval(updateTimeSeries, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="farm-card p-6 h-96 flex items-center justify-center">
        <motion.div
          className="w-8 h-8 border-2 border-[var(--farm-teal)] border-t-transparent rounded-sm"
          animate={{ rotate: 360 }}
          transition={{ type: 'tween', ease: 'linear', duration: 1, repeat: Infinity }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Requests Counter */}
        <motion.div 
          className="farm-card p-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'tween', ease: 'linear', duration: 0.2 }}
        >
          <h4 className="text-xs uppercase tracking-wider text-gray-400 mb-2">Total Requests</h4>
          <AnimatedCounter value={metrics.totalRequests} />
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-[var(--farm-teal)]">●</span>
            <span className="text-xs text-gray-500">Live</span>
          </div>
        </motion.div>

        {/* Throughput Gauge */}
        <Gauge 
          value={metrics.throughput} 
          max={100} 
          label="Throughput" 
          unit="req/min" 
        />

        {/* Avg Response Time */}
        <motion.div 
          className="farm-card p-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'tween', ease: 'linear', duration: 0.2, delay: 0.1 }}
        >
          <h4 className="text-xs uppercase tracking-wider text-gray-400 mb-2">Avg Response</h4>
          <div className="farm-digital-display text-3xl font-bold">
            {stats ? Math.round(stats.avgResponseTimeMs) : 0}
            <span className="text-sm text-gray-400 ml-1">ms</span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-[var(--farm-yellow)] farm-blink">⚡</span>
            <span className="text-xs text-gray-500">Processing</span>
          </div>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Requests Over Time */}
        <motion.div 
          className="farm-card p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'tween', ease: 'linear', duration: 0.3 }}
        >
          <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-[var(--farm-teal)] rounded-sm"></span>
            Requests (Last Hour)
          </h4>
          <div className="h-48 farm-chart">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics.timeSeries}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="time" 
                  tick={{ fontSize: 10 }}
                  interval="preserveStartEnd"
                  tickCount={6}
                />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1a1a2e', 
                    border: '1px solid #4a4a6a',
                    borderRadius: '4px',
                  }}
                  labelStyle={{ color: '#F7FFF7' }}
                  itemStyle={{ color: '#4ECDC4' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="requests" 
                  stroke="#4ECDC4" 
                  strokeWidth={2}
                  dot={false}
                  animationDuration={300}
                  animationEasing="linear"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Response Time Distribution */}
        <motion.div 
          className="farm-card p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'tween', ease: 'linear', duration: 0.3, delay: 0.1 }}
        >
          <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-[var(--farm-coral)] rounded-sm"></span>
            Response Time Distribution
          </h4>
          <div className="h-48 farm-chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.responseTimeDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1a1a2e', 
                    border: '1px solid #4a4a6a',
                    borderRadius: '4px',
                  }}
                  labelStyle={{ color: '#F7FFF7' }}
                />
                <Bar dataKey="count" animationDuration={300} animationEasing="linear">
                  {metrics.responseTimeDistribution.map((_, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={index < 2 ? '#4ECDC4' : index < 4 ? '#FFE66D' : '#FF6B6B'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
