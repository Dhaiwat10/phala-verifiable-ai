// Scrollable message list component
'use client';

import { useEffect, useRef } from 'react';
import type { Message } from '@/lib/types';
import { MessageBubble } from './MessageBubble';

interface MessageListProps {
  messages: Message[];
  onViewVerification?: (message: Message) => void;
}

export function MessageList({ messages, onViewVerification }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <p className="text-lg mb-2">Welcome to Phala Confidential AI Chat</p>
          <p className="text-sm">
            Start a conversation to test verifiable AI responses
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4">
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          onViewVerification={onViewVerification}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
