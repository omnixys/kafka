/**
 * @license GPL-3.0-or-later
 * Copyright (C) 2025 Caleb Gyamfi - Omnixys Technologies
 *
 * Kafka header utilities used to attach metadata and tracing
 * information to Kafka messages.
 */

import { randomUUID } from "crypto";

/**
 * Standard Kafka header keys used across the Omnixys platform.
 */
export const KAFKA_HEADER_KEYS = {
  TRACE_ID: "x-trace-id",
  EVENT_NAME: "x-event-name",
  EVENT_TYPE: "x-event-type",
  EVENT_VERSION: "x-event-version",
  SERVICE: "x-service",
} as const;

/**
 * Standard header type.
 */
export type StandardKafkaHeaders = Record<string, string>;

/**
 * KafkaHeaderBuilder
 *
 * Utility responsible for generating standardized Kafka message headers.
 */
export class KafkaHeaderBuilder {
  /**
   * Builds the default Kafka headers attached to each message.
   */
  static buildStandardHeaders({
    topic,
    operation = "unknown-operation",
    trace,
    version = "v1",
    service = "unknown-service",
  }: {
    topic: string;
    operation?: string;
    trace?: { traceId?: string };
    version?: string;
    service?: string;
  }): StandardKafkaHeaders {
    const headers: StandardKafkaHeaders = {
      [KAFKA_HEADER_KEYS.EVENT_NAME]: topic,
      [KAFKA_HEADER_KEYS.EVENT_TYPE]: operation,
      [KAFKA_HEADER_KEYS.EVENT_VERSION]: version,
      [KAFKA_HEADER_KEYS.SERVICE]: service,
      [KAFKA_HEADER_KEYS.TRACE_ID]: trace?.traceId ?? randomUUID(),
    };

    return headers;
  }
}
