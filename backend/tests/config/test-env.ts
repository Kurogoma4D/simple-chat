/**
 * Test environment setup
 * This file is executed before each test suite via setupFilesAfterEnv in jest.config.js
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://testuser:testpass@localhost:5433/simple_chat_test';

// Configure test timeouts
jest.setTimeout(10000); // 10 seconds for all tests

// Suppress console.log in tests (optional, can be commented out for debugging)
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
// };

// Global test setup
beforeAll(() => {
  // Any global setup before all tests
});

// Global test cleanup
afterAll(() => {
  // Any global cleanup after all tests
});
