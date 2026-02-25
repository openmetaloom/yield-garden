'use client';

import { motion } from 'framer-motion';
import FarmStream from '@/components/FarmStream';
import GardenStream from '@/components/GardenStream';
import FarmStatsCard from '@/components/FarmStats';
import GardenStatsCard from '@/components/GardenStats';
import FarmMetrics from '@/components/charts/FarmMetrics';
import GardenMetrics from '@/components/charts/GardenMetrics';
import ComparisonChart from '@/components/charts/ComparisonChart';
import FarmActivityGrid from '@/components/visualization/FarmActivityGrid';
import NegotiationTree from '@/components/visualization/NegotiationTree';

export default function ConsolidatedView() {
  return (
    <div className="space-y-6">
      {/* Comparison Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      >
        <ComparisonChart />
      </motion.div>

      {/* Metrics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: 'tween', ease: 'linear', duration: 0.3, delay: 0.1 }}
        >
          <div className="farm-card p-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🚜</span>
              <h3 className="text-lg font-semibold text-[var(--farm-white)]">Farm Telemetry</h3>
            </div>
            <FarmMetrics />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.2 }}
        >
          <div className="garden-card p-4">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🌱</span>
              <h3 className="text-lg font-medium text-[var(--garden-text)]">Garden Telemetry</h3>
            </div>
            <GardenMetrics />
          </div>
        </motion.div>
      </div>

      {/* Real-time Visualizations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <FarmActivityGrid />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <NegotiationTree />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <FarmStatsCard />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <GardenStatsCard />
        </motion.div>
      </div>

      {/* Live Streams */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'tween', ease: 'linear', duration: 0.3, delay: 0.7 }}
        >
          <FarmStream />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.8 }}
        >
          <GardenStream />
        </motion.div>
      </div>
    </div>
  );
}
