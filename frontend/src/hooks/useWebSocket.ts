import { useEffect, useRef, useState, useCallback } from 'react';
import { WebSocketClient } from '../services/websocket';
import { ServerMessage } from '../../../shared/types/websocket';

interface UseWebSocketOptions {
  url: string;
  onMessage: (message: ServerMessage) => void;
}

export function useWebSocket({ url, onMessage }: UseWebSocketOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const wsClientRef = useRef<WebSocketClient | null>(null);
  const onMessageRef = useRef(onMessage);

  // Keep onMessage ref up to date
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    const client = new WebSocketClient(url);
    wsClientRef.current = client;

    client.onMessage((message) => {
      onMessageRef.current(message);
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
  }, [url]);

  const join = useCallback((name: string) => {
    wsClientRef.current?.join(name);
  }, []);

  const sendMessage = useCallback((content: string) => {
    wsClientRef.current?.sendMessage(content);
  }, []);

  return {
    join,
    sendMessage,
    isConnected,
    connectionError,
  };
}
