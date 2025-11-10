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
  const [userName, setUserName] = useState('');

  const { userId, messages, activeUsers, error, handleServerMessage, clearError } = useChatRoom();

  const { wsClient, isConnected, connectionError } = useWebSocket({
    url: WS_URL,
    onMessage: handleServerMessage,
  });

  const handleJoin = (name: string) => {
    setUserName(name);
    if (wsClient) {
      wsClient.join(name);
      setHasJoined(true);
    }
  };

  const handleSendMessage = (content: string) => {
    if (wsClient && isConnected) {
      wsClient.sendMessage(content);
    }
  };

  if (!hasJoined || !userId) {
    return (
      <>
        <JoinForm onJoin={handleJoin} />
        {(error || connectionError) && (
          <ErrorNotification
            message={error || connectionError || 'エラーが発生しました'}
            onClose={clearError}
          />
        )}
      </>
    );
  }

  return (
    <>
      <ChatRoom
        messages={messages}
        activeUsers={activeUsers}
        onSendMessage={handleSendMessage}
        isConnected={isConnected}
      />
      {error && <ErrorNotification message={error} onClose={clearError} />}
    </>
  );
}
