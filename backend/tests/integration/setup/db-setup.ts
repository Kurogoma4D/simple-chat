/**
 * Database setup functions for integration tests
 */

import { PrismaClient } from '@prisma/client';

let prismaInstance: PrismaClient | null = null;

/**
 * Setup test database
 * - Initialize Prisma client
 * - Run migrations
 * @returns Initialized Prisma client
 */
export async function setupTestDatabase(): Promise<PrismaClient> {
  if (prismaInstance) {
    return prismaInstance;
  }

  prismaInstance = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL || 'postgresql://testuser:testpass@localhost:5433/simple_chat_test',
      },
    },
  });

  // Connect to database
  await prismaInstance.$connect();

  return prismaInstance;
}

/**
 * Teardown test database
 * - Disconnect from database
 * @param prisma - Prisma client instance
 */
export async function teardownTestDatabase(prisma: PrismaClient): Promise<void> {
  await prisma.$disconnect();

  if (prismaInstance === prisma) {
    prismaInstance = null;
  }
}

/**
 * Clear all test data from database
 * This is an alternative to transaction rollback when it can't be used
 * @param prisma - Prisma client instance
 */
export async function clearTestData(prisma: PrismaClient): Promise<void> {
  // Delete in correct order due to foreign key constraints
  await prisma.message.deleteMany();
  await prisma.user.deleteMany();
}
