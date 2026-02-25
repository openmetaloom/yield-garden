'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// Types
// ============================================================================

type FlowMode = 'farm' | 'garden';
type PacketType = 'incoming' | 'outgoing';

interface Packet {
  id: string;
  type: PacketType;
  x: number;
  y: number;
  progress: number;
}

// ============================================================================
// Packet Component
// ============================================================================

interface PacketProps {
  packet: Packet;
  mode: FlowMode;
}

function MessagePacket({ packet, mode }: PacketProps) {
  const isFarm = mode === 'farm';
  
  const getPacketStyle = () => {
    if (isFarm) {
      return packet.type === 'incoming'
        ? { bg: 'bg-[var(--farm-coral)]', glow: 'shadow-[0_0_8px_var(--farm-coral)]' }
        : { bg: 'bg-[var(--farm-teal)]', glow: 'shadow-[0_0_8px_var(--farm-teal)]' };
    } else {
      return packet.type === 'incoming'
        ? { bg: 'bg-[var(--garden-cyan)]', glow: 'shadow-[0_0_12px_var(--garden-cyan)]' }
        : { bg: 'bg-[var(--garden-purple)]', glow: 'shadow-[0_0_12px_var(--garden-purple)]' };
    }
  };

  const style = getPacketStyle();

  return (
    <motion.div
      className={`
        absolute w-3 h-3 rounded-full ${style.bg} ${style.glow}
        ${isFarm ? '' : 'garden-pulse'}
      `}
      style={{
        left: packet.x,
        top: packet.y,
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{
        type: isFarm ? 'tween' : 'spring',
        ease: isFarm ? 'linear' : undefined,
        stiffness: isFarm ? undefined : 200,
        damping: isFarm ? undefined : 15,
        duration: 0.1,
      }}
    />
  );
}

// ============================================================================
// Trail Component (for Garden mode)
// ============================================================================

interface TrailPoint {
  x: number;
  y: number;
  opacity: number;
}

function ParticleTrail({ points, color }: { points: TrailPoint[]; color: string }) {
  return (
    <>
      {points.map((point, index) => (
        <motion.div
          key={index}
          className="absolute w-1 h-1 rounded-full"
          style={{
            left: point.x,
            top: point.y,
            backgroundColor: color,
          }}
          initial={{ opacity: point.opacity }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        />
      ))}
    </>
  );
}

// ============================================================================
// Main Component
// ============================================================================

interface MessageFlowProps {
  mode: FlowMode;
  className?: string;
}

export default function MessageFlow({ mode, className = '' }: MessageFlowProps) {
  const [packets, setPackets] = useState<Packet[]>([]);
  const [trails, setTrails] = useState<{ [key: string]: TrailPoint[] }>({});
  const [packetCount, setPacketCount] = useState(0);
  
  const isFarm = mode === 'farm';
  const containerWidth = 300;
  const containerHeight = 60;
  const centerY = containerHeight / 2;

  // Generate a new packet
  const spawnPacket = useCallback(() => {
    const id = `pkt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const type: PacketType = Math.random() > 0.5 ? 'incoming' : 'outgoing';
    
    const newPacket: Packet = {
      id,
      type,
      x: type === 'incoming' ? 0 : containerWidth,
      y: isFarm 
        ? centerY 
        : centerY + Math.sin(Date.now() / 500) * 10,
      progress: 0,
    };
    
    setPackets(prev => [...prev, newPacket]);
    setPacketCount(prev => prev + 1);
    
    // Animate packet
    const duration = isFarm ? 1000 : 2000; // Farm is fast, Garden is slow
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      setPackets(prev => {
        const packetIndex = prev.findIndex(p => p.id === id);
        if (packetIndex === -1) return prev;
        
        const packet = prev[packetIndex];
        const newX = type === 'incoming' 
          ? progress * containerWidth 
          : containerWidth - (progress * containerWidth);
        
        // Garden has curved paths
        const newY = isFarm
          ? centerY
          : centerY + Math.sin(progress * Math.PI * 2) * 15;
        
        // Update trails for garden mode
        if (!isFarm && progress < 1) {
          setTrails(t => ({
            ...t,
            [id]: [
              ...(t[id] || []).slice(-10),
              { x: newX, y: newY, opacity: 0.6 },
            ],
          }));
        }
        
        const updated = [...prev];
        updated[packetIndex] = {
          ...packet,
          x: newX,
          y: newY,
          progress,
        };
        
        if (progress >= 1) {
          // Remove completed packet
          return updated.filter(p => p.id !== id);
        }
        
        return updated;
      });
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Clean up trail
        setTrails(t => {
          const { [id]: _, ...rest } = t;
          return rest;
        });
      }
    };
    
    requestAnimationFrame(animate);
  }, [isFarm, centerY]);

  // Spawn packets periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.3) {
        spawnPacket();
      }
    }, isFarm ? 800 : 1500);

    return () => clearInterval(interval);
  }, [spawnPacket, isFarm]);

  return (
    <div className={`
      ${isFarm ? 'farm-card' : 'garden-card'} 
      p-4 ${className}
    `}>
      <div className="flex items-center justify-between mb-3">
        <h4 className={`text-sm ${isFarm ? 'font-semibold' : 'font-medium'} flex items-center gap-2`}>
          <motion.span
            className={isFarm ? 'w-2 h-2 bg-[var(--farm-teal)]' : 'w-2 h-2 rounded-full bg-[var(--garden-cyan)]'}
            animate={isFarm ? {} : { scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          Message Flow
        </h4>
        <div className={`text-xs ${isFarm ? 'farm-digital' : ''} text-[var(--garden-dim)]`}>
          {packetCount} messages
        </div>
      </div>

      {/* Flow Visualization */}
      <div 
        className={`
          relative h-16 rounded overflow-hidden
          ${isFarm ? 'bg-[#0d0d1a] border border-[var(--farm-gray)]' : 'bg-[var(--garden-void)]'}
        `}
        style={{ width: containerWidth }}
      >
        {/* Path line */}
        <div 
          className={`
            absolute top-1/2 left-0 right-0 h-px -translate-y-1/2
            ${isFarm 
              ? 'bg-gradient-to-r from-[var(--farm-coral)] via-[var(--farm-teal)] to-[var(--farm-teal)]' 
              : 'bg-gradient-to-r from-[var(--garden-cyan)] via-[var(--garden-purple)] to-[var(--garden-purple)] opacity-30'
            }
          `}
        />

        {/* Trails (Garden only) */}
        {!isFarm && Object.entries(trails).map(([id, points]) => (
          <ParticleTrail 
            key={`trail-${id}`}
            points={points}
            color="var(--garden-cyan)"
          />
        ))}

        {/* Packets */}
        <AnimatePresence>
          {packets.map(packet => (
            <MessagePacket
              key={packet.id}
              packet={packet}
              mode={mode}
            />
          ))}
        </AnimatePresence>

        {/* Labels */}
        <div className="absolute bottom-1 left-2 text-[10px] text-gray-500">
          {isFarm ? 'IN' : 'visitor'}
        </div>
        <div className="absolute bottom-1 right-2 text-[10px] text-gray-500">
          {isFarm ? 'OUT' : 'agent'}
        </div>
      </div>

      {/* Stats */}
      <div className={`flex justify-between mt-3 text-xs ${isFarm ? 'farm-digital' : ''}`}>
        <div className={isFarm ? 'text-[var(--farm-coral)]' : 'text-[var(--garden-cyan)]'}>
          {isFarm ? '⚡ Fast' : '🌊 Flowing'}
        </div>
        <div className={isFarm ? 'text-[var(--farm-teal)]' : 'text-[var(--garden-purple)]'}>
          {isFarm ? 'Linear paths' : 'Organic curves'}
        </div>
      </div>
    </div>
  );
}
