'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import type { StreamMessage } from '@/types';
import { formatAddress, formatTimestamp } from '@/lib/utils';
import MessageCard from '@/components/MessageCard';
import FarmActivityGrid from '@/components/visualization/FarmActivityGrid';
import MessageFlow from '@/components/visualization/MessageFlow';

interface SimpleMessageCardProps {
  message: StreamMessage;
}

function SimpleMessageCard({ message }: SimpleMessageCardProps) {
  const isOutgoing = message.direction === 'out';
  
  return (
    <div
      className={`p-3 rounded mb-2 max-w-[85%] ${
        isOutgoing
          ? 'bg-blue-50 dark:bg-blue-900/20 ml-auto'
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
          <span className="text-xs bg-blue-100 text-blue-800 px-1.5 rounded">
            Agent
          </span>
        )}
      </div>
      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
    </div>
  );
}

export default function FarmStream() {
  const [messages, setMessages] = useState<StreamMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [useThemedCards, setUseThemedCards] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch('/api/farm/stream?limit=50');
        const data = await response.json();
        if (data.success) {
          setMessages(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch farm stream:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (loading) {
    return (
      <div className="farm-card p-4 h-96 flex items-center justify-center">
        <motion.div
          className="w-8 h-8 border-2 border-[var(--farm-teal)] border-t-transparent"
          animate={{ rotate: 360 }}
          transition={{ type: 'tween', ease: 'linear', duration: 1, repeat: Infinity }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Visualizations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FarmActivityGrid />
        <MessageFlow mode="farm" />
      </div>

      {/* Message Stream */}
      <div className="farm-card">
        <div className="p-4 border-b border-[var(--farm-gray)] flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[var(--farm-white)]">🚜 Farm Stream</h2>
            <p className="text-sm text-gray-500">Real-time Farm agent messages</p>
          </div>
          <button
            onClick={() => setUseThemedCards(!useThemedCards)}
            className="text-xs px-3 py-1 bg-[var(--farm-gray)] hover:bg-[var(--farm-teal)] hover:text-black transition-colors rounded"
          >
            {useThemedCards ? 'Simple View' : 'Themed View'}
          </button>
        </div>
        
        <div className="p-4 h-96 overflow-y-auto farm-scroll">
          {messages.length === 0 ? (
            <p className="text-gray-500 text-center">No messages yet</p>
          ) : (
            messages.map((message) => (
              useThemedCards ? (
                <MessageCard key={message.id} message={message} theme="farm" />
              ) : (
                <SimpleMessageCard key={message.id} message={message} />
              )
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
}
