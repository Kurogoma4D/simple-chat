/**
 * Test data factory functions
 * These functions create test data with default values that can be overridden
 */

import { randomUUID } from 'crypto';
import { User, Message, MessageType } from './types';

/**
 * Create a test User object with default values
 * @param overrides - Partial User object to override default values
 * @returns Test User object
 */
export function createTestUser(overrides?: Partial<User>): User {
  const now = new Date();
  return {
    id: randomUUID(),
    name: 'Test User',
    socketId: null,
    isOnline: false,
    lastActiveAt: now,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

/**
 * Create a test Message object with default values
 * @param overrides - Partial Message object to override default values
 * @returns Test Message object
 */
export function createTestMessage(overrides?: Partial<Message>): Message {
  const now = new Date();
  return {
    id: randomUUID(),
    userId: randomUUID(),
    userName: 'Test User',
    content: 'Test message',
    type: MessageType.USER,
    createdAt: now,
    ...overrides,
  };
}

/**
 * Create a test User with associated Messages
 * @param userOverrides - Partial User object to override default values
 * @param messageCount - Number of messages to create (default: 3)
 * @param messageOverrides - Partial Message object applied to all messages
 * @returns Object with user and messages array
 */
export function createTestUserWithMessages(
  userOverrides?: Partial<User>,
  messageCount: number = 3,
  messageOverrides?: Partial<Message>
): { user: User; messages: Message[] } {
  const user = createTestUser(userOverrides);
  const messages: Message[] = [];

  for (let i = 0; i < messageCount; i++) {
    messages.push(
      createTestMessage({
        userId: user.id,
        userName: user.name,
        content: `Test message ${i + 1}`,
        ...messageOverrides,
      })
    );
  }

  return { user, messages };
}
