'use client';

import { motion } from 'framer-motion';
import type { StreamMessage } from '@yield-garden/shared';
import { formatAddress, formatTimestamp } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

type MessageTheme = 'farm' | 'garden';

interface MessageCardProps {
  message: StreamMessage;
  theme: MessageTheme;
}

// ============================================================================
// Farm Message Card
// ============================================================================

function FarmMessageCard({ message }: { message: StreamMessage }) {
  const isOutgoing = message.direction === 'out';
  
  return (
    <motion.div
      className={`
        farm-message-card p-3 mb-2 max-w-[85%]
        ${isOutgoing ? 'outgoing ml-auto' : 'mr-auto'}
      `}
      initial={{ opacity: 0, x: isOutgoing ? 20 : -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: 'tween', ease: 'linear', duration: 0.15 }}
      layout
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-mono text-gray-400">
          {formatAddress(message.sender)}
        </span>
        <span className="text-[10px] text-gray-600">
          {formatTimestamp(message.timestamp)}
        </span>
        
        {isOutgoing && (
          <span className="receipt ml-auto flex items-center gap-1">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              ✓
            </motion.span>
            <span>SENT</span>
          </span>
        )}
      </div>
      
      {/* Content */}
      <p className="text-sm whitespace-pre-wrap text-[var(--farm-white)]">
        {message.content}
      </p>
      
      {/* Receipt footer */}
      {isOutgoing && (
        <motion.div
          className="mt-2 pt-2 border-t border-[var(--farm-gray)] flex items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <span className="text-[10px] font-mono text-[var(--farm-teal)]">
            ID: {message.id.slice(0, 8).toUpperCase()}
          </span>
          <span className="text-[10px] text-gray-500 ml-auto">
            PROCESSED
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}

// ============================================================================
// Garden Message Card
// ============================================================================

function GardenMessageCard({ message }: { message: StreamMessage }) {
  const isOutgoing = message.direction === 'out';
  
  return (
    <motion.div
      className={`
        garden-message-card p-4 mb-3 max-w-[85%]
        ${isOutgoing ? 'outgoing ml-auto garden-organic-reverse' : 'mr-auto garden-organic'}
        ${!isOutgoing ? 'receiving' : ''}
      `}
      initial={{ 
        opacity: 0, 
        scale: 0.9,
        y: 10,
      }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        y: 0,
      }}
      transition={{
        type: 'spring',
        stiffness: 150,
        damping: 12,
      }}
      whileHover={{ scale: 1.02 }}
      layout
    >
      {/* Header with glow */}
      <div className="flex items-center gap-2 mb-2">
        <motion.span 
          className="text-xs text-[var(--garden-cyan)]"
          animate={!isOutgoing ? { opacity: [0.5, 1, 0.5] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {formatAddress(message.sender)}
        </motion.span>
        
        <span className="text-[10px] text-[var(--garden-dim)]">
          {formatTimestamp(message.timestamp)}
        </span>
        
        {isOutgoing && (
          <motion.span 
            className="ml-auto text-[var(--garden-purple)]"
            animate={{ 
              textShadow: [
                '0 0 5px var(--garden-purple)',
                '0 0 15px var(--garden-purple)',
                '0 0 5px var(--garden-purple)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🌸
          </motion.span>
        )}
      </div>
      
      {/* Content with organic feel */}
      <motion.p 
        className="text-sm whitespace-pre-wrap text-[var(--garden-text)] leading-relaxed"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {message.content}
      </motion.p>
      
      {/* Organic footer decoration */}
      <motion.div
        className="mt-3 flex items-center gap-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {isOutgoing ? (
          <>
            <span className="text-[10px] text-[var(--garden-dim)]">bloomed</span>
            <motion.span
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              🌿
            </motion.span>
          </>
        ) : (
          <>
            <span className="text-[10px] text-[var(--garden-cyan)]">growing...</span>
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🌱
            </motion.span>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function MessageCard({ message, theme }: MessageCardProps) {
  if (theme === 'farm') {
    return <FarmMessageCard message={message} />;
  }
  
  return <GardenMessageCard message={message} />;
}

// Export individual components for flexibility
export { FarmMessageCard, GardenMessageCard };
