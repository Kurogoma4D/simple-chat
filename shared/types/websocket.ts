import { Message } from './message';
import { User } from './user';

// ========================================
// Client → Server Messages
// ========================================

export type ClientMessage =
  | JoinMessage
  | SendMessageMessage
  | HeartbeatMessage;

export interface JoinMessage {
  type: 'join';
  name: string;
}

export interface SendMessageMessage {
  type: 'message';
  content: string;
}

export interface HeartbeatMessage {
  type: 'heartbeat';
}

// ========================================
// Server → Client Messages
// ========================================

export type ServerMessage =
  | WelcomeMessage
  | MessageBroadcast
  | UserJoinedMessage
  | UserLeftMessage
  | ActiveUsersMessage
  | ErrorMessage;

export interface WelcomeMessage {
  type: 'welcome';
  userId: string;
  history: Message[];
}

export interface MessageBroadcast {
  type: 'message';
  message: Message;
}

export interface UserJoinedMessage {
  type: 'user-joined';
  user: User;
  systemMessage: Message;
}

export interface UserLeftMessage {
  type: 'user-left';
  userId: string;
  systemMessage: Message;
}

export interface ActiveUsersMessage {
  type: 'active-users';
  users: User[];
}

export interface ErrorMessage {
  type: 'error';
  code: ErrorCode;
  message: string;
}

// ========================================
// Error Codes
// ========================================

export type ErrorCode =
  | 'INVALID_NAME'
  | 'INVALID_MESSAGE'
  | 'NOT_JOINED'
  | 'RATE_LIMIT'
  | 'INTERNAL_ERROR';
