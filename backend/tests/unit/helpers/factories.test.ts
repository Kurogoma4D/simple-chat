/**
 * Test for factory functions
 */

import { createTestUser, createTestMessage, createTestUserWithMessages } from './factories';
import { MessageType } from './types';
import { isValidUUID } from './validators';

describe('Factory Functions', () => {
  describe('createTestUser', () => {
    it('should create a user with default values', () => {
      const user = createTestUser();

      expect(user).toBeDefined();
      expect(isValidUUID(user.id)).toBe(true);
      expect(user.name).toBe('Test User');
      expect(user.socketId).toBeNull();
      expect(user.isOnline).toBe(false);
      expect(user.lastActiveAt).toBeInstanceOf(Date);
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    it('should allow overriding default values', () => {
      const user = createTestUser({
        name: 'Custom User',
        isOnline: true,
        socketId: 'test-socket-123',
      });

      expect(user.name).toBe('Custom User');
      expect(user.isOnline).toBe(true);
      expect(user.socketId).toBe('test-socket-123');
    });
  });

  describe('createTestMessage', () => {
    it('should create a message with default values', () => {
      const message = createTestMessage();

      expect(message).toBeDefined();
      expect(isValidUUID(message.id)).toBe(true);
      expect(isValidUUID(message.userId as string)).toBe(true);
      expect(message.userName).toBe('Test User');
      expect(message.content).toBe('Test message');
      expect(message.type).toBe(MessageType.USER);
      expect(message.createdAt).toBeInstanceOf(Date);
    });

    it('should allow overriding default values', () => {
      const message = createTestMessage({
        content: 'Custom message',
        type: MessageType.SYSTEM,
        userId: null,
      });

      expect(message.content).toBe('Custom message');
      expect(message.type).toBe(MessageType.SYSTEM);
      expect(message.userId).toBeNull();
    });
  });

  describe('createTestUserWithMessages', () => {
    it('should create a user with default 3 messages', () => {
      const { user, messages } = createTestUserWithMessages();

      expect(user).toBeDefined();
      expect(messages).toHaveLength(3);
      messages.forEach((message, index) => {
        expect(message.userId).toBe(user.id);
        expect(message.userName).toBe(user.name);
        expect(message.content).toBe(`Test message ${index + 1}`);
      });
    });

    it('should allow custom message count', () => {
      const { user, messages } = createTestUserWithMessages(undefined, 5);

      expect(messages).toHaveLength(5);
      messages.forEach((message) => {
        expect(message.userId).toBe(user.id);
      });
    });

    it('should allow overriding user and message values', () => {
      const { user, messages } = createTestUserWithMessages(
        { name: 'Custom User', isOnline: true },
        2,
        { type: MessageType.SYSTEM }
      );

      expect(user.name).toBe('Custom User');
      expect(user.isOnline).toBe(true);
      expect(messages).toHaveLength(2);
      messages.forEach((message) => {
        expect(message.type).toBe(MessageType.SYSTEM);
      });
    });
  });
});
