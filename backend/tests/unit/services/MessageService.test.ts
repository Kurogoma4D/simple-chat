/**
 * MessageService unit tests
 * Tests for message CRUD operations and clearAllMessages functionality
 */

import { PrismaClient } from '@prisma/client';
import { MessageService } from '../../../src/services/MessageService';
import { setupTestDatabase, teardownTestDatabase, clearTestData } from '../../integration/setup/db-setup';
import dbPrisma from '../../../src/db';

describe('MessageService', () => {
  let prisma: PrismaClient;
  let messageService: MessageService;

  beforeAll(async () => {
    prisma = await setupTestDatabase();
    messageService = new MessageService();
  });

  afterAll(async () => {
    await teardownTestDatabase(prisma);
  });

  beforeEach(async () => {
    await clearTestData(prisma);
  });

  describe('clearAllMessages', () => {
    /**
     * T006: should delete all messages and return count
     */
    it('should delete all messages and return count', async () => {
      // Setup: Create test messages
      const user = await prisma.user.create({
        data: { name: 'Test User' },
      });

      await prisma.message.createMany({
        data: [
          { userId: user.id, userName: user.name, content: 'Message 1', type: 'USER' },
          { userId: user.id, userName: user.name, content: 'Message 2', type: 'USER' },
          { userId: null, userName: 'System', content: 'System message', type: 'SYSTEM' },
        ],
      });

      // Verify setup
      const countBefore = await prisma.message.count();
      expect(countBefore).toBe(3);

      // Execute
      const deletedCount = await messageService.clearAllMessages();

      // Verify
      expect(deletedCount).toBe(3);
      const countAfter = await prisma.message.count();
      expect(countAfter).toBe(0);
    });

    /**
     * T007: should return 0 when no messages exist
     */
    it('should return 0 when no messages exist', async () => {
      // Verify no messages exist
      const countBefore = await prisma.message.count();
      expect(countBefore).toBe(0);

      // Execute
      const deletedCount = await messageService.clearAllMessages();

      // Verify
      expect(deletedCount).toBe(0);
      const countAfter = await prisma.message.count();
      expect(countAfter).toBe(0);
    });

    /**
     * T008: should handle database errors gracefully
     */
    it('should handle database errors gracefully', async () => {
      // Create a test message first
      const user = await prisma.user.create({
        data: { name: 'Test User' },
      });

      await prisma.message.create({
        data: { userId: user.id, userName: user.name, content: 'Test', type: 'USER' },
      });

      // Mock prisma to throw error (using the actual db module instance)
      const deleteManyMock = jest.spyOn(dbPrisma.message, 'deleteMany');
      deleteManyMock.mockRejectedValue(new Error('Database connection failed'));

      // Execute and expect error
      await expect(messageService.clearAllMessages()).rejects.toThrow('Database connection failed');

      // Restore original method
      deleteManyMock.mockRestore();
    });
  });
});
