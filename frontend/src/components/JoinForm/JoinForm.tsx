'use client';

import { useState } from 'react';
import { validateUserName } from '../../utils/validation';

interface JoinFormProps {
  onJoin: (name: string) => void;
}

export function JoinForm({ onJoin }: JoinFormProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateUserName(name)) {
      if (name.trim().length === 0) {
        setError('ユーザー名を入力してください');
      } else if (name.length > 50) {
        setError('ユーザー名は50文字以内で入力してください');
      } else {
        setError('ユーザー名が無効です');
      }
      return;
    }

    setError('');
    onJoin(name);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">チャットルームに参加</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              ユーザー名
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="ユーザー名を入力"
              maxLength={50}
              autoFocus
            />
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            参加
          </button>
        </form>
      </div>
    </div>
  );
}
