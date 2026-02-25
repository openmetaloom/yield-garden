'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import type { StreamMessage, GardenNegotiation } from '@yield-garden/shared';
import { formatAddress, formatTimestamp } from '@/lib/utils';
import MessageCard from '@/components/MessageCard';
import NegotiationTree from '@/components/visualization/NegotiationTree';
import MessageFlow from '@/components/visualization/MessageFlow';

interface SimpleMessageCardProps {
  message: StreamMessage;
}

function SimpleMessageCard({ message }: SimpleMessageCardProps) {
  const isOutgoing = message.direction === 'out';
  
  return (
    <div
      className={`p-3 rounded-lg mb-2 max-w-[85%] ${
        isOutgoing
          ? 'bg-green-50 dark:bg-green-900/20 ml-auto'
          : 'bg-gray-50 dark:bg-gray-800 mr-auto'
      }`}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs font-medium text-gray-500">
          {formatAddress(message.sender)}
        </span>
        <span className="text-xs text-gray-400">
          {formatTimestamp(message.timestamp)}
        </span>
        {isOutgoing && (
          <span className="text-xs bg-green-100 text-green-800 px-1.5 rounded">
            Agent
          </span>
        )}
      </div>
      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
    </div>
  );
}

interface NegotiationCardProps {
  negotiation: GardenNegotiation;
}

function NegotiationCard({ negotiation }: NegotiationCardProps) {
  const getStatusColor = () => {
    if (negotiation.paymentAuthorized) return 'bg-green-100 text-green-800';
    if (negotiation.accepted) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getStatusText = () => {
    if (negotiation.paymentAuthorized) return 'Paid';
    if (negotiation.accepted) return 'Accepted';
    return 'Negotiating';
  };

  return (
    <motion.div 
      className="garden-card p-3 mb-2"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 100, damping: 15 }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-[var(--garden-cyan)]">{formatAddress(negotiation.userAddress)}</span>
        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor()}`}>
          {getStatusText()}
        </span>
      </div>
      
      <div className="text-xs text-[var(--garden-dim)] space-y-1">
        <div className="flex justify-between">
          <span>Messages:</span>
          <span className="text-[var(--garden-text)]">{negotiation.messages.length}</span>
        </div>
        
        {negotiation.counterOffer && (
          <div className="flex justify-between">
            <span>Counter Offer:</span>
            <span className="text-[var(--garden-pink)]">${negotiation.counterOffer}</span>
          </div>
        )}
        
        <div className="flex justify-between">
          <span>Updated:</span>
          <span>{formatTimestamp(negotiation.updatedAt)}</span>
        </div>
      </div>
    </motion.div>
  );
}

export default function GardenStream() {
  const [messages, setMessages] = useState<StreamMessage[]>([]);
  const [negotiations, setNegotiations] = useState<GardenNegotiation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'messages' | 'negotiations'>('messages');
  const [useThemedCards, setUseThemedCards] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [messagesRes, negotiationsRes] = await Promise.all([
          fetch('/api/garden/stream?limit=50'),
          fetch('/api/garden/negotiations'),
        ]);
        
        const messagesData = await messagesRes.json();
        const negotiationsData = await negotiationsRes.json();
        
        if (messagesData.success) {
          setMessages(messagesData.data);
        }
        if (negotiationsData.success) {
          setNegotiations(negotiationsData.data);
        }
      } catch (error) {
        console.error('Failed to fetch garden data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeTab === 'messages') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab]);

  if (loading) {
    return (
      <div className="garden-card p-4 h-96 flex items-center justify-center">
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
      {/* Visualizations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <NegotiationTree />
        <MessageFlow mode="garden" />
      </div>

      {/* Message Stream */}
      <div className="garden-card">
        <div className="p-4 border-b border-[var(--garden-cyan)]/20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-medium text-[var(--garden-text)]">🌱 Garden Stream</h2>
              <p className="text-sm text-[var(--garden-dim)]">Real-time Garden agent messages</p>
            </div>
            <button
              onClick={() => setUseThemedCards(!useThemedCards)}
              className="text-xs px-3 py-1 bg-[var(--garden-cyan)]/10 hover:bg-[var(--garden-cyan)]/20 text-[var(--garden-cyan)] transition-colors rounded-full"
            >
              {useThemedCards ? 'Simple View' : 'Themed View'}
            </button>
          </div>
          
          <div className="flex gap-2">
            <motion.button
              onClick={() => setActiveTab('messages')}
              className={`px-4 py-2 text-sm rounded-full transition-colors ${
                activeTab === 'messages'
                  ? 'bg-[var(--garden-cyan)] text-[var(--garden-void)]'
                  : 'bg-[var(--garden-cyan)]/10 text-[var(--garden-cyan)]'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Messages
            </motion.button>
            
            <motion.button
              onClick={() => setActiveTab('negotiations')}
              className={`px-4 py-2 text-sm rounded-full transition-colors ${
                activeTab === 'negotiations'
                  ? 'bg-[var(--garden-purple)] text-white'
                  : 'bg-[var(--garden-purple)]/10 text-[var(--garden-purple)]'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Negotiations ({negotiations.length})
            </motion.button>
          </div>
        </div>
        
        <div className="p-4 h-96 overflow-y-auto garden-scroll">
          {activeTab === 'messages' ? (
            messages.length === 0 ? (
              <p className="text-[var(--garden-dim)] text-center">No messages yet</p>
            ) : (
              messages.map((message) => (
                useThemedCards ? (
                  <MessageCard key={message.id} message={message} theme="garden" />
                ) : (
                  <SimpleMessageCard key={message.id} message={message} />
                )
              ))
            )
          ) : (
            negotiations.length === 0 ? (
              <p className="text-[var(--garden-dim)] text-center">No active negotiations</p>
            ) : (
              negotiations.map((negotiation) => (
                <NegotiationCard key={negotiation.conversationId} negotiation={negotiation} />
              ))
            )
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
}
