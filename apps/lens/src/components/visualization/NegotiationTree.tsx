'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// Types
// ============================================================================

type NegotiationStage = 'visitor' | 'proposal' | 'counter' | 'accept' | 'refuse';

interface NegotiationNode {
  id: string;
  stage: NegotiationStage;
  timestamp: number;
  content?: string;
  parentId?: string;
  x: number;
  y: number;
}

interface ActiveNegotiation {
  id: string;
  nodes: NegotiationNode[];
  finalOutcome?: 'accept' | 'refuse';
  age: number;
}

// ============================================================================
// Node Component
// ============================================================================

interface NodeProps {
  node: NegotiationNode;
  isLast: boolean;
}

function NegotiationNodeComponent({ node, isLast }: NodeProps) {
  const getNodeStyle = (): { bg: string; glow: string; icon: string } => {
    switch (node.stage) {
      case 'visitor':
        return {
          bg: 'bg-[var(--garden-cyan)]',
          glow: 'shadow-[0_0_15px_var(--garden-cyan)]',
          icon: '👤',
        };
      case 'proposal':
        return {
          bg: 'bg-[var(--garden-purple)]',
          glow: 'shadow-[0_0_15px_var(--garden-purple)]',
          icon: '🤖',
        };
      case 'counter':
        return {
          bg: 'bg-[var(--garden-pink)]',
          glow: 'shadow-[0_0_15px_var(--garden-pink)]',
          icon: '💬',
        };
      case 'accept':
        return {
          bg: 'bg-green-400',
          glow: 'shadow-[0_0_20px_rgba(74,222,128,0.6)]',
          icon: '✓',
        };
      case 'refuse':
        return {
          bg: 'bg-red-400',
          glow: 'shadow-[0_0_15px_rgba(248,113,113,0.5)]',
          icon: '✕',
        };
    }
  };

  const style = getNodeStyle();

  return (
    <motion.div
      className={`
        absolute w-10 h-10 rounded-full flex items-center justify-center
        ${style.bg} ${style.glow}
        border-2 border-[var(--garden-void)]
        cursor-pointer
      `}
      style={{
        left: node.x,
        top: node.y,
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ 
        scale: isLast ? [1, 1.1, 1] : 1, 
        opacity: 1,
      }}
      transition={{
        type: 'spring',
        stiffness: 200,
        damping: 15,
        scale: {
          duration: 2,
          repeat: isLast ? Infinity : 0,
          ease: 'easeInOut',
        },
      }}
      whileHover={{ scale: 1.2 }}
      title={node.stage}
    >
      <span className="text-lg">{style.icon}</span>
    </motion.div>
  );
}

// ============================================================================
// Connection Line Component
// ============================================================================

interface ConnectionProps {
  from: { x: number; y: number };
  to: { x: number; y: number };
  stage: NegotiationStage;
}

function ConnectionLine({ from, to, stage }: ConnectionProps) {
  const getLineColor = (): string => {
    switch (stage) {
      case 'visitor':
        return 'var(--garden-cyan)';
      case 'proposal':
        return 'var(--garden-purple)';
      case 'counter':
        return 'var(--garden-pink)';
      case 'accept':
        return '#4ade80';
      case 'refuse':
        return '#f87171';
    }
  };

  // Calculate control points for curved line
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;
  const offset = 20;

  const path = `M ${from.x + 20} ${from.y + 20} Q ${midX + offset} ${midY} ${to.x + 20} ${to.y + 20}`;

  return (
    <motion.svg
      className="absolute inset-0 pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.6 }}
      transition={{ duration: 0.5 }}
    >
      <motion.path
        d={path}
        fill="none"
        stroke={getLineColor()}
        strokeWidth="2"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />
    </motion.svg>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function NegotiationTree() {
  const [negotiations, setNegotiations] = useState<ActiveNegotiation[]>([]);
  const [nextId, setNextId] = useState(1);

  // Create a new negotiation
  const createNegotiation = () => {
    const id = `neg_${nextId}`;
    setNextId(prev => prev + 1);
    
    const startX = 50 + Math.random() * 200;
    const startY = 20;
    
    const newNegotiation: ActiveNegotiation = {
      id,
      nodes: [
        {
          id: `${id}_visitor`,
          stage: 'visitor',
          timestamp: Date.now(),
          x: startX,
          y: startY,
        },
      ],
      age: 0,
    };
    
    setNegotiations(prev => [...prev, newNegotiation]);
    
    // Add proposal after delay
    setTimeout(() => {
      setNegotiations(prev =>
        prev.map(neg => {
          if (neg.id === id) {
            return {
              ...neg,
              nodes: [
                ...neg.nodes,
                {
                  id: `${id}_proposal`,
                  stage: 'proposal',
                  timestamp: Date.now(),
                  parentId: `${id}_visitor`,
                  x: startX + (Math.random() - 0.5) * 60,
                  y: startY + 60,
                },
              ],
            };
          }
          return neg;
        })
      );
    }, 1500);
    
    // Random outcome after another delay
    setTimeout(() => {
      const outcomes: ('accept' | 'refuse' | 'counter')[] = ['accept', 'accept', 'refuse', 'counter'];
      const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];
      
      setNegotiations(prev =>
        prev.map(neg => {
          if (neg.id === id) {
            const lastNode = neg.nodes[neg.nodes.length - 1];
            
            if (outcome === 'counter') {
              // Add counter then accept
              return {
                ...neg,
                nodes: [
                  ...neg.nodes,
                  {
                    id: `${id}_counter`,
                    stage: 'counter',
                    timestamp: Date.now(),
                    parentId: lastNode.id,
                    x: lastNode.x + (Math.random() - 0.5) * 40,
                    y: lastNode.y + 60,
                  },
                ],
              };
            } else {
              return {
                ...neg,
                finalOutcome: outcome,
                nodes: [
                  ...neg.nodes,
                  {
                    id: `${id}_${outcome}`,
                    stage: outcome,
                    timestamp: Date.now(),
                    parentId: lastNode.id,
                    x: lastNode.x + (Math.random() - 0.5) * 40,
                    y: lastNode.y + 60,
                  },
                ],
              };
            }
          }
          return neg;
        })
      );
      
      // If countered, eventually accept
      if (outcome === 'counter') {
        setTimeout(() => {
          setNegotiations(prev =>
            prev.map(neg => {
              if (neg.id === id) {
                const lastNode = neg.nodes[neg.nodes.length - 1];
                return {
                  ...neg,
                  finalOutcome: 'accept',
                  nodes: [
                    ...neg.nodes,
                    {
                      id: `${id}_accept`,
                      stage: 'accept',
                      timestamp: Date.now(),
                      parentId: lastNode.id,
                      x: lastNode.x + (Math.random() - 0.5) * 40,
                      y: lastNode.y + 60,
                    },
                  ],
                };
              }
              return neg;
            })
          );
        }, 2000);
      }
    }, 3500);
  };

  // Spawn new negotiations periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.4 && negotiations.length < 4) {
        createNegotiation();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [negotiations.length, nextId]);

  // Age and cleanup negotiations
  useEffect(() => {
    const interval = setInterval(() => {
      setNegotiations(prev => {
        const updated = prev.map(neg => ({ ...neg, age: neg.age + 1 }));
        // Remove old completed negotiations
        return updated.filter(neg => neg.age < 20);
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Initial negotiation
  useEffect(() => {
    const timer = setTimeout(() => createNegotiation(), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="garden-card p-4 overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-medium flex items-center gap-2">
          <motion.span 
            className="w-2 h-2 rounded-full bg-[var(--garden-cyan)]"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          Negotiation Flow
        </h4>
        <div className="text-xs text-[var(--garden-dim)]">
          {negotiations.length} active
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-4 text-xs">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[var(--garden-cyan)]"></span>
          <span className="text-[var(--garden-dim)]">Visitor</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[var(--garden-purple)]"></span>
          <span className="text-[var(--garden-dim)]">Proposal</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[var(--garden-pink)]"></span>
          <span className="text-[var(--garden-dim)]">Counter</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-400"></span>
          <span className="text-[var(--garden-dim)]">Accept</span>
        </div>
      </div>

      {/* Tree Visualization */}
      <div className="relative h-64 bg-[var(--garden-void)]/50 rounded-lg overflow-hidden">
        <AnimatePresence>
          {negotiations.map((negotiation) => (
            <motion.div
              key={negotiation.id}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Connection lines */}
              {negotiation.nodes.map((node, index) => {
                if (index === 0) return null;
                const parent = negotiation.nodes[index - 1];
                return (
                  <ConnectionLine
                    key={`conn-${node.id}`}
                    from={{ x: parent.x, y: parent.y }}
                    to={{ x: node.x, y: node.y }}
                    stage={node.stage}
                  />
                );
              })}
              
              {/* Nodes */}
              {negotiation.nodes.map((node, index) => (
                <NegotiationNodeComponent
                  key={node.id}
                  node={node}
                  isLast={index === negotiation.nodes.length - 1}
                />
              ))}
            </motion.div>
          ))}
        </AnimatePresence>
        
        {negotiations.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-[var(--garden-dim)] text-sm">
            Waiting for negotiations...
          </div>
        )}
      </div>
    </div>
  );
}
