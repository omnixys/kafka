/**
 * @license GPL-3.0-or-later
 * Copyright (C) 2025 Caleb Gyamfi - Omnixys Technologies
 *
 * Kafka core constants for dependency injection, headers and metadata.
 */

// -----------------------------
// 🔌 DI TOKENS
// -----------------------------

export const KAFKA_PRODUCER_SYMBOL = Symbol("KAFKA_PRODUCER");
export const KAFKA_CONSUMER_SYMBOL = Symbol("KAFKA_CONSUMER");
export const KAFKA_ADMIN_SYMBOL = Symbol("KAFKA_ADMIN");

export const KAFKA_OPTIONS_SYMBOL = Symbol("KAFKA_OPTIONS");
export const KAFKA_PRODUCER_OPTIONS_SYMBOL = Symbol("KAFKA_PRODUCER_OPTIONS");
export const KAFKA_CONSUMER_OPTIONS_SYMBOL = Symbol("KAFKA_CONSUMER_OPTIONS");

// -----------------------------
// 📦 INTERNAL METADATA KEYS
// -----------------------------

export const KAFKA_HANDLER_SYMBOL = Symbol("KAFKA_HANDLER");
export const KAFKA_EVENT_SYMBOL = Symbol("KAFKA_EVENT");

// -----------------------------
// 🧾 HEADER KEYS (Custom)
// -----------------------------

export const KAFKA_HEADERS = {
  SERVICE: "x-meta-service",
  VERSION: "x-meta-version",
  CLASS: "x-meta-class",
  OPERATION: "x-meta-operation",
  TYPE: "x-meta-type",
  ACTOR_ID: "x-meta-actorId",
  TENANT_ID: "x-meta-tenantId",

  TRACE_ID: "x-meta-traceId",
  SPAN_ID: "x-meta-spanId",
  PARENT_SPAN_ID: "x-meta-parentSpanId",
  SAMPLED: "x-meta-sampled",
} as const;

// -----------------------------
// 🌐 W3C / OTEL HEADERS
// -----------------------------

export const W3C_TRACE_HEADERS = {
  TRACE_PARENT: "traceparent",
  TRACE_STATE: "tracestate",
} as const;

// -----------------------------
// 🧠 DEFAULTS
// -----------------------------

export const DEFAULT_KAFKA = {
  VERSION: "1",
  UNKNOWN_SERVICE: "unknown-service",
  UNKNOWN_OPERATION: "unknown-operation",
} as const;
