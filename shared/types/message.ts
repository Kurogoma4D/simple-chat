export type MessageType = 'USER' | 'SYSTEM';

export interface Message {
  id: string;
  userId: string | null;
  userName: string;
  content: string;
  type: MessageType;
  createdAt: string; // ISO 8601
}
