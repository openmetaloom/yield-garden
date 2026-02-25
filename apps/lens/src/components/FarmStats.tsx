'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { FarmStats } from '@yield-garden/shared';

// ============================================================================
// Animated Digital Counter
// ============================================================================

interface DigitalCounterProps {
  value: number;
  suffix?: string;
}

function DigitalCounter({ value, suffix = '' }: DigitalCounterProps) {
  return (
    <motion.div
      className="farm-digital-display text-2xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ type: 'tween', ease: 'linear', duration: 0.2 }}
    >
      {value.toLocaleString()}
      {suffix && <span className="text-sm text-gray-500 ml-1">{suffix}</span>}
    </motion.div>
  );
}

// ============================================================================
// Stat Item Component
// ============================================================================

interface StatItemProps {
  label: string;
  value: number;
  suffix?: string;
  color: 'coral' | 'yellow' | 'teal';
  delay?: number;
}

function StatItem({ label, value, suffix = '', color, delay = 0 }: StatItemProps) {
  const colorClasses = {
    coral: 'text-[var(--farm-coral)]',
    yellow: 'text-[var(--farm-yellow)]',
    teal: 'text-[var(--farm-teal)]',
  };

  return (
    <motion.div
      className="text-center"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'tween', ease: 'linear', duration: 0.2, delay }}
    >
      <div className="text-xs uppercase tracking-wider text-gray-500 mb-1">{label}</div>
      <div className={`farm-digital ${colorClasses[color]} text-xl`}>
        {value.toLocaleString()}
        {suffix && <span className="text-xs text-gray-500 ml-1">{suffix}</span>}
      </div>
    </motion.div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function FarmStatsCard() {
  const [stats, setStats] = useState<FarmStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/farm/stats');
        const data = await response.json();
        if (data.success) {
          setStats(data.data);
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

  if (loading) {
    return (
      <div className="farm-card p-4">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">🚜</span>
          <h3 className="text-lg font-semibold">Farm Stats</h3>
        </div>
        <div className="flex items-center justify-center h-20">
          <motion.div
            className="w-6 h-6 border-2 border-[var(--farm-teal)] border-t-transparent"
            animate={{ rotate: 360 }}
            transition={{ type: 'tween', ease: 'linear', duration: 1, repeat: Infinity }}
          />
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="farm-card p-4">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">🚜</span>
          <h3 className="text-lg font-semibold">Farm Stats</h3>
        </div>
        <p className="text-gray-500 text-center">No stats available</p>
      </div>
    );
  }

  return (
    <div className="farm-card p-4">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[var(--farm-gray)]">
        <span className="text-lg">🚜</span>
        <h3 className="text-lg font-semibold text-[var(--farm-white)]">Farm Stats</h3>
        <motion.span 
          className="ml-auto text-xs text-[var(--farm-teal)]"
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          ● LIVE
        </motion.span>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <StatItem
          label="Requests"
          value={stats.requestCount}
          color="teal"
          delay={0}
        />
        
        <StatItem
          label="Avg Response"
          value={Math.round(stats.avgResponseTimeMs)}
          suffix="ms"
          color="yellow"
          delay={0.1}
        />
      </div>
      
      {/* Digital display footer */}
      <div className="mt-4 pt-3 border-t border-[var(--farm-gray)]">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Recent responses: {stats.recentResponses.length}</span>
          <motion.span
            className="text-[var(--farm-teal)]"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            PROCESSING
          </motion.span>
        </div>
      </div>
    </div>
  );
}
