// LocalStorage utilities for persisting chat history
import type { Message, ExportFormat } from './types';

const STORAGE_KEY = 'phala-chat-history';

export interface StoredConversation {
  messages: Message[];
  lastUpdated: number;
}

export function saveConversation(messages: Message[]): void {
  if (typeof window === 'undefined') return;

  try {
    const data: StoredConversation = {
      messages,
      lastUpdated: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save conversation:', error);
  }
}

export function loadConversation(): Message[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const data: StoredConversation = JSON.parse(stored);
    return data.messages || [];
  } catch (error) {
    console.error('Failed to load conversation:', error);
    return [];
  }
}

export function clearConversation(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear conversation:', error);
  }
}

export function exportConversation(messages: Message[], format: ExportFormat): void {
  let content: string;
  let filename: string;
  let mimeType: string;

  if (format === 'json') {
    content = JSON.stringify(messages, null, 2);
    filename = `phala-chat-${Date.now()}.json`;
    mimeType = 'application/json';
  } else {
    // Text format
    content = formatAsText(messages);
    filename = `phala-chat-${Date.now()}.txt`;
    mimeType = 'text/plain';
  }

  downloadFile(content, filename, mimeType);
}

function formatAsText(messages: Message[]): string {
  const lines: string[] = [
    'Phala Confidential AI Chat Conversation',
    '=' . repeat(50),
    `Exported: ${new Date().toLocaleString()}`,
    `Messages: ${messages.length}`,
    '=' . repeat(50),
    '',
  ];

  messages.forEach((msg, index) => {
    const timestamp = new Date(msg.timestamp).toLocaleString();
    const role = msg.role === 'user' ? 'You' : 'AI';

    lines.push(`[${index + 1}] ${role} - ${timestamp}`);
    lines.push(msg.content);

    if (msg.verification) {
      lines.push('✓ Verified response');
    }

    lines.push('');
    lines.push('-'.repeat(50));
    lines.push('');
  });

  return lines.join('\n');
}

function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
