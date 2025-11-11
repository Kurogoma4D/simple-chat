'use client';

import { useState } from 'react';
import { JoinForm } from '../src/components/JoinForm/JoinForm';
import { ChatRoom } from '../src/components/ChatRoom/ChatRoom';
import { ErrorNotification } from '../src/components/ErrorNotification/ErrorNotification';
import { useWebSocket } from '../src/hooks/useWebSocket';
import { useChatRoom } from '../src/hooks/useChatRoom';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001/ws';

export default function Home() {
  const [hasJoined, setHasJoined] = useState(false);

  const { userId, messages, activeUsers, error, handleServerMessage, clearError } = useChatRoom();

  const { join, sendMessage, isConnected, connectionError } = useWebSocket({
    url: WS_URL,
    onMessage: handleServerMessage,
  });

  const handleJoin = (name: string) => {
    console.log('[handleJoin] Called with name:', name, 'isConnected:', isConnected);
    if (!isConnected) {
      console.error('[handleJoin] WebSocket is not connected');
      return;
    }
    join(name);
    setHasJoined(true);
    console.log('[handleJoin] Join message sent, hasJoined set to true');
  };

  const handleSendMessage = (content: string) => {
    if (isConnected) {
      sendMessage(content);
    }
  };

  console.log('[Home] Rendering - hasJoined:', hasJoined, 'userId:', userId, 'isConnected:', isConnected);

  if (!hasJoined || !userId) {
    console.log('[Home] Showing JoinForm');
    return (
      <>
        <JoinForm onJoin={handleJoin} onlineCount={activeUsers.length} />
        {(error || connectionError) && (
          <ErrorNotification
            message={error || connectionError || 'エラーが発生しました'}
            onClose={clearError}
          />
        )}
      </>
    );
  }

  console.log('[Home] Showing ChatRoom');

  return (
    <>
      <ChatRoom
        messages={messages}
        activeUsers={activeUsers}
        onSendMessage={handleSendMessage}
        isConnected={isConnected}
        currentUserId={userId}
      />
      {error && <ErrorNotification message={error} onClose={clearError} />}
    </>
  );
}
