'use client';

import { useEffect, useRef } from 'react';
import { Message } from '../../../../shared/types/message';

interface MessageListProps {
  messages: Message[];
}

export function MessageList({ messages }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-2">
      {messages.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          メッセージはまだありません。最初のメッセージを送信しましょう!
        </div>
      )}
      {messages.map((message) => (
        <div
          key={message.id}
          className={`p-3 rounded-lg ${
            message.type === 'SYSTEM'
              ? 'bg-gray-100 text-gray-600 text-center text-sm'
              : 'bg-white border border-gray-200'
          }`}
        >
          {message.type === 'USER' ? (
            <>
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-sm text-gray-900">{message.userName}</span>
                <span className="text-xs text-gray-500">{formatTime(message.createdAt)}</span>
              </div>
              <p className="text-gray-800">{message.content}</p>
            </>
          ) : (
            <p>{message.content}</p>
          )}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
