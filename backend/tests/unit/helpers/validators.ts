/**
 * Validation helper functions for testing
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { MessageType } from './types';

/**
 * UUID v4 regex pattern
 */
const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Check if a string is a valid UUID v4
 * @param value - String to validate
 * @returns True if valid UUID v4
 */
export function isValidUUID(value: string): boolean {
  return UUID_V4_REGEX.test(value);
}

/**
 * Check if a username is valid
 * Rules: non-empty, max 50 characters
 * @param name - Username to validate
 * @returns True if valid
 */
export function isValidUserName(name: string): boolean {
  return name.length > 0 && name.length <= 50;
}

/**
 * Check if message content is valid
 * Rules: non-empty, max 1000 characters
 * @param content - Message content to validate
 * @returns True if valid
 */
export function isValidMessageContent(content: string): boolean {
  return content.length > 0 && content.length <= 1000;
}

/**
 * Assert that a User object matches the expected schema
 * @param user - User object to validate
 */
export function expectUserToMatchSchema(user: any): void {
  expect(user).toHaveProperty('id');
  expect(user).toHaveProperty('name');
  expect(user).toHaveProperty('socketId');
  expect(user).toHaveProperty('isOnline');
  expect(user).toHaveProperty('lastActiveAt');
  expect(user).toHaveProperty('createdAt');
  expect(user).toHaveProperty('updatedAt');

  expect(typeof user.id).toBe('string');
  expect(typeof user.name).toBe('string');
  expect(user.socketId === null || typeof user.socketId === 'string').toBe(true);
  expect(typeof user.isOnline).toBe('boolean');
  expect(user.lastActiveAt).toBeInstanceOf(Date);
  expect(user.createdAt).toBeInstanceOf(Date);
  expect(user.updatedAt).toBeInstanceOf(Date);

  expect(isValidUUID(user.id)).toBe(true);
  expect(isValidUserName(user.name)).toBe(true);
}

/**
 * Assert that a Message object matches the expected schema
 * @param message - Message object to validate
 */
export function expectMessageToMatchSchema(message: any): void {
  expect(message).toHaveProperty('id');
  expect(message).toHaveProperty('userId');
  expect(message).toHaveProperty('userName');
  expect(message).toHaveProperty('content');
  expect(message).toHaveProperty('type');
  expect(message).toHaveProperty('createdAt');

  expect(typeof message.id).toBe('string');
  expect(message.userId === null || typeof message.userId === 'string').toBe(true);
  expect(typeof message.userName).toBe('string');
  expect(typeof message.content).toBe('string');
  expect(typeof message.type).toBe('string');
  expect(message.createdAt).toBeInstanceOf(Date);

  expect(isValidUUID(message.id)).toBe(true);
  if (message.userId !== null) {
    expect(isValidUUID(message.userId)).toBe(true);
  }
  expect(isValidUserName(message.userName)).toBe(true);
  expect(isValidMessageContent(message.content)).toBe(true);
  expect([MessageType.USER, MessageType.SYSTEM]).toContain(message.type);
}
