/**
 * @license GPL-3.0-or-later
 * Copyright (C) 2025 Caleb Gyamfi - Omnixys Technologies
 *
 * Standard Kafka message envelope used across all Omnixys services.
 *
 * This envelope ensures that every Kafka message contains
 * consistent metadata such as event name, version and service origin.
 */

/**
 * KafkaEnvelope
 *
 * Unified message format for all Kafka messages within the Omnixys platform.
 *
 * @template TPayload - Type of the message payload
 * @template TTrace - Optional trace metadata structure
 */
export interface KafkaEnvelope<
  TPayload = unknown,
  TTrace extends Record<string, string | undefined> = Record<
    string,
    string | undefined
  >,
> {
  /**
   * Event identifier (example: "deleteInvitation")
   */
  event: string;

  /**
   * Origin service name
   * Example: "invitation-service"
   */
  service: string;

  /**
   * Event schema version
   * Example: "v1"
   */
  version: string;

  /**
   * Optional tracing metadata propagated across services
   */
  trace?: TTrace;

  /**
   * Actual business payload
   */
  payload: TPayload;
}
