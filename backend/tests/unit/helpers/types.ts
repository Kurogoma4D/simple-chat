/**
 * Test type definitions for User and Message entities
 * These types match the Prisma-generated types
 */

/**
 * Message type enum
 */
export enum MessageType {
  USER = 'USER',
  SYSTEM = 'SYSTEM'
}

/**
 * User entity type
 */
export interface User {
  /** User's unique identifier (UUID v4) */
  id: string;

  /** User's display name (max 50 characters) */
  name: string;

  /** WebSocket connection ID (set only when connected, null when disconnected) */
  socketId: string | null;

  /** Online status (true when connected, false when disconnected) */
  isOnline: boolean;

  /** Last active timestamp */
  lastActiveAt: Date;

  /** User creation timestamp */
  createdAt: Date;

  /** Last update timestamp (automatically updated) */
  updatedAt: Date;
}

/**
 * Message entity type
 */
export interface Message {
  /** Message's unique identifier (UUID v4) */
  id: string;

  /** Sender's user ID (null for system messages) */
  userId: string | null;

  /** Sender's username at send time (snapshot, max 50 characters) */
  userName: string;

  /** Message content (max 1000 characters) */
  content: string;

  /** Message type ("USER" or "SYSTEM") */
  type: MessageType;

  /** Message creation timestamp */
  createdAt: Date;
}
