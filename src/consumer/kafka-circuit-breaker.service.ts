// src/kafka/consumer/kafka-circuit-breaker.service.ts

import { Injectable, Logger } from "@nestjs/common";

/**
 * KafkaCircuitBreakerService
 *
 * Protects the system from repeated downstream failures.
 *
 * Without a circuit breaker:
 * - Kafka keeps delivering messages
 * - Handler keeps failing
 * - System overloads (DB / API / CPU)
 *
 * With circuit breaker:
 * - After threshold → circuit opens
 * - Incoming processing is temporarily blocked
 * - System gets time to recover
 *
 * States:
 * - CLOSED → normal operation
 * - OPEN → reject requests
 * - HALF-OPEN → test recovery
 */
@Injectable()
export class KafkaCircuitBreakerService {
  private readonly logger = new Logger(KafkaCircuitBreakerService.name);

  private failures = 0;
  private lastFailureTime = 0;

  private state: "CLOSED" | "OPEN" | "HALF_OPEN" = "CLOSED";

  /**
   * Configuration
   */
  private readonly FAILURE_THRESHOLD = 5;
  private readonly RESET_TIMEOUT_MS = 10000; // 10 seconds

  /**
   * Executes a protected function within the circuit breaker.
   */
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === "OPEN") {
      if (this.shouldAttemptReset()) {
        this.state = "HALF_OPEN";
        this.logger.warn("Circuit breaker transitioning to HALF_OPEN");
      } else {
        this.logger.error("Circuit breaker OPEN → rejecting execution");
        throw new Error("Circuit breaker is OPEN");
      }
    }

    try {
      const result = await operation();

      this.onSuccess();

      return result;
    } catch (error) {
      this.onFailure(error);
      throw error;
    }
  }

  /**
   * Called when operation succeeds.
   */
  private onSuccess(): void {
    if (this.state === "HALF_OPEN") {
      this.logger.log("Circuit breaker CLOSED after successful test");
      this.reset();
      return;
    }

    this.failures = 0;
  }

  /**
   * Called when operation fails.
   */
  private onFailure(error: unknown): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    this.logger.error(
      `Circuit breaker failure (${this.failures}/${this.FAILURE_THRESHOLD})`,
      error instanceof Error ? error.stack : undefined,
    );

    if (this.failures >= this.FAILURE_THRESHOLD) {
      this.state = "OPEN";
      this.logger.error("Circuit breaker switched to OPEN");
    }
  }

  /**
   * Determines whether the system should attempt recovery.
   */
  private shouldAttemptReset(): boolean {
    return Date.now() - this.lastFailureTime > this.RESET_TIMEOUT_MS;
  }

  /**
   * Resets the circuit breaker to normal state.
   */
  private reset(): void {
    this.failures = 0;
    this.state = "CLOSED";
    this.lastFailureTime = 0;
  }
}
