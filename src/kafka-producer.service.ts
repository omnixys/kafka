/**
 * @license GPL-3.0-or-later
 * Copyright (C) 2025 Caleb Gyamfi - Omnixys Technologies
 *
 * Kafka producer service used to publish events to Kafka topics.
 */

import {
  Inject,
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
} from "@nestjs/common";
import type { Producer, ProducerRecord } from "kafkajs";
import { context, trace, SpanKind, propagation } from "@opentelemetry/api";

import { KafkaHeaderBuilder } from "./kafka-header-builder.js";
import { KAFKA_PRODUCER } from "./kafka.constants.js";
import { KafkaPayload, KafkaTopic } from "./kafka-event.types.js";
import { TraceContextDTO } from "@omnixys/shared";


@Injectable()
export class KafkaProducerService implements OnModuleInit, OnModuleDestroy {
  private isReady = false;
  private isShuttingDown = false;

  constructor(
    @Inject(KAFKA_PRODUCER)
    private readonly producer: Producer,
  ) {}

  /**
   * Called when the module initializes.
   */
  async onModuleInit(): Promise<void> {
    await this.producer.connect();
    this.isReady = true;
  }

  /**
   * Publishes a Kafka message.
   */
  async send<T extends KafkaTopic>(
    topic: T,
    payload: KafkaPayload<T>,
    meta: {
      service?: string;
      version?: string;
      operation?: string;
    },
    traceContext?: TraceContextDTO,
  ): Promise<void> {
    if (this.isShuttingDown) return;
    if (!this.isReady) return;

    const {
      service = "unknown-service",
      version = "v1",
      operation = "unknown-operation",
    } = meta;

    const tracer = trace.getTracer("omnixys-kafka-producer");
    const activeCtx = context.active();

    const span = tracer.startSpan(
      `kafka.produce.${topic}`,
      {
        kind: SpanKind.PRODUCER,
        attributes: {
          "messaging.system": "kafka",
          "messaging.destination.name": topic,
          "messaging.destination": topic,
          "messaging.operation": "publish",
          "omnixys.service": service,
          "omnixys.operation": operation,
        },
      },
      activeCtx,
    );
    try {
      const spanCtx = span.spanContext();

      const effectiveTrace: TraceContextDTO = {
        traceId: spanCtx.traceId,
        spanId: spanCtx.spanId,
        parentSpanId: traceContext?.spanId,
        sampled: String(spanCtx.traceFlags === 1),
      };

      const envelope = {
        event: topic,
        service,
        version,
        payload,
      };


await context.with(trace.setSpan(activeCtx, span), async () => {
  const carrier: Record<string, string> = {};

  // 🔥 DAS ist der wichtigste Call
  propagation.inject(context.active(), carrier);

  const headers = {
    ...carrier,
    // ...KafkaHeaderBuilder.buildStandardHeaders({
    //   topic,
    //   operation,
    //   trace: effectiveTrace,
    //   version,
    //   service,
    // }),
    "x-event-name": topic,
    "x-event-type": operation,
    "x-event-version": version,
    "x-service": service,
  };

  console.debug("HEADERS", headers);

  const record: ProducerRecord = {
    topic,
    messages: [
      {
        value: JSON.stringify(envelope),
        headers,
      },
    ],
  };

    await this.producer.send({
      ...record,
      acks: -1,
      timeout: 5000,
    });
  });
    } catch (error) {
      span.recordException(error as Error);
      throw error;
    } finally {
      span.end();
    }
  }

  /**
   * Disconnects the Kafka producer.
   */
  async disconnect(): Promise<void> {
    if (!this.producer) return;

    await this.producer.disconnect();
  }

  async onModuleDestroy(): Promise<void> {
    this.isShuttingDown = true;
    await this.disconnect();
  }
}
