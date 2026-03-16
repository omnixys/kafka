/**
 * @license GPL-3.0-or-later
 * Copyright (C) 2025 Caleb Gyamfi - Omnixys Technologies
 *
 * Interfaces used by Kafka event handlers.
 *
 * These types define the structure of Kafka handler functions
 * and the contextual metadata provided during event processing.
 */

/**
 * KafkaEventContext
 *
 * Metadata attached to a Kafka message when delivered to a handler.
 * This contains transport-level information coming from Kafka.
 */
export interface KafkaEventContext {
  /**
   * Kafka topic name
   */
  topic: string;

  /**
   * Kafka partition number
   */
  partition: number;

  /**
   * Offset inside the partition
   */
  offset: string;

  /**
   * Message headers converted to string values
   */
  headers: Record<string, string | undefined>;

  /**
   * Kafka timestamp of the message
   */
  timestamp: string;
}

/**
 * KafkaEventHandler
 *
 * Base interface for class-based Kafka handlers.
 */
export interface KafkaEventHandler {
  /**
   * Called when a Kafka message is received.
   */
  handle(
    topic: string,
    payload: unknown,
    context: KafkaEventContext,
  ): Promise<void>;
}

/**
 * KafkaEventHandlerFn
 *
 * Function-based handler signature.
 */
export type KafkaEventHandlerFn = (
  topic: string,
  payload: unknown,
  context: KafkaEventContext,
) => Promise<void> | void;
