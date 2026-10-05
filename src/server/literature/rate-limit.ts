/**
 * A fixed-window request limiter held in memory.
 *
 * LIMITATION (ADR-0011): memory belongs to one server instance. On serverless hosting
 * several instances run and each starts empty, so this slows down a single misbehaving
 * client and protects the provider from simple loops; it is NOT a global guarantee.
 * Treat it as a courtesy guard, and put a shared store behind it if abuse becomes real.
 */

export interface RateLimitOptions {
  windowMs: number;
  perClient: number;
  /** A ceiling on all clients together in one window, for this instance. */
  global: number;
  /** Bound on remembered clients, so the map can't grow without limit. */
  maxClients: number;
  now?: () => number;
}

export type RateDecision = { allowed: true } | { allowed: false; retryAfterSeconds: number };

export function createRateLimiter(options: RateLimitOptions) {
  const now = options.now ?? Date.now;
  const clients = new Map<string, { count: number; start: number }>();
  let global = { count: 0, start: now() };

  return {
    check(client: string): RateDecision {
      const time = now();
      if (time - global.start >= options.windowMs) global = { count: 0, start: time };
      if (global.count >= options.global) return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((global.start + options.windowMs - time) / 1000)) };

      let entry = clients.get(client);
      if (entry !== undefined && time - entry.start >= options.windowMs) {
        clients.delete(client);
        entry = undefined;
      }
      if (entry === undefined) {
        if (clients.size >= options.maxClients) {
          for (const [key, value] of clients) if (time - value.start >= options.windowMs) clients.delete(key);
          if (clients.size >= options.maxClients) return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((global.start + options.windowMs - time) / 1000)) };
        }
        entry = { count: 0, start: time };
        clients.set(client, entry);
      }
      if (entry.count >= options.perClient) return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((entry.start + options.windowMs - time) / 1000)) };
      entry.count += 1;
      global.count += 1;
      return { allowed: true };
    },
  };
}

export type RateLimiter = ReturnType<typeof createRateLimiter>;
