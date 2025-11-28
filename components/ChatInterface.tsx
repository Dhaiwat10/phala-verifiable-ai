// Main chat interface component
'use client';

import { useState } from 'react';
import type { Message } from '@/lib/types';
import { useChat } from '@/hooks/useChat';
import { useTheme } from '@/hooks/useTheme';
import { Header } from './Header';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { VerificationPanel } from './VerificationPanel';

export function ChatInterface() {
  const { messages, isStreaming, error, sendMessage, clearChat } = useChat();
  const [theme, toggleTheme] = useTheme();
  const [verificationMessage, setVerificationMessage] = useState<Message | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const handleViewVerification = (message: Message) => {
    setVerificationMessage(message);
    setIsPanelOpen(true);
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
    setTimeout(() => setVerificationMessage(null), 300); // Clear after animation
  };

  const handleClearChat = () => {
    if (confirm('Are you sure you want to clear all messages?')) {
      clearChat();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-950">
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        messages={messages}
        onClearChat={handleClearChat}
      />

      <MessageList
        messages={messages}
        onViewVerification={handleViewVerification}
      />

      {error && (
        <div className="px-4 py-2 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm border-t border-red-200 dark:border-red-800">
          Error: {error}
        </div>
      )}

      <ChatInput
        onSend={sendMessage}
        disabled={isStreaming}
      />

      <VerificationPanel
        message={verificationMessage}
        isOpen={isPanelOpen}
        onClose={handleClosePanel}
      />
    </div>
  );
}
