import WebSocket from 'ws';
import { JoinMessage, WelcomeMessage, UserJoinedMessage } from '../../../../shared/types/websocket';
import { UserService } from '../../services/UserService';
import { MessageService } from '../../services/MessageService';
import { SystemMessageService } from '../../services/SystemMessageService';
import { getValidationError } from '../../utils/validation';
import { connectionManager } from '../connectionManager';
import { broadcastToOthers, sendToClient } from '../broadcast';

export async function handleJoin(
  ws: WebSocket,
  socketId: string,
  message: JoinMessage
): Promise<void> {
  const { name } = message;

  // Validate name
  const validationError = getValidationError('name', name);
  if (validationError) {
    sendToClient(socketId, {
      type: 'error',
      code: 'INVALID_NAME',
      message: validationError,
    });
    return;
  }

  try {
    const userService = new UserService();
    const messageService = new MessageService();
    const systemMessageService = new SystemMessageService();

    // Create or update user
    const user = await userService.join(name, socketId);

    // Add to connection manager
    connectionManager.add(socketId, {
      ws,
      userId: user.id,
      userName: user.name,
    });

    // Get message history
    const history = await messageService.getHistory(100);

    // Send WELCOME message to joining user
    const welcomeMessage: WelcomeMessage = {
      type: 'welcome',
      userId: user.id,
      history: history.map((msg) => ({
        id: msg.id,
        userId: msg.userId,
        userName: msg.userName,
        content: msg.content,
        type: msg.type,
        createdAt: msg.createdAt.toISOString(),
      })),
    };
    sendToClient(socketId, welcomeMessage);

    // Create system message
    const systemMessage = await systemMessageService.createJoinMessage(user.name);

    // Broadcast USER_JOINED to all other clients
    const userJoinedMessage: UserJoinedMessage = {
      type: 'user-joined',
      user: {
        id: user.id,
        name: user.name,
        isOnline: true,
      },
      systemMessage: {
        id: systemMessage.id,
        userId: null,
        userName: systemMessage.userName,
        content: systemMessage.content,
        type: systemMessage.type,
        createdAt: systemMessage.createdAt.toISOString(),
      },
    };
    broadcastToOthers(socketId, userJoinedMessage);

    console.log(`[JoinHandler] User joined: ${user.name} (${user.id})`);
  } catch (error) {
    console.error('[JoinHandler] Error handling join:', error);
    sendToClient(socketId, {
      type: 'error',
      code: 'INTERNAL_ERROR',
      message: 'サーバーエラーが発生しました。再度お試しください。',
    });
  }
}
