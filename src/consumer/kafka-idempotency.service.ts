// src/kafka/consumer/kafka-idempotency.service.ts

import { Injectable, Logger } from "@nestjs/common";
import { ValkeyService } from "@omnixys/cache";

/**
 * KafkaIdempotencyService
 *
 * Ensures that each Kafka event is processed exactly once from the application perspective.
 *
 * Kafka itself guarantees "at-least-once delivery", which means duplicates can occur.
 * This service prevents duplicate side effects (e.g. duplicate ticket creation).
 *
 * Strategy:
 * - Each event must contain a unique eventId
 * - Before processing → check if eventId already exists
 * - After successful processing → store eventId with TTL
 *
 * Storage:
 * - Valkey (Redis-compatible) is used for fast lookup
 *
 * TTL:
 * - Events are kept for 24 hours (configurable if needed)
 */
@Injectable()
export class KafkaIdempotencyService {
  private readonly logger = new Logger(KafkaIdempotencyService.name);

  /**
   * Default TTL for processed events in seconds.
   * Prevents unbounded memory growth.
   */
  private readonly TTL_SECONDS = 60 * 60 * 24; // 24h

  constructor(private readonly valkey: ValkeyService) {}

  /**
   * Checks whether an event has already been processed.
   *
   * @param eventId Unique event identifier from Kafka envelope
   */
  async isProcessed(eventId: string): Promise<boolean> {
    if (!eventId) {
      this.logger.warn("Missing eventId in idempotency check");
      return false;
    }

    const key = this.buildKey(eventId);

    const result = await this.valkey.rawGet(key);

    return result !== null;
  }

  /**
   * Marks an event as processed.
   *
   * Must only be called AFTER successful processing.
   *
   * @param eventId Unique event identifier
   */
  async markProcessed(eventId: string): Promise<void> {
    if (!eventId) {
      this.logger.warn("Missing eventId in markProcessed");
      return;
    }

    const key = this.buildKey(eventId);

    await this.valkey.rawSet(key, "1", this.TTL_SECONDS);
  }

  /**
   * Builds a namespaced key for Valkey.
   *
   * Ensures:
   * - No collisions
   * - Easy debugging
   */
  private buildKey(eventId: string): string {
    return `kafka:idempotency:${eventId}`;
  }
}
