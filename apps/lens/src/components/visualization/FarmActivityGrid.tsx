'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// Types
// ============================================================================

interface Slot {
  id: number;
  state: 'idle' | 'active' | 'processing';
  requestId?: string;
  timestamp?: number;
}

// ============================================================================
// Constants
// ============================================================================

const GRID_SIZE = 64; // 8x8 grid
const SLOT_LIFETIME = 3000; // How long a slot stays active

// ============================================================================
// Main Component
// ============================================================================

export default function FarmActivityGrid() {
  const [slots, setSlots] = useState<Slot[]>(
    Array.from({ length: GRID_SIZE }, (_, i) => ({
      id: i,
      state: 'idle',
    }))
  );
  const [stats, setStats] = useState({ active: 0, processed: 0, throughput: 0 });

  // Find next available slot
  const findAvailableSlot = useCallback((): number | null => {
    const idleSlots = slots
      .map((slot, index) => ({ slot, index }))
      .filter(({ slot }) => slot.state === 'idle')
      .map(({ index }) => index);
    
    if (idleSlots.length === 0) return null;
    return idleSlots[Math.floor(Math.random() * idleSlots.length)];
  }, [slots]);

  // Simulate incoming request
  const simulateRequest = useCallback(() => {
    const slotIndex = findAvailableSlot();
    if (slotIndex === null) return;

    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    setSlots(prev => {
      const next = [...prev];
      next[slotIndex] = {
        id: slotIndex,
        state: 'active',
        requestId,
        timestamp: Date.now(),
      };
      return next;
    });

    // Process the request
    setTimeout(() => {
      setSlots(prev => {
        const next = [...prev];
        if (next[slotIndex].requestId === requestId) {
          next[slotIndex] = { ...next[slotIndex], state: 'processing' };
        }
        return next;
      });

      // Complete the request
      setTimeout(() => {
        setSlots(prev => {
          const next = [...prev];
          if (next[slotIndex].requestId === requestId) {
            next[slotIndex] = { id: slotIndex, state: 'idle' };
          }
          return next;
        });
        setStats(s => ({ ...s, processed: s.processed + 1 }));
      }, 500);
    }, 1000);
  }, [findAvailableSlot]);

  // Update stats
  useEffect(() => {
    const activeCount = slots.filter(s => s.state !== 'idle').length;
    setStats(s => ({
      ...s,
      active: activeCount,
      throughput: s.processed / ((Date.now() - s.processed * 1500) / 60000 + 1),
    }));
  }, [slots]);

  // Simulate incoming requests
  useEffect(() => {
    const interval = setInterval(() => {
      // Random chance to spawn a request
      if (Math.random() > 0.3) {
        simulateRequest();
      }
    }, 500);

    return () => clearInterval(interval);
  }, [simulateRequest]);

  // Clean up old slots
  useEffect(() => {
    const cleanup = setInterval(() => {
      const now = Date.now();
      setSlots(prev =>
        prev.map(slot => {
          if (slot.state !== 'idle' && slot.timestamp && now - slot.timestamp > SLOT_LIFETIME) {
            return { id: slot.id, state: 'idle' };
          }
          return slot;
        })
      );
    }, 1000);

    return () => clearInterval(cleanup);
  }, []);

  const getSlotColor = (state: Slot['state']): string => {
    switch (state) {
      case 'active':
        return 'bg-[var(--farm-coral)]';
      case 'processing':
        return 'bg-[var(--farm-yellow)]';
      default:
        return 'bg-[var(--farm-dark)]';
    }
  };

  const getSlotGlow = (state: Slot['state']): string => {
    switch (state) {
      case 'active':
        return 'shadow-[0_0_8px_var(--farm-coral)]';
      case 'processing':
        return 'shadow-[0_0_8px_var(--farm-yellow)]';
      default:
        return '';
    }
  };

  return (
    <div className="farm-card p-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold flex items-center gap-2">
          <span className="w-2 h-2 bg-[var(--farm-teal)] rounded-sm animate-pulse"></span>
          Activity Grid
        </h4>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 bg-[var(--farm-coral)]"></span>
            <span className="text-gray-400">Active</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 bg-[var(--farm-yellow)]"></span>
            <span className="text-gray-400">Processing</span>
          </div>
          <div className="farm-digital text-[var(--farm-teal)]">
            {stats.active}
            <span className="text-gray-500 text-xs ml-1">active</span>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-8 gap-1">
        <AnimatePresence mode="popLayout">
          {slots.map((slot) => (
            <motion.div
              key={slot.id}
              className={`
                aspect-square rounded-sm border border-[var(--farm-gray)]
                ${getSlotColor(slot.state)}
                ${getSlotGlow(slot.state)}
              `}
              initial={false}
              animate={{
                scale: slot.state === 'idle' ? 1 : 1.1,
                opacity: slot.state === 'idle' ? 0.5 : 1,
              }}
              transition={{
                type: 'tween',
                ease: 'linear',
                duration: 0.1,
              }}
              layout
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-[var(--farm-gray)]">
        <div className="text-center">
          <div className="text-xs text-gray-500 mb-1">Processed</div>
          <div className="farm-digital text-[var(--farm-teal)]">{stats.processed.toLocaleString()}</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-500 mb-1">Active</div>
          <div className="farm-digital text-[var(--farm-coral)]">{stats.active}</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-gray-500 mb-1">Throughput</div>
          <div className="farm-digital text-[var(--farm-yellow)]">{stats.throughput.toFixed(1)}/min</div>
        </div>
      </div>
    </div>
  );
}
