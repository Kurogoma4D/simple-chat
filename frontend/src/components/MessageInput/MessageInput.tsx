'use client';

import { useState } from 'react';
import { validateMessageContent } from '../../utils/validation';

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
    <form onSubmit={handleSubmit} className="p-4 border-t border-gray-300">
      {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="メッセージを入力"
          maxLength={1000}
          disabled={disabled}
        />
        <button
          type="submit"
          disabled={disabled}
          className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          送信
        </button>
      </div>
    </form>
  );
}
