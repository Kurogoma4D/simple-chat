import WebSocket from 'ws';
import { SendMessageMessage, MessageBroadcast } from '../../../../shared/types/websocket';
import { MessageService } from '../../services/MessageService';
import { getValidationError } from '../../utils/validation';
import { connectionManager } from '../connectionManager';
import { broadcastToAll, sendToClient } from '../broadcast';
import { messageRateLimiter } from '../../middleware/rateLimiter';

export async function handleMessage(
  ws: WebSocket,
  socketId: string,
  message: SendMessageMessage
): Promise<void> {
  const { content } = message;

  // Get connection info
  const connection = connectionManager.get(socketId);
  if (!connection) {
    sendToClient(socketId, {
      type: 'error',
      code: 'NOT_JOINED',
      message: 'チャットルームに参加してください',
    });
    return;
  }

  // Validate message content
  const validationError = getValidationError('message', content);
  if (validationError) {
    sendToClient(socketId, {
      type: 'error',
      code: 'INVALID_MESSAGE',
      message: validationError,
    });
    return;
  }

  // Check rate limit
  if (!messageRateLimiter.check(connection.userId)) {
    const remainingTime = Math.ceil(messageRateLimiter.getRemainingTime(connection.userId) / 1000);
    sendToClient(socketId, {
      type: 'error',
      code: 'RATE_LIMIT',
      message: `送信制限に達しました。${remainingTime}秒後に再度お試しください。`,
    });
    return;
  }

  try {
    const messageService = new MessageService();

    // Save message to database
    const savedMessage = await messageService.create(
      connection.userId,
      connection.userName,
      content,
      'USER'
    );

    // Broadcast to all clients
    const broadcastMessage: MessageBroadcast = {
      type: 'message',
      message: {
        id: savedMessage.id,
        userId: savedMessage.userId,
        userName: savedMessage.userName,
        content: savedMessage.content,
        type: savedMessage.type,
        createdAt: savedMessage.createdAt.toISOString(),
      },
    };
    broadcastToAll(broadcastMessage);

    console.log(`[MessageHandler] Message from ${connection.userName}: ${content.substring(0, 50)}...`);
  } catch (error) {
    console.error('[MessageHandler] Error handling message:', error);
    sendToClient(socketId, {
      type: 'error',
      code: 'INTERNAL_ERROR',
      message: 'メッセージの送信に失敗しました',
    });
  }
}
