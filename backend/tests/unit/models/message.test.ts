/**
 * Message model unit tests
 * Tests for Message entity validation, type handling, and relationships
 */

import { PrismaClient, MessageType } from '@prisma/client';
import { setupTestDatabase, teardownTestDatabase, clearTestData } from '../../integration/setup/db-setup';
import { expectMessageToMatchSchema, isValidUUID } from '../helpers/validators';

describe('Message Model', () => {
  let prisma: PrismaClient;

  beforeAll(async () => {
    prisma = await setupTestDatabase();
  });

  afterAll(async () => {
    await teardownTestDatabase(prisma);
  });

  beforeEach(async () => {
    await clearTestData(prisma);
  });

  describe('T018: Valid user message creation', () => {
    it('should create a message with valid user data', async () => {
      const user = await prisma.user.create({
        data: { name: '山田太郎' },
      });

      const message = await prisma.message.create({
        data: {
          userId: user.id,
          userName: user.name,
          content: 'こんにちは！',
          type: MessageType.USER,
        },
      });

      expect(message).toBeDefined();
      expectMessageToMatchSchema(message);
      expect(message.userId).toBe(user.id);
      expect(message.userName).toBe(user.name);
      expect(message.content).toBe('こんにちは！');
      expect(message.type).toBe(MessageType.USER);
    });

    it('should generate UUID for id automatically', async () => {
      const user = await prisma.user.create({
        data: { name: 'Test User' },
      });

      const message = await prisma.message.create({
        data: {
          userId: user.id,
          userName: user.name,
          content: 'Test message',
          type: MessageType.USER,
        },
      });

      expect(isValidUUID(message.id)).toBe(true);
    });

    it('should establish relationship between User and Message', async () => {
      const user = await prisma.user.create({
        data: { name: 'Test User' },
      });

      const message = await prisma.message.create({
        data: {
          userId: user.id,
          userName: user.name,
          content: 'Test message',
          type: MessageType.USER,
        },
      });

      const messageWithUser = await prisma.message.findUnique({
        where: { id: message.id },
        include: { user: true },
      });

      expect(messageWithUser?.user?.id).toBe(user.id);
      expect(messageWithUser?.user?.name).toBe(user.name);
    });
  });

  describe('T019: Valid system message creation', () => {
    it('should create a system message with userId=null', async () => {
      const message = await prisma.message.create({
        data: {
          userId: null,
          userName: 'システム',
          content: 'チャットルームが開始されました',
          type: MessageType.SYSTEM,
        },
      });

      expect(message).toBeDefined();
      expectMessageToMatchSchema(message);
      expect(message.userId).toBeNull();
      expect(message.userName).toBe('システム');
      expect(message.type).toBe(MessageType.SYSTEM);
    });

    it('should create system message for user join event', async () => {
      const user = await prisma.user.create({
        data: { name: '新規ユーザー' },
      });

      const message = await prisma.message.create({
        data: {
          userId: null,
          userName: 'システム',
          content: `${user.name}さんが参加しました`,
          type: MessageType.SYSTEM,
        },
      });

      expect(message.userId).toBeNull();
      expect(message.type).toBe(MessageType.SYSTEM);
      expect(message.content).toContain(user.name);
    });

    it('should create system message for user leave event', async () => {
      const user = await prisma.user.create({
        data: { name: '退出ユーザー' },
      });

      const message = await prisma.message.create({
        data: {
          userId: null,
          userName: 'システム',
          content: `${user.name}さんが退出しました`,
          type: MessageType.SYSTEM,
        },
      });

      expect(message.userId).toBeNull();
      expect(message.type).toBe(MessageType.SYSTEM);
      expect(message.content).toContain(user.name);
    });
  });

  describe('T020: Validation', () => {
    // Note: Application-level validation should be implemented in service/controller layers

    it('should accept empty content (app-level validation needed)', async () => {
      const user = await prisma.user.create({
        data: { name: 'Test User' },
      });

      const message = await prisma.message.create({
        data: {
          userId: user.id,
          userName: user.name,
          content: '',
          type: MessageType.USER,
        },
      });

      expect(message.content).toBe('');
      // TODO: Add app-level validation to reject empty content
    });

    it('should accept content longer than 1000 characters (app-level validation needed)', async () => {
      const user = await prisma.user.create({
        data: { name: 'Test User' },
      });

      const longContent = 'a'.repeat(1001);

      const message = await prisma.message.create({
        data: {
          userId: user.id,
          userName: user.name,
          content: longContent,
          type: MessageType.USER,
        },
      });

      expect(message.content.length).toBe(1001);
      // TODO: Add app-level validation to enforce max length 1000
    });

    it('should accept content with exactly 1000 characters', async () => {
      const user = await prisma.user.create({
        data: { name: 'Test User' },
      });

      const exactContent = 'a'.repeat(1000);

      const message = await prisma.message.create({
        data: {
          userId: user.id,
          userName: user.name,
          content: exactContent,
          type: MessageType.USER,
        },
      });

      expect(message.content).toBe(exactContent);
      expect(message.content.length).toBe(1000);
    });

    it('should only accept USER or SYSTEM for type', async () => {
      const user = await prisma.user.create({
        data: { name: 'Test User' },
      });

      const userMessage = await prisma.message.create({
        data: {
          userId: user.id,
          userName: user.name,
          content: 'User message',
          type: MessageType.USER,
        },
      });

      expect(userMessage.type).toBe(MessageType.USER);

      const systemMessage = await prisma.message.create({
        data: {
          userId: null,
          userName: 'システム',
          content: 'System message',
          type: MessageType.SYSTEM,
        },
      });

      expect(systemMessage.type).toBe(MessageType.SYSTEM);
    });
  });

  describe('T021: userId-userName consistency', () => {
    it('should store userName as snapshot at message creation', async () => {
      const user = await prisma.user.create({
        data: { name: '元の名前' },
      });

      const message = await prisma.message.create({
        data: {
          userId: user.id,
          userName: user.name,
          content: 'Test message',
          type: MessageType.USER,
        },
      });

      // Update user name
      await prisma.user.update({
        where: { id: user.id },
        data: { name: '新しい名前' },
      });

      // Message userName should remain unchanged (snapshot)
      const unchangedMessage = await prisma.message.findUnique({
        where: { id: message.id },
      });

      expect(unchangedMessage?.userName).toBe('元の名前');
      expect(unchangedMessage?.userName).not.toBe('新しい名前');
    });

    it('should preserve userName even after user deletion', async () => {
      const user = await prisma.user.create({
        data: { name: '削除されるユーザー' },
      });

      const message = await prisma.message.create({
        data: {
          userId: user.id,
          userName: user.name,
          content: 'This message should persist',
          type: MessageType.USER,
        },
      });

      // Delete user (should set userId to null but preserve userName)
      await prisma.user.delete({
        where: { id: user.id },
      });

      const orphanedMessage = await prisma.message.findUnique({
        where: { id: message.id },
      });

      expect(orphanedMessage?.userId).toBeNull();
      expect(orphanedMessage?.userName).toBe('削除されるユーザー');
      expect(orphanedMessage?.content).toBe('This message should persist');
    });

    it('should allow different userName from current user name', async () => {
      const user = await prisma.user.create({
        data: { name: 'Current Name' },
      });

      // Create message with different userName (valid use case for snapshots)
      const message = await prisma.message.create({
        data: {
          userId: user.id,
          userName: 'Old Name',
          content: 'Message from the past',
          type: MessageType.USER,
        },
      });

      expect(message.userId).toBe(user.id);
      expect(message.userName).toBe('Old Name');
      expect(message.userName).not.toBe(user.name);
    });
  });

  describe('T022: createdAt timestamp', () => {
    it('should auto-generate createdAt', async () => {
      const user = await prisma.user.create({
        data: { name: 'Test User' },
      });

      const beforeCreate = new Date();

      const message = await prisma.message.create({
        data: {
          userId: user.id,
          userName: user.name,
          content: 'Test message',
          type: MessageType.USER,
        },
      });

      const afterCreate = new Date();

      expect(message.createdAt).toBeInstanceOf(Date);
      expect(message.createdAt.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
      expect(message.createdAt.getTime()).toBeLessThanOrEqual(afterCreate.getTime());
    });

    it('should order messages by createdAt DESC', async () => {
      const user = await prisma.user.create({
        data: { name: 'Test User' },
      });

      const message1 = await prisma.message.create({
        data: {
          userId: user.id,
          userName: user.name,
          content: 'First message',
          type: MessageType.USER,
        },
      });

      // Wait to ensure different timestamps
      await new Promise((resolve) => setTimeout(resolve, 10));

      const message2 = await prisma.message.create({
        data: {
          userId: user.id,
          userName: user.name,
          content: 'Second message',
          type: MessageType.USER,
        },
      });

      await new Promise((resolve) => setTimeout(resolve, 10));

      const message3 = await prisma.message.create({
        data: {
          userId: user.id,
          userName: user.name,
          content: 'Third message',
          type: MessageType.USER,
        },
      });

      const messages = await prisma.message.findMany({
        orderBy: { createdAt: 'desc' },
      });

      expect(messages).toHaveLength(3);
      expect(messages[0].id).toBe(message3.id); // Most recent first
      expect(messages[1].id).toBe(message2.id);
      expect(messages[2].id).toBe(message1.id); // Oldest last
    });

    it('should retrieve latest N messages', async () => {
      const user = await prisma.user.create({
        data: { name: 'Test User' },
      });

      // Create 10 messages
      for (let i = 1; i <= 10; i++) {
        await prisma.message.create({
          data: {
            userId: user.id,
            userName: user.name,
            content: `Message ${i}`,
            type: MessageType.USER,
          },
        });
        await new Promise((resolve) => setTimeout(resolve, 5));
      }

      // Get latest 5 messages
      const latestMessages = await prisma.message.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
      });

      expect(latestMessages).toHaveLength(5);
      expect(latestMessages[0].content).toBe('Message 10');
      expect(latestMessages[4].content).toBe('Message 6');
    });
  });
});
