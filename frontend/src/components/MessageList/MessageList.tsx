'use client';

import { useEffect, useRef } from 'react';
import { Message } from '../../../../shared/types/message';
import Image from 'next/image';

interface MessageListProps {
  messages: Message[];
  currentUserId?: string;
}

// ユーザー名の最初の文字を取得
function getInitial(name: string): string {
  return name.charAt(0);
}

// ユーザーIDに基づいてアバター色を生成
function getAvatarColor(userId?: string): string {
  if (!userId) return '#6750a4';

  const colors = [
    '#00bcd4', // cyan
    '#ff9800', // orange
    '#4caf50', // green
    '#9c27b0', // purple
    '#f44336', // red
    '#2196f3', // blue
  ];

  const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

export function MessageList({ messages, currentUserId }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {messages.length === 0 && (
        <div
          className="text-center py-8 text-sm"
          style={{ color: '#49454f' }}
        >
          メッセージはまだありません。最初のメッセージを送信しましょう!
        </div>
      )}
      {messages.map((message) => {
        const isMyMessage = message.userId === currentUserId;

        if (message.type === 'SYSTEM') {
          return (
            <div key={message.id} className="flex flex-col items-center w-full">
              <div
                className="px-3 py-2 rounded-2xl"
                style={{ backgroundColor: '#e8f5e8' }}
              >
                <p
                  className="text-xs"
                  style={{ color: '#2e7d32' }}
                >
                  {message.content}
                </p>
              </div>
            </div>
          );
        }

        return (
          <div key={message.id} className="flex flex-col gap-2 w-full">
            <div className={`flex gap-2 items-center ${isMyMessage ? 'justify-end' : ''}`}>
              {/* Avatar (only for other users) */}
              {!isMyMessage && (
                <div
                  className="flex items-center justify-center rounded-2xl flex-shrink-0"
                  style={{
                    backgroundColor: getAvatarColor(message.userId || undefined),
                    width: '32px',
                    height: '32px'
                  }}
                >
                  <p className="text-xs font-semibold text-white">
                    {getInitial(message.userName || '')}
                  </p>
                </div>
              )}

              {/* Message Content */}
              <div className={`flex flex-col gap-0.5 ${isMyMessage ? 'items-end' : 'items-start'}`}>
                <p
                  className="text-xs font-semibold"
                  style={{ color: '#49454f' }}
                >
                  {message.userName}
                </p>
                <div
                  className="px-4 py-3"
                  style={{
                    backgroundColor: isMyMessage ? '#6750a4' : '#e7e0ec',
                    color: isMyMessage ? '#ffffff' : '#1c1b1f',
                    borderRadius: isMyMessage
                      ? '18px 18px 4px 18px'
                      : '18px 18px 18px 4px'
                  }}
                >
                  <p className="text-sm leading-relaxed break-words">{message.content}</p>
                </div>
              </div>

              {!isMyMessage && <div className="flex-1" />}
            </div>

            {/* Timestamp */}
            <div className={`flex gap-2 items-center ${isMyMessage ? 'justify-end' : ''}`}>
              {!isMyMessage && <div style={{ width: '40px' }} />}
              <p
                className="text-xs"
                style={{ color: '#49454f' }}
              >
                {formatTime(message.createdAt)}
              </p>
              {isMyMessage && (
                <Image
                  src="/check-icon.svg"
                  alt="Sent"
                  width={16}
                  height={16}
                />
              )}
              {isMyMessage && <div style={{ width: '8px' }} />}
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </>
  );
}
