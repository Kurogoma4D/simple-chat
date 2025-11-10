import { useEffect, useRef, useState } from 'react';
import { WebSocketClient } from '../services/websocket';
import { ServerMessage } from '../../../shared/types/websocket';

interface UseWebSocketOptions {
  url: string;
  onMessage: (message: ServerMessage) => void;
}

export function useWebSocket({ url, onMessage }: UseWebSocketOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const wsClient = useRef<WebSocketClient | null>(null);

  useEffect(() => {
    const client = new WebSocketClient(url);
    wsClient.current = client;

    client.onMessage((message) => {
      onMessage(message);
    });

    client
      .connect()
      .then(() => {
        setIsConnected(true);
        setConnectionError(null);
      })
      .catch((error) => {
        console.error('[useWebSocket] Connection error:', error);
        setConnectionError('WebSocketサーバーへの接続に失敗しました');
        setIsConnected(false);
      });

    // Heartbeat every 30 seconds
    const heartbeatInterval = setInterval(() => {
      if (client.isConnected()) {
        client.heartbeat();
      }
    }, 30000);

    return () => {
      clearInterval(heartbeatInterval);
      client.disconnect();
    };
  }, [url, onMessage]);

  return {
    wsClient: wsClient.current,
    isConnected,
    connectionError,
  };
}
