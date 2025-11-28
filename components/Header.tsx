// Header component with theme toggle and export
'use client';

import type { Message, ExportFormat } from '@/lib/types';
import { exportConversation } from '@/lib/storage';

interface HeaderProps {
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  messages: Message[];
  onClearChat: () => void;
}

export function Header({ theme, onToggleTheme, messages, onClearChat }: HeaderProps) {
  const handleExport = (format: ExportFormat) => {
    if (messages.length === 0) {
      alert('No messages to export');
      return;
    }
    exportConversation(messages, format);
  };

  return (
    <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Phala Confidential AI Chat
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Verifiable AI responses with TEE proofs
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Clear chat button */}
          {messages.length > 0 && (
            <button
              onClick={onClearChat}
              className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
              title="Clear chat"
            >
              Clear
            </button>
          )}

          {/* Export dropdown */}
          {messages.length > 0 && (
            <div className="relative group">
              <button className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors">
                Export ▾
              </button>
              <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <button
                  onClick={() => handleExport('json')}
                  className="block w-full px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg"
                >
                  As JSON
                </button>
                <button
                  onClick={() => handleExport('txt')}
                  className="block w-full px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-b-lg"
                >
                  As Text
                </button>
              </div>
            </div>
          )}

          {/* Theme toggle */}
          <button
            onClick={onToggleTheme}
            className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </div>
    </header>
  );
}
