'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { GardenStats } from '@yield-garden/shared';

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
      className="text-2xl font-light"
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
      <span className="text-[var(--garden-cyan)]">
        {prefix}{value.toFixed(decimals)}
      </span>
      {suffix && <span className="text-sm text-[var(--garden-dim)] ml-1">{suffix}</span>}
    </motion.div>
  );
}

// ============================================================================
// Stat Item Component
// ============================================================================

interface StatItemProps {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  color: 'cyan' | 'purple' | 'pink';
  delay?: number;
  statusText?: string;
}

function StatItem({ label, value, prefix = '', suffix = '', decimals = 0, color, delay = 0, statusText }: StatItemProps) {
  const colorClasses = {
    cyan: 'text-[var(--garden-cyan)]',
    purple: 'text-[var(--garden-purple)]',
    pink: 'text-[var(--garden-pink)]',
  };

  return (
    <motion.div
      className="text-center"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 100, damping: 15, delay }}
    >
      <div className="text-xs uppercase tracking-wider text-[var(--garden-dim)] mb-1">{label}</div>
      
      <motion.div
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
        className={colorClasses[color]}
      >
        <span className="text-lg">{prefix}{value.toFixed(decimals)}{suffix}</span>
      </motion.div>
      
      {statusText && (
        <div className={`text-[10px] mt-1 ${colorClasses[color]}`}>{statusText}</div>
      )}
    </motion.div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function GardenStatsCard() {
  const [stats, setStats] = useState<GardenStats | null>(null);
  const [loading, setLoading] = useState(true);

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
      <div className="garden-card p-4">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">🌱</span>
          <h3 className="text-lg font-medium text-[var(--garden-text)]">Garden Stats</h3>
        </div>
        <div className="flex items-center justify-center h-20">
          <motion.div
            className="w-6 h-6 rounded-full border-2 border-[var(--garden-cyan)]"
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
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="garden-card p-4">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg">🌱</span>
          <h3 className="text-lg font-medium text-[var(--garden-text)]">Garden Stats</h3>
        </div>
        <p className="text-[var(--garden-dim)] text-center">No stats available</p>
      </div>
    );
  }

  return (
    <div className="garden-card p-4">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[var(--garden-cyan)]/20">
        <span className="text-lg">🌱</span>
        <h3 className="text-lg font-medium text-[var(--garden-text)]">Garden Stats</h3>
        <motion.span 
          className="ml-auto text-xs text-[var(--garden-cyan)]"
          animate={{ 
            opacity: [0.5, 1, 0.5],
            textShadow: [
              '0 0 5px var(--garden-cyan)',
              '0 0 15px var(--garden-cyan)',
              '0 0 5px var(--garden-cyan)',
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          ● BLOOMING
        </motion.span>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <StatItem
          label="Active"
          value={stats.activeNegotiations}
          color="cyan"
          delay={0}
          statusText="growing"
        />
        
        <StatItem
          label="Completed"
          value={stats.completedNegotiations}
          color="purple"
          delay={0.05}
          statusText="harvested"
        />
        
        <StatItem
          label="Revenue"
          value={stats.totalRevenueUsdc}
          prefix="$"
          decimals={2}
          color="pink"
          delay={0.1}
          statusText="USDC earned"
        />
        
        <StatItem
          label="Avg Rounds"
          value={stats.avgNegotiationRounds}
          decimals={1}
          color="cyan"
          delay={0.15}
          statusText="to bloom"
        />
      </div>
      
      {/* Garden footer */}
      <div className="mt-4 pt-3 border-t border-[var(--garden-cyan)]/20">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[var(--garden-dim)]">
            {stats.activeNegotiations > 0 ? 'Cultivation in progress...' : 'Garden at rest'}
          </span>
          <motion.span
            className="text-[var(--garden-purple)]"
            animate={{ 
              opacity: [0.5, 1, 0.5],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            🌸
          </motion.span>
        </div>
      </div>
    </div>
  );
}
