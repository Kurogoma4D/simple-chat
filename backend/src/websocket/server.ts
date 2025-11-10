import { Server as HTTPServer } from 'http';
import WebSocket, { WebSocketServer } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { ClientMessage } from '../../../shared/types/websocket';
import { handleJoin } from './handlers/joinHandler';
import { handleMessage } from './handlers/messageHandler';
import { handleDisconnect } from './handlers/disconnectHandler';
import { sendToClient } from './broadcast';

export function setupWebSocketServer(httpServer: HTTPServer): WebSocketServer {
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws: WebSocket) => {
    const socketId = uuidv4();
    console.log(`[WebSocket] New connection: ${socketId}`);

    ws.on('message', async (data: WebSocket.RawData) => {
      try {
        const rawMessage = data.toString();
        const message: ClientMessage = JSON.parse(rawMessage);

        console.log(`[WebSocket] Received message type: ${message.type}`);

        switch (message.type) {
          case 'join':
            await handleJoin(ws, socketId, message);
            break;

          case 'message':
            await handleMessage(ws, socketId, message);
            break;

          case 'heartbeat':
            // Heartbeat - no response needed, just update lastActiveAt
            console.log(`[WebSocket] Heartbeat from ${socketId}`);
            break;

          default:
            console.warn(`[WebSocket] Unknown message type:`, message);
            sendToClient(socketId, {
              type: 'error',
              code: 'INTERNAL_ERROR',
              message: '不明なメッセージタイプです',
            });
        }
      } catch (error) {
        console.error('[WebSocket] Error processing message:', error);
        sendToClient(socketId, {
          type: 'error',
          code: 'INTERNAL_ERROR',
          message: 'メッセージの処理中にエラーが発生しました',
        });
      }
    });

    ws.on('close', async () => {
      console.log(`[WebSocket] Connection closed: ${socketId}`);
      await handleDisconnect(socketId);
    });

    ws.on('error', (error) => {
      console.error(`[WebSocket] Error on connection ${socketId}:`, error);
    });

    // Send ping every 30 seconds to keep connection alive
    const pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.ping();
      } else {
        clearInterval(pingInterval);
      }
    }, 30000);
  });

  console.log('[WebSocket] WebSocket server initialized on /ws');

  return wss;
}
