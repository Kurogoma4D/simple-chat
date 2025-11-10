import WebSocket from 'ws';
import { ServerMessage } from '../../../shared/types/websocket';
import { connectionManager } from './connectionManager';

export function broadcastToAll(message: ServerMessage): void {
  const connections = connectionManager.getAll();
  const payload = JSON.stringify(message);

  let successCount = 0;
  let failCount = 0;

  connections.forEach((connection) => {
    if (connection.ws.readyState === WebSocket.OPEN) {
      try {
        connection.ws.send(payload);
        successCount++;
      } catch (error) {
        console.error(`[Broadcast] Failed to send to ${connection.userName}:`, error);
        failCount++;
      }
    }
  });

  console.log(
    `[Broadcast] Message sent to ${successCount} clients (${failCount} failed)`
  );
}

export function broadcastToOthers(
  excludeSocketId: string,
  message: ServerMessage
): void {
  const connections = connectionManager.getAll();
  const payload = JSON.stringify(message);

  let successCount = 0;

  connections.forEach((connection) => {
    // Skip the excluded connection
    const socketId = Array.from(connectionManager['connections'].entries()).find(
      ([_, conn]) => conn === connection
    )?.[0];

    if (
      socketId !== excludeSocketId &&
      connection.ws.readyState === WebSocket.OPEN
    ) {
      try {
        connection.ws.send(payload);
        successCount++;
      } catch (error) {
        console.error(`[Broadcast] Failed to send to ${connection.userName}:`, error);
      }
    }
  });

  console.log(`[Broadcast] Message sent to ${successCount} other clients`);
}

export function sendToClient(socketId: string, message: ServerMessage): void {
  const connection = connectionManager.get(socketId);
  if (!connection) {
    console.warn(`[Broadcast] Connection not found: ${socketId}`);
    return;
  }

  if (connection.ws.readyState === WebSocket.OPEN) {
    try {
      connection.ws.send(JSON.stringify(message));
      console.log(`[Broadcast] Message sent to ${connection.userName}`);
    } catch (error) {
      console.error(`[Broadcast] Failed to send to ${connection.userName}:`, error);
    }
  }
}
