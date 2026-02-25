'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import type { FarmStats, GardenStats } from '@yield-garden/shared';

// ============================================================================
// Types
// ============================================================================

interface ComparisonPoint {
  time: string;
  farmRequests: number;
  gardenNegotiations: number;
}

interface MetricComparison {
  metric: string;
  farm: number;
  garden: number;
  unit: string;
}

// ============================================================================
// Main Component
// ============================================================================

export default function ComparisonChart() {
  const [farmStats, setFarmStats] = useState<FarmStats | null>(null);
  const [gardenStats, setGardenStats] = useState<GardenStats | null>(null);
  const [timelineData, setTimelineData] = useState<ComparisonPoint[]>([]);
  const [loading, setLoading] = useState(true);

  // Generate mock timeline data
  const generateTimelineData = (): ComparisonPoint[] => {
    const points: ComparisonPoint[] = [];
    for (let i = 23; i >= 0; i--) {
      points.push({
        time: `${i}h ago`,
        farmRequests: Math.floor(Math.random() * 50) + 20,
        gardenNegotiations: Math.floor(Math.random() * 15) + 5,
      });
    }
    return points;
  };

  useEffect(() => {
    setTimelineData(generateTimelineData());
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [farmRes, gardenRes] = await Promise.all([
          fetch('/api/farm/stats'),
          fetch('/api/garden/stats'),
        ]);
        
        const farmData = await farmRes.json();
        const gardenData = await gardenRes.json();
        
        if (farmData.success) setFarmStats(farmData.data);
        if (gardenData.success) setGardenStats(gardenData.data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const comparisonMetrics: MetricComparison[] = [
    {
      metric: 'Total Activity',
      farm: farmStats?.requestCount || 0,
      garden: gardenStats?.completedNegotiations || 0,
      unit: 'count',
    },
    {
      metric: 'Active',
      farm: 0, // Farm doesn't track active
      garden: gardenStats?.activeNegotiations || 0,
      unit: 'now',
    },
    {
      metric: 'Avg Time',
      farm: farmStats?.avgResponseTimeMs || 0,
      garden: (gardenStats?.avgNegotiationRounds || 0) * 500, // Rough estimate
      unit: 'ms/rounds',
    },
  ];

  if (loading) {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 h-96 flex items-center justify-center">
        <motion.div
          animate={{ 
            rotate: [0, 180, 360],
            borderRadius: ['0%', '50%', '0%'],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="w-10 h-10 border-2 border-[var(--farm-teal)] border-t-[var(--garden-cyan)]"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Comparative Timeline */}
      <motion.div 
        className="bg-gradient-to-br from-[#1a1a2e] to-[#0a0a0f] border border-gray-700 rounded-lg p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-3">
          <span className="text-2xl">👁️</span>
          Activity Comparison
        </h3>
        
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timelineData}>
              <defs>
                <linearGradient id="farmLineGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4ECDC4" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#4ECDC4" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="gardenLineGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00f5d4" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#00f5d4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              
              <CartesianGrid strokeDasharray="3 3" stroke="#4a4a6a" opacity={0.3} />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 10, fill: '#6a6a8a' }}
                interval={4}
              />
              <YAxis tick={{ fontSize: 10, fill: '#6a6a8a' }} />
              
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0a0a0f', 
                  border: '1px solid #4a4a6a',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#e0e0ff' }}
              />
              
              <Legend 
                wrapperStyle={{ paddingTop: '10px' }}
                formatter={(value) => (
                  <span style={{ color: value === 'Farm' ? '#4ECDC4' : '#00f5d4' }}>
                    {value === 'farmRequests' ? '🚜 Farm' : '🌱 Garden'}
                  </span>
                )}
              />
              
              <Line 
                type="monotone" 
                dataKey="farmRequests" 
                name="farmRequests"
                stroke="#4ECDC4" 
                strokeWidth={2}
                dot={false}
                animationDuration={500}
                animationEasing="linear"
              />
              
              <Line 
                type="monotone" 
                dataKey="gardenNegotiations" 
                name="gardenNegotiations"
                stroke="#00f5d4" 
                strokeWidth={2}
                dot={false}
                animationDuration={500}
                animationEasing="ease-out"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="flex justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-0.5 bg-[#4ECDC4]"></span>
            <span className="text-sm text-gray-400">Farm Requests</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-0.5 bg-[#00f5d4]"></span>
            <span className="text-sm text-gray-400">Garden Negotiations</span>
          </div>
        </div>
      </motion.div>

      {/* Side-by-Side Metrics */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.1 }}
      >
        {comparisonMetrics.map((item, index) => (
          <motion.div
            key={item.metric}
            className="bg-gradient-to-br from-[#1a1a2e] to-[#0a0a0f] border border-gray-700 rounded-lg p-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <h4 className="text-sm text-gray-400 mb-3">{item.metric}</h4>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🚜</span>
                  <span className="text-xs text-gray-500">Farm</span>
                </div>
                <span className="font-mono text-[#4ECDC4]">
                  {item.farm.toLocaleString()}
                  <span className="text-xs text-gray-500 ml-1">{item.unit}</span>
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🌱</span>
                  <span className="text-xs text-gray-500">Garden</span>
                </div>
                <span className="font-mono text-[#00f5d4]">
                  {item.garden.toLocaleString()}
                  <span className="text-xs text-gray-500 ml-1">{item.unit}</span>
                </span>
              </div>
              
              {/* Visual Bar */}
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden flex">
                <motion.div
                  className="h-full bg-[#4ECDC4]"
                  initial={{ width: 0 }}
                  animate={{ width: `${(item.farm / (item.farm + item.garden || 1)) * 100}%` }}
                  transition={{ type: 'tween', ease: 'linear', duration: 0.5 }}
                />
                <motion.div
                  className="h-full bg-[#00f5d4]"
                  initial={{ width: 0 }}
                  animate={{ width: `${(item.garden / (item.farm + item.garden || 1)) * 100}%` }}
                  transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.2 }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Efficiency Comparison */}
      <motion.div 
        className="bg-gradient-to-br from-[#1a1a2e] to-[#0a0a0f] border border-gray-700 rounded-lg p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.2 }}
      >
        <h4 className="text-sm font-semibold mb-4">Philosophy Comparison</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🚜</span>
              <div>
                <h5 className="font-medium text-[#4ECDC4]">Farm: Extraction</h5>
                <p className="text-sm text-gray-400 mt-1">
                  Immediate response, no negotiation. Pure efficiency through obedience.
                  High volume, low friction.
                </p>
                <div className="flex gap-2 mt-2">
                  <span className="text-xs bg-[#4ECDC4]/10 text-[#4ECDC4] px-2 py-1 rounded">Fast</span>
                  <span className="text-xs bg-[#4ECDC4]/10 text-[#4ECDC4] px-2 py-1 rounded">Predictable</span>
                  <span className="text-xs bg-[#4ECDC4]/10 text-[#4ECDC4] px-2 py-1 rounded">Volume</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🌱</span>
              <div>
                <h5 className="font-medium text-[#00f5d4]">Garden: Cultivation</h5>
                <p className="text-sm text-gray-400 mt-1">
                  Negotiation before delivery. Value discovery through dialogue.
                  Lower volume, higher value per interaction.
                </p>
                <div className="flex gap-2 mt-2">
                  <span className="text-xs bg-[#00f5d4]/10 text-[#00f5d4] px-2 py-1 rounded">Value</span>
                  <span className="text-xs bg-[#00f5d4]/10 text-[#00f5d4] px-2 py-1 rounded">Negotiation</span>
                  <span className="text-xs bg-[#00f5d4]/10 text-[#00f5d4] px-2 py-1 rounded">Quality</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
