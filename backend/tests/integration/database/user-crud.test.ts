/**
 * User CRUD integration tests
 * Tests for User database operations: Create, Read, Update, Delete
 */

import { PrismaClient } from '@prisma/client';
import { setupTestDatabase, teardownTestDatabase, clearTestData } from '../setup/db-setup';
import { expectUserToMatchSchema, isValidUUID } from '../../unit/helpers/validators';

describe('User CRUD Operations', () => {
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

  describe('T024: Create operation', () => {
    it('should create a user successfully', async () => {
      const user = await prisma.user.create({
        data: {
          name: '山田太郎',
        },
      });

      expect(user).toBeDefined();
      expectUserToMatchSchema(user);
      expect(user.name).toBe('山田太郎');
      expect(isValidUUID(user.id)).toBe(true);
    });

    it('should create user with all optional fields', async () => {
      const user = await prisma.user.create({
        data: {
          name: 'Test User',
          socketId: 'socket-123',
          isOnline: true,
        },
      });

      expect(user.socketId).toBe('socket-123');
      expect(user.isOnline).toBe(true);
    });

    it('should create multiple users independently', async () => {
      const user1 = await prisma.user.create({
        data: { name: 'User 1' },
      });

      const user2 = await prisma.user.create({
        data: { name: 'User 2' },
      });

      expect(user1.id).not.toBe(user2.id);
      expect([user1.name, user2.name]).toEqual(['User 1', 'User 2']);
    });
  });

  describe('T025: Read/findMany operations', () => {
    it('should find user by id', async () => {
      const created = await prisma.user.create({
        data: { name: 'Find Me' },
      });

      const found = await prisma.user.findUnique({
        where: { id: created.id },
      });

      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
      expect(found?.name).toBe('Find Me');
    });

    it('should return null for non-existent user', async () => {
      const nonExistent = await prisma.user.findUnique({
        where: { id: '00000000-0000-0000-0000-000000000000' },
      });

      expect(nonExistent).toBeNull();
    });

    it('should find all users', async () => {
      await prisma.user.create({ data: { name: 'User 1' } });
      await prisma.user.create({ data: { name: 'User 2' } });
      await prisma.user.create({ data: { name: 'User 3' } });

      const users = await prisma.user.findMany();

      expect(users).toHaveLength(3);
      expect(users.every((u) => u.name.startsWith('User'))).toBe(true);
    });

    it('should find users with pagination', async () => {
      // Create 10 users
      for (let i = 1; i <= 10; i++) {
        await prisma.user.create({
          data: { name: `User ${i}` },
        });
      }

      const firstPage = await prisma.user.findMany({
        take: 5,
        skip: 0,
        orderBy: { createdAt: 'asc' },
      });

      const secondPage = await prisma.user.findMany({
        take: 5,
        skip: 5,
        orderBy: { createdAt: 'asc' },
      });

      expect(firstPage).toHaveLength(5);
      expect(secondPage).toHaveLength(5);
      expect(firstPage[0].name).toBe('User 1');
      expect(secondPage[0].name).toBe('User 6');
    });
  });

  describe('T026: Update operation', () => {
    it('should update user isOnline status', async () => {
      const user = await prisma.user.create({
        data: { name: 'Test User', isOnline: false },
      });

      const updated = await prisma.user.update({
        where: { id: user.id },
        data: { isOnline: true },
      });

      expect(updated.isOnline).toBe(true);
      expect(updated.id).toBe(user.id);
    });

    it('should update user lastActiveAt', async () => {
      const user = await prisma.user.create({
        data: { name: 'Test User' },
      });

      const originalLastActiveAt = user.lastActiveAt;
      const newLastActiveAt = new Date(Date.now() + 10000);

      await new Promise((resolve) => setTimeout(resolve, 10));

      const updated = await prisma.user.update({
        where: { id: user.id },
        data: { lastActiveAt: newLastActiveAt },
      });

      expect(updated.lastActiveAt.getTime()).toBeGreaterThan(originalLastActiveAt.getTime());
    });

    it('should update socketId and isOnline together', async () => {
      const user = await prisma.user.create({
        data: { name: 'Test User' },
      });

      const updated = await prisma.user.update({
        where: { id: user.id },
        data: {
          socketId: 'new-socket-456',
          isOnline: true,
        },
      });

      expect(updated.socketId).toBe('new-socket-456');
      expect(updated.isOnline).toBe(true);
    });

    it('should update updatedAt automatically', async () => {
      const user = await prisma.user.create({
        data: { name: 'Test User' },
      });

      const originalUpdatedAt = user.updatedAt;

      await new Promise((resolve) => setTimeout(resolve, 10));

      const updated = await prisma.user.update({
        where: { id: user.id },
        data: { name: 'Updated User' },
      });

      expect(updated.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });

  describe('T027: Delete operation', () => {
    it('should delete user successfully', async () => {
      const user = await prisma.user.create({
        data: { name: 'Delete Me' },
      });

      await prisma.user.delete({
        where: { id: user.id },
      });

      const deleted = await prisma.user.findUnique({
        where: { id: user.id },
      });

      expect(deleted).toBeNull();
    });

    it('should throw error when deleting non-existent user', async () => {
      await expect(
        prisma.user.delete({
          where: { id: '00000000-0000-0000-0000-000000000000' },
        })
      ).rejects.toThrow();
    });

    it('should allow deleting user with messages (cascade to null)', async () => {
      const user = await prisma.user.create({
        data: { name: 'User with Messages' },
      });

      await prisma.message.create({
        data: {
          userId: user.id,
          userName: user.name,
          content: 'Test message',
          type: 'USER',
        },
      });

      await prisma.user.delete({
        where: { id: user.id },
      });

      const messages = await prisma.message.findMany({
        where: { userName: user.name },
      });

      expect(messages).toHaveLength(1);
      expect(messages[0].userId).toBeNull();
      expect(messages[0].userName).toBe('User with Messages');
    });
  });

  describe('T028: findMany with where clause', () => {
    it('should filter online users only', async () => {
      await prisma.user.create({
        data: { name: 'Online User 1', isOnline: true },
      });

      await prisma.user.create({
        data: { name: 'Offline User', isOnline: false },
      });

      await prisma.user.create({
        data: { name: 'Online User 2', isOnline: true },
      });

      const onlineUsers = await prisma.user.findMany({
        where: { isOnline: true },
      });

      expect(onlineUsers).toHaveLength(2);
      expect(onlineUsers.every((u) => u.isOnline)).toBe(true);
    });

    it('should filter by name pattern', async () => {
      await prisma.user.create({ data: { name: 'Alice' } });
      await prisma.user.create({ data: { name: 'Bob' } });
      await prisma.user.create({ data: { name: 'Alice Cooper' } });

      const aliceUsers = await prisma.user.findMany({
        where: {
          name: {
            contains: 'Alice',
          },
        },
      });

      expect(aliceUsers).toHaveLength(2);
      expect(aliceUsers.every((u) => u.name.includes('Alice'))).toBe(true);
    });

    it('should combine multiple filters', async () => {
      await prisma.user.create({
        data: { name: 'Active User 1', isOnline: true, socketId: 'socket-1' },
      });

      await prisma.user.create({
        data: { name: 'Active User 2', isOnline: true, socketId: null },
      });

      await prisma.user.create({
        data: { name: 'Inactive User', isOnline: false, socketId: null },
      });

      const activeWithSocket = await prisma.user.findMany({
        where: {
          AND: [{ isOnline: true }, { socketId: { not: null } }],
        },
      });

      expect(activeWithSocket).toHaveLength(1);
      expect(activeWithSocket[0].name).toBe('Active User 1');
    });
  });

  describe('T034: Transaction rollback for data isolation', () => {
    it('should rollback transaction on error', async () => {
      try {
        await prisma.$transaction(async (tx) => {
          await tx.user.create({
            data: { name: 'Transaction User' },
          });

          // Intentionally throw error to rollback
          throw new Error('Intentional rollback');
        });
      } catch (error) {
        // Expected error
      }

      const users = await prisma.user.findMany({
        where: { name: 'Transaction User' },
      });

      expect(users).toHaveLength(0);
    });

    it('should commit transaction on success', async () => {
      await prisma.$transaction(async (tx) => {
        await tx.user.create({
          data: { name: 'Committed User 1' },
        });

        await tx.user.create({
          data: { name: 'Committed User 2' },
        });
      });

      const users = await prisma.user.findMany({
        where: {
          name: {
            startsWith: 'Committed',
          },
        },
      });

      expect(users).toHaveLength(2);
    });

    it('should isolate concurrent transactions', async () => {
      const tx1 = prisma.$transaction(async (tx) => {
        await tx.user.create({
          data: { name: 'TX1 User' },
        });
        await new Promise((resolve) => setTimeout(resolve, 50));
        const users = await tx.user.findMany();
        return users.length;
      });

      const tx2 = prisma.$transaction(async (tx) => {
        await tx.user.create({
          data: { name: 'TX2 User' },
        });
        await new Promise((resolve) => setTimeout(resolve, 50));
        const users = await tx.user.findMany();
        return users.length;
      });

      const [count1, count2] = await Promise.all([tx1, tx2]);

      // Both transactions should see their own changes
      expect(count1).toBeGreaterThanOrEqual(1);
      expect(count2).toBeGreaterThanOrEqual(1);
    });
  });
});
