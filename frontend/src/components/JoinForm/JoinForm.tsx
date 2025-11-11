'use client';

import { useState } from 'react';
import { validateUserName } from '../../utils/validation';
import Image from 'next/image';

interface JoinFormProps {
  onJoin: (name: string) => void;
  onlineCount?: number;
}

export function JoinForm({ onJoin, onlineCount = 0 }: JoinFormProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    console.log('Submitting name:', name);

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
    <div className="flex items-center justify-center min-h-screen px-8" style={{ backgroundColor: '#fffbfe' }}>
      <div className="w-full max-w-md flex flex-col gap-12 items-center">
        {/* Header Section */}
        <div className="flex flex-col gap-4 items-center w-full">
          <div
            className="flex items-center justify-center rounded-[20px]"
            style={{
              backgroundColor: '#6750a4',
              width: '80px',
              height: '80px'
            }}
          >
            <Image
              src="/message-circle-icon.svg"
              alt="Chat Icon"
              width={40}
              height={40}
            />
          </div>
          <h1
            className="text-2xl font-bold text-center"
            style={{ color: '#1c1b1f' }}
          >
            チャットアプリへようこそ！
          </h1>
          <p
            className="text-center leading-6"
            style={{ color: '#49454f' }}
          >
            オンラインの人と自由に
            <br />
            会話を楽しみましょう
          </p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
          <div className="flex flex-col gap-2 w-full">
            <label
              htmlFor="name"
              className="font-semibold"
              style={{ color: '#1c1b1f' }}
            >
              あなたの名前
            </label>
            <input
              type="text"
              id="name"
              name="username"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-4 border rounded-xl focus:outline-none focus:ring-2"
              style={{
                backgroundColor: '#fffbfe',
                borderColor: error ? '#b3261e' : '#79747e',
                color: '#1c1b1f'
              }}
              placeholder="名前を入力してください"
              maxLength={50}
              autoComplete='off'
              autoFocus
            />
            {error && (
              <p className="text-sm mt-1" style={{ color: '#b3261e' }}>
                {error}
              </p>
            )}
          </div>

          {/* Guidelines */}
          <div
            className="w-full p-4 rounded-xl flex flex-col gap-3"
            style={{ backgroundColor: '#f7f2fa' }}
          >
            <p
              className="font-semibold text-sm"
              style={{ color: '#6750a4' }}
            >
              ガイドライン
            </p>
            <ul
              className="text-sm space-y-1"
              style={{ color: '#49454f' }}
            >
              <li>• 他のユーザーが識別しやすい名前をお選びください</li>
              <li>• 不適切な名前は避けてください</li>
              <li>• 後から変更することも可能です</li>
            </ul>
          </div>

          {/* Button Section */}
          <button
            type="submit"
            className="w-full py-4 rounded-full font-semibold text-white hover:opacity-90 transition-opacity"
            style={{
              backgroundColor: '#6750a4',
              boxShadow: '0px 2px 8px 0px rgba(0,0,0,0.13)'
            }}
          >
            チャットを開始
          </button>
        </form>

        {/* Footer */}
        <div className="flex flex-col gap-2 items-center">
          <p
            className="text-xs"
            style={{ color: '#49454f' }}
          >
            現在オンライン
          </p>
          <div className="flex gap-2 items-center">
            <div
              className="rounded"
              style={{
                backgroundColor: '#4caf50',
                width: '8px',
                height: '8px'
              }}
            />
            <p
              className="font-medium text-sm"
              style={{ color: '#4caf50' }}
            >
              {onlineCount}人が参加中
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
