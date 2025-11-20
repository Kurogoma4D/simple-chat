/**
 * Message CRUD integration tests
 * Tests for Message database operations: Create, Read, Update, Delete
 */

import { PrismaClient, MessageType } from '@prisma/client';
import { setupTestDatabase, teardownTestDatabase, clearTestData } from '../setup/db-setup';
import { expectMessageToMatchSchema, isValidUUID } from '../../unit/helpers/validators';

describe('Message CRUD Operations', () => {
  let prisma: PrismaClient;

  beforeAll(async () => {
    prisma = await setupTestDatabase();
  });

  afterAll(async () => {
    await teardownTestDatabase(prisma);
  });

  beforeEach(async () => {
    await clearTestData(prisma); // Clear before each test
  });

  describe('T029: Create operation with User relation', () => {
    it('should create message with valid user relation', async () => {
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
      expect(isValidUUID(message.id)).toBe(true);
    });

    it('should establish relationship via include', async () => {
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
        include: {
          user: true,
        },
      });

      expect(message.user).toBeDefined();
      expect(message.user?.id).toBe(user.id);
      expect(message.user?.name).toBe(user.name);
    });

    it('should create multiple messages for one user', async () => {
      const user = await prisma.user.create({
        data: { name: 'Chatty User' },
      });

      const message1 = await prisma.message.create({
        data: {
          userId: user.id,
          userName: user.name,
          content: 'First message',
          type: MessageType.USER,
        },
      });

      const message2 = await prisma.message.create({
        data: {
          userId: user.id,
          userName: user.name,
          content: 'Second message',
          type: MessageType.USER,
        },
      });

      expect(message1.userId).toBe(user.id);
      expect(message2.userId).toBe(user.id);
      expect(message1.id).not.toBe(message2.id);
    });
  });

  describe('T030: Create system message (userId=null)', () => {
    it('should create system message without user', async () => {
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
      expect(message.content).toContain(user.name);
    });

    it('should create system message for user leave event', async () => {
      const message = await prisma.message.create({
        data: {
          userId: null,
          userName: 'システム',
          content: '山田太郎さんが退出しました',
          type: MessageType.SYSTEM,
        },
      });

      expect(message.userId).toBeNull();
      expect(message.type).toBe(MessageType.SYSTEM);
    });
  });

  describe('T031: findMany ordered by createdAt DESC', () => {
    it('should retrieve messages in descending order', async () => {
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
      expect(messages[0].id).toBe(message3.id);
      expect(messages[1].id).toBe(message2.id);
      expect(messages[2].id).toBe(message1.id);
    });

    it('should retrieve latest N messages', async () => {
      const user = await prisma.user.create({
        data: { name: 'Test User' },
      });

      // Create 20 messages
      for (let i = 1; i <= 20; i++) {
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

      const latestMessages = await prisma.message.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
      });

      expect(latestMessages).toHaveLength(10);
      expect(latestMessages[0].content).toBe('Message 20');
      expect(latestMessages[9].content).toBe('Message 11');
    });

    it('should handle empty result set', async () => {
      const messages = await prisma.message.findMany({
        orderBy: { createdAt: 'desc' },
      });

      expect(messages).toHaveLength(0);
    });
  });

  describe('T032: User-Message relationship (foreign key)', () => {
    it('should maintain foreign key constraint', async () => {
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

      expect(messageWithUser?.user).toBeDefined();
      expect(messageWithUser?.user?.id).toBe(user.id);
    });

    it('should query user with all messages', async () => {
      const user = await prisma.user.create({
        data: { name: 'Chatty User' },
      });

      await prisma.message.create({
        data: {
          userId: user.id,
          userName: user.name,
          content: 'Message 1',
          type: MessageType.USER,
        },
      });

      await prisma.message.create({
        data: {
          userId: user.id,
          userName: user.name,
          content: 'Message 2',
          type: MessageType.USER,
        },
      });

      await prisma.message.create({
        data: {
          userId: user.id,
          userName: user.name,
          content: 'Message 3',
          type: MessageType.USER,
        },
      });

      const userWithMessages = await prisma.user.findUnique({
        where: { id: user.id },
        include: { messages: true },
      });

      expect(userWithMessages?.messages).toHaveLength(3);
    });

    it('should filter messages by userId', async () => {
      const user1 = await prisma.user.create({
        data: { name: 'User 1' },
      });

      const user2 = await prisma.user.create({
        data: { name: 'User 2' },
      });

      await prisma.message.create({
        data: {
          userId: user1.id,
          userName: user1.name,
          content: 'User 1 message',
          type: MessageType.USER,
        },
      });

      await prisma.message.create({
        data: {
          userId: user2.id,
          userName: user2.name,
          content: 'User 2 message',
          type: MessageType.USER,
        },
      });

      const user1Messages = await prisma.message.findMany({
        where: { userId: user1.id },
      });

      expect(user1Messages).toHaveLength(1);
      expect(user1Messages[0].content).toBe('User 1 message');
    });
  });

  describe('T033: Delete User cascade (set userId to null)', () => {
    it('should set userId to null when user is deleted', async () => {
      const user = await prisma.user.create({
        data: { name: 'User to Delete' },
      });

      const message = await prisma.message.create({
        data: {
          userId: user.id,
          userName: user.name,
          content: 'This message should persist',
          type: MessageType.USER,
        },
      });

      await prisma.user.delete({
        where: { id: user.id },
      });

      const orphanedMessage = await prisma.message.findUnique({
        where: { id: message.id },
      });

      expect(orphanedMessage).toBeDefined();
      expect(orphanedMessage?.userId).toBeNull();
      expect(orphanedMessage?.userName).toBe('User to Delete');
      expect(orphanedMessage?.content).toBe('This message should persist');
    });

    it('should preserve all messages when user is deleted', async () => {
      const user = await prisma.user.create({
        data: { name: 'Deleted User' },
      });

      await prisma.message.create({
        data: {
          userId: user.id,
          userName: user.name,
          content: 'Message 1',
          type: MessageType.USER,
        },
      });

      await prisma.message.create({
        data: {
          userId: user.id,
          userName: user.name,
          content: 'Message 2',
          type: MessageType.USER,
        },
      });

      await prisma.user.delete({
        where: { id: user.id },
      });

      const orphanedMessages = await prisma.message.findMany({
        where: { userName: user.name },
      });

      expect(orphanedMessages).toHaveLength(2);
      expect(orphanedMessages.every((m) => m.userId === null)).toBe(true);
    });

    it('should not affect system messages when user is deleted', async () => {
      const user = await prisma.user.create({
        data: { name: 'User' },
      });

      const systemMessage = await prisma.message.create({
        data: {
          userId: null,
          userName: 'システム',
          content: 'システムメッセージ',
          type: MessageType.SYSTEM,
        },
      });

      await prisma.user.delete({
        where: { id: user.id },
      });

      const message = await prisma.message.findUnique({
        where: { id: systemMessage.id },
      });

      expect(message).toBeDefined();
      expect(message?.userId).toBeNull();
      expect(message?.type).toBe(MessageType.SYSTEM);
    });
  });

  describe('T035: Concurrent test execution validation', () => {
    it('should handle concurrent message creation', async () => {
      const user = await prisma.user.create({
        data: { name: 'Concurrent User' },
      });

      const createMessage = (content: string) =>
        prisma.message.create({
          data: {
            userId: user.id,
            userName: user.name,
            content,
            type: MessageType.USER,
          },
        });

      const promises = [];
      for (let i = 1; i <= 10; i++) {
        promises.push(createMessage(`Concurrent message ${i}`));
      }

      const messages = await Promise.all(promises);

      expect(messages).toHaveLength(10);
      expect(new Set(messages.map((m) => m.id)).size).toBe(10); // All unique IDs
    });

    it('should handle concurrent read and write operations', async () => {
      const user = await prisma.user.create({
        data: { name: 'Test User' },
      });

      // Initial messages
      for (let i = 1; i <= 5; i++) {
        await prisma.message.create({
          data: {
            userId: user.id,
            userName: user.name,
            content: `Initial message ${i}`,
            type: MessageType.USER,
          },
        });
      }

      // Concurrent operations
      const writeOps = [];
      for (let i = 6; i <= 10; i++) {
        writeOps.push(
          prisma.message.create({
            data: {
              userId: user.id,
              userName: user.name,
              content: `New message ${i}`,
              type: MessageType.USER,
            },
          })
        );
      }

      const readOps = [];
      for (let i = 0; i < 5; i++) {
        readOps.push(
          prisma.message.findMany({
            orderBy: { createdAt: 'desc' },
            take: 10,
          })
        );
      }

      const [writeResults, ...readResults] = await Promise.all([
        Promise.all(writeOps),
        ...readOps,
      ]);

      expect(writeResults).toHaveLength(5);
      readResults.forEach((result) => {
        expect(result.length).toBeGreaterThanOrEqual(5);
        expect(result.length).toBeLessThanOrEqual(10);
      });
    });

    it('should maintain data consistency in concurrent transactions', async () => {
      const user = await prisma.user.create({
        data: { name: 'Transaction User' },
      });

      const tx1 = prisma.$transaction(async (tx) => {
        const msg = await tx.message.create({
          data: {
            userId: user.id,
            userName: user.name,
            content: 'TX1 Message',
            type: MessageType.USER,
          },
        });
        await new Promise((resolve) => setTimeout(resolve, 20));
        return msg;
      });

      const tx2 = prisma.$transaction(async (tx) => {
        const msg = await tx.message.create({
          data: {
            userId: user.id,
            userName: user.name,
            content: 'TX2 Message',
            type: MessageType.USER,
          },
        });
        await new Promise((resolve) => setTimeout(resolve, 20));
        return msg;
      });

      const [result1, result2] = await Promise.all([tx1, tx2]);

      expect(result1.id).not.toBe(result2.id);
      expect(result1.content).toBe('TX1 Message');
      expect(result2.content).toBe('TX2 Message');

      const allMessages = await prisma.message.findMany({
        where: { userId: user.id },
      });

      expect(allMessages).toHaveLength(2);
    });
  });
});
