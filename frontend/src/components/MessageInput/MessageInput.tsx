'use client';

import { useState } from 'react';
import { validateMessageContent } from '../../utils/validation';
import Image from 'next/image';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  disabled?: boolean;
}

export function MessageInput({ onSendMessage, disabled = false }: MessageInputProps) {
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateMessageContent(content)) {
      if (content.trim().length === 0) {
        setError('メッセージを入力してください');
      } else if (content.length > 1000) {
        setError('メッセージは1000文字以内で入力してください');
      } else {
        setError('メッセージが無効です');
      }
      return;
    }

    setError('');
    onSendMessage(content);
    setContent('');
  };

  return (
    <form onSubmit={handleSubmit} className="w-full flex items-center gap-6">
      <div
        className="flex-1 flex items-center px-4 py-1 border rounded-full"
        style={{
          backgroundColor: '#fffbfe',
          borderColor: error ? '#b3261e' : '#79747e',
          height: '56px'
        }}
      >
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="flex-1 bg-transparent focus:outline-none"
          style={{ color: '#1c1b1f' }}
          placeholder="メッセージを入力..."
          maxLength={1000}
          disabled={disabled}
        />
      </div>
      <button
        type="submit"
        disabled={disabled}
        className="flex items-center justify-center rounded-full flex-shrink-0 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          backgroundColor: '#6750a4',
          width: '48px',
          height: '48px'
        }}
      >
        <Image
          src="/send-icon.svg"
          alt="Send"
          width={24}
          height={24}
        />
      </button>
    </form>
  );
}
