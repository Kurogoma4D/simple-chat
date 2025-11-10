import prisma from '../db';
import { User } from '@prisma/client';

export class UserService {
  async join(name: string, socketId: string): Promise<User> {
    // Find existing user by name or create new one
    const existingUser = await prisma.user.findFirst({
      where: { name },
      orderBy: { lastActiveAt: 'desc' },
    });

    if (existingUser) {
      // Update existing user to online
      return await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          isOnline: true,
          socketId,
          lastActiveAt: new Date(),
        },
      });
    }

    // Create new user
    return await prisma.user.create({
      data: {
        name,
        socketId,
        isOnline: true,
      },
    });
  }

  async leave(userId: string): Promise<User> {
    return await prisma.user.update({
      where: { id: userId },
      data: {
        isOnline: false,
        socketId: null,
        lastActiveAt: new Date(),
      },
    });
  }

  async findById(userId: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { id: userId },
    });
  }

  async getActiveUsers(): Promise<User[]> {
    return await prisma.user.findMany({
      where: { isOnline: true },
      orderBy: { name: 'asc' },
    });
  }

  async updateLastActive(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { lastActiveAt: new Date() },
    });
  }
}
