'use client';

import { MessageList } from '../MessageList/MessageList';
import { MessageInput } from '../MessageInput/MessageInput';
import { Message } from '../../../../shared/types/message';
import { User } from '../../../../shared/types/user';
import Image from 'next/image';

interface ChatRoomProps {
  messages: Message[];
  activeUsers: User[];
  onSendMessage: (content: string) => void;
  isConnected: boolean;
  currentUserId?: string;
}

export function ChatRoom({ messages, activeUsers, onSendMessage, isConnected, currentUserId }: ChatRoomProps) {
  return (
    <div
      className="flex flex-col h-screen"
      style={{ backgroundColor: '#fffbfe' }}
    >
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        <MessageList messages={messages} currentUserId={currentUserId} />
      </div>

      {/* Bottom Section */}
      <div className="flex flex-col">
        {/* Online Users Bar */}
        <div
          className="flex items-center justify-between px-4 py-3 h-9"
          style={{ backgroundColor: '#f7f2fa' }}
        >
          <div className="flex items-center gap-2">
            <div
              className="rounded"
              style={{
                backgroundColor: '#4caf50',
                width: '8px',
                height: '8px'
              }}
            />
            <p
              className="text-xs font-medium"
              style={{ color: '#49454f' }}
            >
              {activeUsers.length}人がオンライン
            </p>
          </div>
          <Image
            src="/users-icon.svg"
            alt="Users"
            width={16}
            height={16}
          />
        </div>

        {/* Message Input Bar */}
        <div
          className="p-4 flex items-center gap-6"
          style={{ backgroundColor: '#f7f2fa' }}
        >
          <MessageInput onSendMessage={onSendMessage} disabled={!isConnected} />
        </div>
      </div>
    </div>
  );
}
