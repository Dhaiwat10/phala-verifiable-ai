// Hook for chat state management
import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Message, ChatMessage } from '@/lib/types';
import { sendMessageStream } from '@/lib/phala-api';
import { saveConversation, loadConversation } from '@/lib/storage';
import { runVerification } from '@/lib/verification-workflow';

export interface UseChatReturn {
  messages: Message[];
  isStreaming: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  clearChat: () => void;
}

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load conversation from localStorage on mount
  useEffect(() => {
    const loaded = loadConversation();
    if (loaded.length > 0) {
      setMessages(loaded);
    }
  }, []);

  // Save conversation to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      saveConversation(messages);
    }
  }, [messages]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isStreaming) return;

    setError(null);
    setIsStreaming(true);

    // Add user message
    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content: content.trim(),
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);

    // Create assistant message placeholder
    const assistantMessageId = uuidv4();
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      streaming: true,
    };

    setMessages(prev => [...prev, assistantMessage]);

    // Prepare messages for API (convert to ChatMessage format)
    const apiMessages: ChatMessage[] = [...messages, userMessage].map(msg => ({
      role: msg.role,
      content: msg.content,
    }));

    try {
      await sendMessageStream(apiMessages, {
        onChunk: (chunk: string) => {
          setMessages(prev =>
            prev.map(msg =>
              msg.id === assistantMessageId
                ? { ...msg, content: msg.content + chunk }
                : msg
            )
          );
        },
        onComplete: async (verification, rawRequest, rawResponse) => {
          // Update message with verification data and raw request/response
          setMessages(prev =>
            prev.map(msg =>
              msg.id === assistantMessageId
                ? {
                    ...msg,
                    streaming: false,
                    verification,
                    rawRequest,
                    rawResponse,
                  }
                : msg
            )
          );
          setIsStreaming(false);

          // Run verification if we have all required data
          if (verification && rawRequest && rawResponse) {
            try {
              // Find the message we just updated
              const messageToVerify = {
                id: assistantMessageId,
                role: 'assistant' as const,
                content: '', // Will be filled by the state
                timestamp: Date.now(),
                verification,
                rawRequest,
                rawResponse,
              };

              // Get the actual content from state
              setMessages(prev => {
                const msg = prev.find(m => m.id === assistantMessageId);
                if (msg) {
                  messageToVerify.content = msg.content;
                }
                return prev;
              });

              console.log('🔐 Running cryptographic verification...');
              const updatedVerification = await runVerification(messageToVerify);

              // Update message with verification results
              if (updatedVerification) {
                setMessages(prev =>
                  prev.map(msg =>
                    msg.id === assistantMessageId
                      ? { ...msg, verification: updatedVerification }
                      : msg
                  )
                );
              }
            } catch (verifyError) {
              console.error('Verification failed:', verifyError);
            }
          }
        },
        onError: (err) => {
          setError(err.message);
          // Remove the failed assistant message
          setMessages(prev => prev.filter(msg => msg.id !== assistantMessageId));
          setIsStreaming(false);
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      setMessages(prev => prev.filter(msg => msg.id !== assistantMessageId));
      setIsStreaming(false);
    }
  }, [messages, isStreaming]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
    saveConversation([]);
  }, []);

  return {
    messages,
    isStreaming,
    error,
    sendMessage,
    clearChat,
  };
}
