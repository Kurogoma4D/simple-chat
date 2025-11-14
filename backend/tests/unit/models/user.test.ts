/**
 * User model unit tests
 * Tests for User entity validation, state transitions, and field management
 */

import { PrismaClient } from '@prisma/client';
import { setupTestDatabase, teardownTestDatabase, clearTestData } from '../../integration/setup/db-setup';
import { expectUserToMatchSchema, isValidUUID } from '../helpers/validators';

describe('User Model', () => {
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

  describe('T013: Valid data creation', () => {
    it('should create a user with valid data', async () => {
      const user = await prisma.user.create({
        data: {
          name: '山田太郎',
        },
      });

      expect(user).toBeDefined();
      expectUserToMatchSchema(user);
      expect(user.name).toBe('山田太郎');
      expect(user.isOnline).toBe(false); // Default value
      expect(user.socketId).toBeNull(); // Default null
    });

    it('should generate UUID for id automatically', async () => {
      const user = await prisma.user.create({
        data: {
          name: 'Test User',
        },
      });

      expect(isValidUUID(user.id)).toBe(true);
    });

    it('should allow multiple users with same name', async () => {
      const user1 = await prisma.user.create({
        data: { name: '同じ名前' },
      });

      const user2 = await prisma.user.create({
        data: { name: '同じ名前' },
      });

      expect(user1.id).not.toBe(user2.id);
      expect(user1.name).toBe(user2.name);
    });
  });

  describe('T014: Validation', () => {
    // Note: Application-level validation should be implemented in service/controller layers
    // Prisma/Database only enforces basic constraints

    it('should accept empty name (app-level validation needed)', async () => {
      const user = await prisma.user.create({
        data: {
          name: '',
        },
      });

      expect(user.name).toBe('');
      // TODO: Add app-level validation to reject empty names
    });

    it('should accept name longer than 50 characters (app-level validation needed)', async () => {
      const longName = 'a'.repeat(51);

      const user = await prisma.user.create({
        data: {
          name: longName,
        },
      });

      expect(user.name.length).toBe(51);
      // TODO: Add app-level validation to enforce max length 50
    });

    it('should accept name with exactly 50 characters', async () => {
      const exactName = 'a'.repeat(50);

      const user = await prisma.user.create({
        data: {
          name: exactName,
        },
      });

      expect(user.name).toBe(exactName);
      expect(user.name.length).toBe(50);
    });

    it('should accept custom UUID for id', async () => {
      const customId = '550e8400-e29b-41d4-a716-446655440000';

      const user = await prisma.user.create({
        data: {
          id: customId,
          name: 'Test User',
        },
      });

      expect(user.id).toBe(customId);
      expect(isValidUUID(user.id)).toBe(true);
    });
  });

  describe('T015: Online/Offline state transitions', () => {
    it('should default to offline state', async () => {
      const user = await prisma.user.create({
        data: {
          name: 'Test User',
        },
      });

      expect(user.isOnline).toBe(false);
    });

    it('should transition to online state', async () => {
      const user = await prisma.user.create({
        data: {
          name: 'Test User',
        },
      });

      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { isOnline: true },
      });

      expect(updatedUser.isOnline).toBe(true);
    });

    it('should transition from online to offline', async () => {
      const user = await prisma.user.create({
        data: {
          name: 'Test User',
          isOnline: true,
        },
      });

      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { isOnline: false },
      });

      expect(updatedUser.isOnline).toBe(false);
    });

    it('should find only online users', async () => {
      await prisma.user.create({
        data: { name: 'User 1', isOnline: true },
      });

      await prisma.user.create({
        data: { name: 'User 2', isOnline: false },
      });

      await prisma.user.create({
        data: { name: 'User 3', isOnline: true },
      });

      const onlineUsers = await prisma.user.findMany({
        where: { isOnline: true },
      });

      expect(onlineUsers).toHaveLength(2);
      expect(onlineUsers.every((u) => u.isOnline)).toBe(true);
    });
  });

  describe('T016: socketId lifecycle', () => {
    it('should default socketId to null', async () => {
      const user = await prisma.user.create({
        data: {
          name: 'Test User',
        },
      });

      expect(user.socketId).toBeNull();
    });

    it('should set socketId on connection', async () => {
      const user = await prisma.user.create({
        data: {
          name: 'Test User',
        },
      });

      const connectedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          socketId: 'socket-abc123',
          isOnline: true,
        },
      });

      expect(connectedUser.socketId).toBe('socket-abc123');
      expect(connectedUser.isOnline).toBe(true);
    });

    it('should clear socketId on disconnection', async () => {
      const user = await prisma.user.create({
        data: {
          name: 'Test User',
          socketId: 'socket-abc123',
          isOnline: true,
        },
      });

      const disconnectedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          socketId: null,
          isOnline: false,
        },
      });

      expect(disconnectedUser.socketId).toBeNull();
      expect(disconnectedUser.isOnline).toBe(false);
    });

    it('should update socketId on reconnection', async () => {
      const user = await prisma.user.create({
        data: {
          name: 'Test User',
          socketId: 'old-socket-123',
        },
      });

      const reconnectedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          socketId: 'new-socket-456',
          isOnline: true,
        },
      });

      expect(reconnectedUser.socketId).toBe('new-socket-456');
      expect(reconnectedUser.isOnline).toBe(true);
    });
  });

  describe('T017: Timestamp fields', () => {
    it('should auto-generate createdAt', async () => {
      const beforeCreate = new Date();

      const user = await prisma.user.create({
        data: {
          name: 'Test User',
        },
      });

      const afterCreate = new Date();

      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.createdAt.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
      expect(user.createdAt.getTime()).toBeLessThanOrEqual(afterCreate.getTime());
    });

    it('should auto-generate updatedAt', async () => {
      const user = await prisma.user.create({
        data: {
          name: 'Test User',
        },
      });

      expect(user.updatedAt).toBeInstanceOf(Date);
      expect(user.updatedAt.getTime()).toBeGreaterThanOrEqual(user.createdAt.getTime());
    });

    it('should auto-update updatedAt on change', async () => {
      const user = await prisma.user.create({
        data: {
          name: 'Test User',
        },
      });

      const originalUpdatedAt = user.updatedAt;

      // Wait a bit to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 10));

      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { name: 'Updated User' },
      });

      expect(updatedUser.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });

    it('should auto-generate lastActiveAt', async () => {
      const beforeCreate = new Date();

      const user = await prisma.user.create({
        data: {
          name: 'Test User',
        },
      });

      const afterCreate = new Date();

      expect(user.lastActiveAt).toBeInstanceOf(Date);
      expect(user.lastActiveAt.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
      expect(user.lastActiveAt.getTime()).toBeLessThanOrEqual(afterCreate.getTime());
    });

    it('should update lastActiveAt manually', async () => {
      const user = await prisma.user.create({
        data: {
          name: 'Test User',
        },
      });

      const newActiveTime = new Date(Date.now() + 10000); // 10 seconds later

      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { lastActiveAt: newActiveTime },
      });

      expect(updatedUser.lastActiveAt.getTime()).toBeGreaterThan(user.lastActiveAt.getTime());
    });

    it('should maintain timestamp order: createdAt <= lastActiveAt <= updatedAt', async () => {
      const user = await prisma.user.create({
        data: {
          name: 'Test User',
        },
      });

      expect(user.createdAt.getTime()).toBeLessThanOrEqual(user.lastActiveAt.getTime());
      expect(user.lastActiveAt.getTime()).toBeLessThanOrEqual(user.updatedAt.getTime());
    });
  });
});
