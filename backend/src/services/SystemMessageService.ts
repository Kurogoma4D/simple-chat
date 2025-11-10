import { MessageService } from './MessageService';
import { Message } from '@prisma/client';

export class SystemMessageService {
  private messageService: MessageService;

  constructor() {
    this.messageService = new MessageService();
  }

  async createJoinMessage(userName: string): Promise<Message> {
    const content = `${userName}さんが参加しました`;
    return await this.messageService.createSystemMessage(userName, content);
  }

  async createLeaveMessage(userName: string): Promise<Message> {
    const content = `${userName}さんが退出しました`;
    return await this.messageService.createSystemMessage(userName, content);
  }
}
