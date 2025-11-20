import prisma from '../db';
import { Message, MessageType } from '@prisma/client';

export class MessageService {
  async create(
    userId: string,
    userName: string,
    content: string,
    type: MessageType = 'USER'
  ): Promise<Message> {
    return await prisma.message.create({
      data: {
        userId,
        userName,
        content,
        type,
      },
    });
  }

  async createSystemMessage(userName: string, content: string): Promise<Message> {
    return await prisma.message.create({
      data: {
        userId: null,
        userName,
        content,
        type: 'SYSTEM',
      },
    });
  }

  async getHistory(limit: number = 100): Promise<Message[]> {
    const messages = await prisma.message.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    // Reverse to chronological order
    return messages.reverse();
  }

  async broadcast(message: Message): Promise<void> {
    // This method will be used by WebSocket server to broadcast
    // The actual broadcast logic is in the WebSocket layer
    console.log('[MessageService] Message ready for broadcast:', message.id);
  }

  /**
   * Delete all messages from the database
   * Used when all users have left the chat room
   * @returns Number of deleted messages
   */
  async clearAllMessages(): Promise<number> {
    const result = await prisma.message.deleteMany({});
    return result.count;
  }
}
