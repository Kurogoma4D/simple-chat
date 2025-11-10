interface RateLimitRecord {
  count: number;
  resetAt: number;
}

export class RateLimiter {
  private records: Map<string, RateLimitRecord> = new Map();
  private limit: number;
  private windowMs: number;

  constructor(limit: number = 10, windowMs: number = 60000) {
    this.limit = limit;
    this.windowMs = windowMs;

    // Clean up expired records every minute
    setInterval(() => this.cleanup(), 60000);
  }

  check(userId: string): boolean {
    const now = Date.now();
    const record = this.records.get(userId);

    if (!record || now > record.resetAt) {
      // Reset window
      this.records.set(userId, {
        count: 1,
        resetAt: now + this.windowMs,
      });
      return true;
    }

    if (record.count >= this.limit) {
      console.warn(`[RateLimiter] Rate limit exceeded for user: ${userId}`);
      return false; // Rate limit exceeded
    }

    record.count++;
    return true;
  }

  getRemainingTime(userId: string): number {
    const record = this.records.get(userId);
    if (!record) return 0;

    const now = Date.now();
    return Math.max(0, record.resetAt - now);
  }

  private cleanup(): void {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [userId, record] of this.records.entries()) {
      if (now > record.resetAt) {
        this.records.delete(userId);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`[RateLimiter] Cleaned up ${cleanedCount} expired records`);
    }
  }
}

export const messageRateLimiter = new RateLimiter(10, 60000); // 10 messages per minute
