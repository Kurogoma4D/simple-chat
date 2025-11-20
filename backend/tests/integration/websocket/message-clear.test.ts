/**
 * Message clear integration tests
 * Tests for automatic message clearing when all users disconnect
 */

import { PrismaClient } from '@prisma/client';
import WebSocket from 'ws';
import { UserService } from '../../../src/services/UserService';
import { MessageService } from '../../../src/services/MessageService';
import { handleDisconnect } from '../../../src/websocket/handlers/disconnectHandler';
import { connectionManager } from '../../../src/websocket/connectionManager';
import { setupTestDatabase, teardownTestDatabase, clearTestData } from '../setup/db-setup';

// Mock WebSocket
const createMockWebSocket = (): WebSocket => {
  return {
    send: jest.fn(),
    close: jest.fn(),
  } as unknown as WebSocket;
};

describe('Message clear on empty room', () => {
  let prisma: PrismaClient;
  let userService: UserService;
  let messageService: MessageService;

  beforeAll(async () => {
    prisma = await setupTestDatabase();
    userService = new UserService();
    messageService = new MessageService();
  });

  afterAll(async () => {
    await teardownTestDatabase(prisma);
  });

  beforeEach(async () => {
    // Tests use unique user names and socket IDs to avoid conflicts
  });

  afterEach(async () => {
    // Clean up after each test
    await clearTestData(prisma);
  });

  /**
   * T010: should clear messages when all users disconnect
   */
  it('should clear messages when all users disconnect', async () => {
    // Setup: Create users and messages
    const user1 = await userService.join('User1-all', 'socket-all-1');
    const user2 = await userService.join('User2-all', 'socket-all-2');

    // Add connections to connection manager
    connectionManager.add('socket-all-1', { ws: createMockWebSocket(), userId: user1.id, userName: user1.name });
    connectionManager.add('socket-all-2', { ws: createMockWebSocket(), userId: user2.id, userName: user2.name });

    // Create messages
    await messageService.create(user1.id, user1.name, 'Hello from user1');
    await messageService.create(user2.id, user2.name, 'Hello from user2');

    const messageCountBefore = await prisma.message.count();
    expect(messageCountBefore).toBeGreaterThan(0);

    // Execute: Disconnect all users
    await handleDisconnect('socket-all-1');
    await handleDisconnect('socket-all-2');

    // Wait for async message clear to complete
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Verify: Messages should be cleared
    const messageCountAfter = await prisma.message.count();
    expect(messageCountAfter).toBe(0);
  });

  /**
   * T011: should NOT clear messages when some users remain online
   */
  it('should NOT clear messages when some users remain online', async () => {
    // Setup: Create users and messages
    const user1 = await userService.join('User1-partial', 'socket-partial-1');
    const user2 = await userService.join('User2-partial', 'socket-partial-2');
    const user3 = await userService.join('User3-partial', 'socket-partial-3');

    connectionManager.add('socket-partial-1', { ws: createMockWebSocket(), userId: user1.id, userName: user1.name });
    connectionManager.add('socket-partial-2', { ws: createMockWebSocket(), userId: user2.id, userName: user2.name });
    connectionManager.add('socket-partial-3', { ws: createMockWebSocket(), userId: user3.id, userName: user3.name });

    await messageService.create(user1.id, user1.name, 'Message 1');
    await messageService.create(user2.id, user2.name, 'Message 2');

    const messageCountBefore = await prisma.message.count();
    expect(messageCountBefore).toBeGreaterThan(0);

    // Execute: Disconnect only user1 and user2 (user3 remains)
    await handleDisconnect('socket-partial-1');
    await handleDisconnect('socket-partial-2');

    // Wait for potential async message clear
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Verify: user3 should still be online
    const user3After = await prisma.user.findUnique({ where: { id: user3.id } });
    expect(user3After).toBeDefined(); // user3 should still exist
    expect(user3After?.isOnline).toBe(true); // user3 should still be online

    const activeUsers = await userService.getActiveUsers();
    expect(activeUsers.length).toBe(1); // Only user3 should be online

    // Verify: Messages should NOT be cleared (but system messages were added during disconnect)
    const messageCountAfter = await prisma.message.count();
    expect(messageCountAfter).toBeGreaterThanOrEqual(messageCountBefore); // Messages remain + system messages added
  });

  /**
   * T012: should handle concurrent disconnects correctly
   */
  it('should handle concurrent disconnects correctly', async () => {
    // Setup: Create users and messages
    const user1 = await userService.join('User1-concurrent', 'socket-concurrent-1');
    const user2 = await userService.join('User2-concurrent', 'socket-concurrent-2');
    const user3 = await userService.join('User3-concurrent', 'socket-concurrent-3');

    connectionManager.add('socket-concurrent-1', { ws: createMockWebSocket(), userId: user1.id, userName: user1.name });
    connectionManager.add('socket-concurrent-2', { ws: createMockWebSocket(), userId: user2.id, userName: user2.name });
    connectionManager.add('socket-concurrent-3', { ws: createMockWebSocket(), userId: user3.id, userName: user3.name });

    await messageService.create(user1.id, user1.name, 'Message 1');
    await messageService.create(user2.id, user2.name, 'Message 2');
    await messageService.create(user3.id, user3.name, 'Message 3');

    const messageCountBefore = await prisma.message.count();
    expect(messageCountBefore).toBeGreaterThan(0);

    // Execute: Disconnect all users concurrently
    await Promise.all([
      handleDisconnect('socket-concurrent-1'),
      handleDisconnect('socket-concurrent-2'),
      handleDisconnect('socket-concurrent-3'),
    ]);

    // Wait for async message clear to complete
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Verify: Messages should be cleared (even with concurrent disconnects)
    const messageCountAfter = await prisma.message.count();
    expect(messageCountAfter).toBe(0);
  });

  /**
   * T013: should complete user disconnect even if message clear fails
   */
  it('should complete user disconnect even if message clear fails', async () => {
    // Setup: Create user
    const user = await userService.join('User1-error', 'socket-error-1');
    connectionManager.add('socket-error-1', { ws: createMockWebSocket(), userId: user.id, userName: user.name });

    // Mock MessageService to throw error
    const originalClearAllMessages = MessageService.prototype.clearAllMessages;
    MessageService.prototype.clearAllMessages = jest.fn().mockRejectedValue(new Error('Database error'));

    // Execute: Disconnect user
    // Should not throw error even if message clear fails
    await expect(handleDisconnect('socket-error-1')).resolves.not.toThrow();

    // Verify: User should be offline
    const userAfter = await prisma.user.findUnique({ where: { id: user.id } });
    expect(userAfter?.isOnline).toBe(false);

    // Restore original method
    MessageService.prototype.clearAllMessages = originalClearAllMessages;
  });
});
