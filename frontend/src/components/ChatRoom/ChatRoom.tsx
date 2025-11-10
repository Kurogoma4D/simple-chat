'use client';

import { MessageList } from '../MessageList/MessageList';
import { MessageInput } from '../MessageInput/MessageInput';
import { UserList } from '../UserList/UserList';
import { Message } from '../../../../shared/types/message';
import { User } from '../../../../shared/types/user';

interface ChatRoomProps {
  messages: Message[];
  activeUsers: User[];
  onSendMessage: (content: string) => void;
  isConnected: boolean;
}

export function ChatRoom({ messages, activeUsers, onSendMessage, isConnected }: ChatRoomProps) {
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">チャットルーム</h1>
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-400' : 'bg-red-400'
              }`}
            />
            <span className="text-sm">{isConnected ? '接続中' : '切断'}</span>
          </div>
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col">
          <MessageList messages={messages} />
          <MessageInput onSendMessage={onSendMessage} disabled={!isConnected} />
        </div>
        <UserList users={activeUsers} />
      </div>
    </div>
  );
}
