// Individual message bubble component
'use client';

import { useState } from 'react';
import type { Message } from '@/lib/types';
import { formatTimestamp, copyToClipboard } from '@/lib/utils';
import { StreamingText } from './StreamingText';
import { VerificationBadge } from './VerificationBadge';

interface MessageBubbleProps {
  message: Message;
  onViewVerification?: (message: Message) => void;
}

export function MessageBubble({ message, onViewVerification }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = async () => {
    try {
      await copyToClipboard(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[80%] ${isUser ? 'order-2' : 'order-1'}`}>
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <StreamingText content={message.content} isStreaming={message.streaming} />
          )}
        </div>

        <div className="flex items-center gap-2 mt-1 px-2 flex-wrap">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {formatTimestamp(message.timestamp)}
          </span>

          {!isUser && (
            <>
              <VerificationBadge verification={message.verification} />

              <button
                onClick={handleCopy}
                className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                title="Copy message"
              >
                {copied ? '✓ Copied' : 'Copy'}
              </button>

              {message.verification && onViewVerification && (
                <button
                  onClick={() => onViewVerification(message)}
                  className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                  title="View verification proof"
                >
                  View Verification
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
