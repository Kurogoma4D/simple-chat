import { UserService } from '../../services/UserService';
import { SystemMessageService } from '../../services/SystemMessageService';
import { connectionManager } from '../connectionManager';
import { broadcastToAll } from '../broadcast';
import { UserLeftMessage } from '../../../../shared/types/websocket';

export async function handleDisconnect(socketId: string): Promise<void> {
  const connection = connectionManager.remove(socketId);
  if (!connection) {
    console.log(`[DisconnectHandler] No connection found for ${socketId}`);
    return;
  }

  try {
    const userService = new UserService();
    const systemMessageService = new SystemMessageService();

    // Update user to offline
    await userService.leave(connection.userId);

    // Create system message
    const systemMessage = await systemMessageService.createLeaveMessage(connection.userName);

    // Broadcast USER_LEFT to all clients
    const userLeftMessage: UserLeftMessage = {
      type: 'user-left',
      userId: connection.userId,
      systemMessage: {
        id: systemMessage.id,
        userId: null,
        userName: systemMessage.userName,
        content: systemMessage.content,
        type: systemMessage.type,
        createdAt: systemMessage.createdAt.toISOString(),
      },
    };
    broadcastToAll(userLeftMessage);

    console.log(`[DisconnectHandler] User left: ${connection.userName} (${connection.userId})`);
  } catch (error) {
    console.error('[DisconnectHandler] Error handling disconnect:', error);
  }
}
