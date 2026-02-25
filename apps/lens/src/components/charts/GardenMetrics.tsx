'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
} from 'recharts';
import type { GardenStats } from '@/types';

// ============================================================================
// Types
// ============================================================================

interface NegotiationPoint {
  time: string;
  active: number;
  completed: number;
}

interface OutcomeData {
  name: string;
  value: number;
  color: string;
}

interface RevenueData {
  tier: string;
  amount: number;
}

interface RoundData {
  time: string;
  avgRounds: number;
}

// ============================================================================
// Breathing Counter Component
// ============================================================================

interface BreathingCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

function BreathingCounter({ value, prefix = '', suffix = '', decimals = 0 }: BreathingCounterProps) {
  return (
    <motion.div
      className="text-4xl font-light text-[var(--garden-cyan)]"
      animate={{
        scale: [1, 1.02, 1],
        opacity: [1, 0.9, 1],
      }}
      transition={{
        type: 'spring',
        stiffness: 100,
        damping: 20,
        duration: 4,
        repeat: Infinity,
      }}
    >
      {prefix}
      {value.toFixed(decimals)}
      <span className="text-lg text-[var(--garden-dim)] ml-1">{suffix}</span>
    </motion.div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function GardenMetrics() {
  const [stats, setStats] = useState<GardenStats | null>(null);
  const [negotiationsOverTime, setNegotiationsOverTime] = useState<NegotiationPoint[]>([]);
  const [outcomes, setOutcomes] = useState<OutcomeData[]>([
    { name: 'Accepted', value: 45, color: '#00f5d4' },
    { name: 'Countered', value: 30, color: '#9b5de5' },
    { name: 'Refused', value: 25, color: '#f15bb5' },
  ]);
  const [revenueByTier, setRevenueByTier] = useState<RevenueData[]>([
    { tier: '$5', amount: 125 },
    { tier: '$25', amount: 875 },
    { tier: '$100', amount: 2100 },
  ]);
  const [avgRoundsOverTime, setAvgRoundsOverTime] = useState<RoundData[]>([]);
  const [loading, setLoading] = useState(true);

  // Generate mock negotiation time series
  const generateNegotiationSeries = (): NegotiationPoint[] => {
    const points: NegotiationPoint[] = [];
    for (let i = 23; i >= 0; i--) {
      points.push({
        time: `${i}h`,
        active: Math.floor(Math.random() * 8) + 2,
        completed: Math.floor(Math.random() * 5) + 1,
      });
    }
    return points;
  };

  // Generate mock rounds data
  const generateRoundsData = (): RoundData[] => {
    const points: RoundData[] = [];
    for (let i = 23; i >= 0; i--) {
      points.push({
        time: `${i}h`,
        avgRounds: Math.random() * 3 + 2,
      });
    }
    return points;
  };

  useEffect(() => {
    setNegotiationsOverTime(generateNegotiationSeries());
    setAvgRoundsOverTime(generateRoundsData());
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/garden/stats');
        const data = await response.json();
        if (data.success) {
          setStats(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch garden stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="garden-card p-6 h-96 flex items-center justify-center">
        <motion.div
          className="w-8 h-8 rounded-full border-2 border-[var(--garden-cyan)]"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [1, 0.5, 1],
            borderColor: ['#00f5d4', '#9b5de5', '#00f5d4'],
          }}
          transition={{
            type: 'spring',
            stiffness: 100,
            damping: 10,
            duration: 2,
            repeat: Infinity,
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div 
          className="garden-card p-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 100, damping: 15 }}
        >
          <h4 className="text-xs uppercase tracking-wider text-[var(--garden-dim)] mb-2">Active</h4>
          <BreathingCounter value={stats?.activeNegotiations || 0} />
          <motion.div 
            className="text-xs text-[var(--garden-cyan)] mt-1"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            growing...
          </motion.div>
        </motion.div>

        <motion.div 
          className="garden-card p-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 100, damping: 15, delay: 0.05 }}
        >
          <h4 className="text-xs uppercase tracking-wider text-[var(--garden-dim)] mb-2">Completed</h4>
          <BreathingCounter value={stats?.completedNegotiations || 0} />
          <div className="text-xs text-[var(--garden-purple)] mt-1">
            harvested
          </div>
        </motion.div>

        <motion.div 
          className="garden-card p-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 100, damping: 15, delay: 0.1 }}
        >
          <h4 className="text-xs uppercase tracking-wider text-[var(--garden-dim)] mb-2">Committed</h4>
          <BreathingCounter 
            value={stats?.totalCommittedUsdc || 0} 
            prefix="$" 
            decimals={2}
          />
          <div className="text-xs text-[var(--garden-pink)] mt-1">
            USDC committed
          </div>
        </motion.div>

        <motion.div 
          className="garden-card p-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 100, damping: 15, delay: 0.15 }}
        >
          <h4 className="text-xs uppercase tracking-wider text-[var(--garden-dim)] mb-2">Avg Rounds</h4>
          <BreathingCounter 
            value={stats?.avgNegotiationRounds || 0} 
            decimals={1}
          />
          <div className="text-xs text-[var(--garden-cyan)] mt-1">
            to bloom
          </div>
        </motion.div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Negotiations Over Time */}
        <motion.div 
          className="garden-card p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        >
          <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
            <motion.span 
              className="w-2 h-2 rounded-full bg-[var(--garden-cyan)]"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            Negotiations Over Time
          </h4>
          <div className="h-48 garden-chart">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={negotiationsOverTime}>
                <defs>
                  <linearGradient id="gardenGradient1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00f5d4" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00f5d4" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="gardenGradient2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9b5de5" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#9b5de5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#6a6a8a' }} />
                <YAxis tick={{ fontSize: 10, fill: '#6a6a8a' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0a0a0f', 
                    border: '1px solid rgba(0, 245, 212, 0.3)',
                    borderRadius: '12px',
                  }}
                  labelStyle={{ color: '#e0e0ff' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="active" 
                  stroke="#00f5d4" 
                  strokeWidth={2}
                  dot={false}
                  fillOpacity={1}
                  fill="url(#gardenGradient1)"
                />
                <Line 
                  type="monotone" 
                  dataKey="completed" 
                  stroke="#9b5de5" 
                  strokeWidth={2}
                  dot={false}
                  fillOpacity={1}
                  fill="url(#gardenGradient2)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Outcomes Pie Chart */}
        <motion.div 
          className="garden-card p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.1 }}
        >
          <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
            <motion.span 
              className="w-2 h-2 rounded-full bg-[var(--garden-purple)]"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            />
            Outcomes
          </h4>
          <div className="h-48 garden-chart">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={outcomes}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {outcomes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0a0a0f', 
                    border: '1px solid rgba(0, 245, 212, 0.3)',
                    borderRadius: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            {outcomes.map((outcome) => (
              <div key={outcome.name} className="flex items-center gap-1">
                <span 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: outcome.color }}
                />
                <span className="text-xs text-[var(--garden-dim)]">{outcome.name}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Revenue by Tier */}
        <motion.div 
          className="garden-card p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.2 }}
        >
          <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
            <motion.span 
              className="w-2 h-2 rounded-full bg-[var(--garden-pink)]"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
            />
            Revenue by Tier
          </h4>
          <div className="h-48 garden-chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueByTier}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="tier" tick={{ fontSize: 10, fill: '#6a6a8a' }} />
                <YAxis tick={{ fontSize: 10, fill: '#6a6a8a' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0a0a0f', 
                    border: '1px solid rgba(0, 245, 212, 0.3)',
                    borderRadius: '12px',
                  }}
                  formatter={(value) => [`$${value}`, 'Revenue']}
                />
                <Bar dataKey="amount">
                  {revenueByTier.map((_, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={index === 0 ? '#00f5d4' : index === 1 ? '#9b5de5' : '#f15bb5'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Avg Rounds Over Time */}
        <motion.div 
          className="garden-card p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.3 }}
        >
          <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
            <motion.span 
              className="w-2 h-2 rounded-full bg-[var(--garden-cyan)]"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
            />
            Avg Negotiation Rounds
          </h4>
          <div className="h-48 garden-chart">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={avgRoundsOverTime}>
                <defs>
                  <linearGradient id="roundsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9b5de5" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#9b5de5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#6a6a8a' }} />
                <YAxis tick={{ fontSize: 10, fill: '#6a6a8a' }} domain={[0, 'auto']} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0a0a0f', 
                    border: '1px solid rgba(0, 245, 212, 0.3)',
                    borderRadius: '12px',
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="avgRounds" 
                  stroke="#9b5de5" 
                  strokeWidth={2}
                  dot={{ fill: '#9b5de5', r: 3 }}
                  activeDot={{ r: 6, fill: '#00f5d4' }}
                  fill="url(#roundsGradient)"
                />
                <Area 
                  type="monotone" 
                  dataKey="avgRounds" 
                  stroke="none"
                  fill="url(#roundsGradient)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
