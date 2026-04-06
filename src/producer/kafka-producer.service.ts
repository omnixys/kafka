import { Inject, Injectable, Logger } from "@nestjs/common";
import {
  TraceContextExtractor,
  W3CPropagator,
  KafkaTrace,
} from "@omnixys/observability";
import type { Message, Producer } from "kafkajs";
import { KAFKA_PRODUCER } from "../core/kafka.constants.js";
import type { KafkaEnvelope } from "../types/kafka-envelope.js";

import { createKafkaHeaders } from "../headers/kafka-header-builder.js";
import { KafkaEventRegistry } from "../types/kafka-event-registry.js";
import { KafkaEventType, KafkaTopic } from "../types/kafka-event.types.js";
import { DEFAULT_KAFKA, KAFKA_HEADERS } from "../types/kafka-constants.js";

@Injectable()
export class KafkaProducerService {
  private readonly logger = new Logger(KafkaProducerService.name);

  constructor(
    @Inject(KAFKA_PRODUCER)
    private readonly producer: Producer,
  ) {}

  async send<T extends KafkaTopic>(input: KafkaEventType<T>): Promise<void> {
    const { topic, payload, meta } = input;

    const carrier = createKafkaHeaders();
    KafkaTrace.inject(carrier);

    const traceContext = TraceContextExtractor.current();

    if (traceContext) {
      // ✅ W3C Trace Context
      new W3CPropagator().inject(carrier);

      if (traceContext?.traceId)
        carrier.set(KAFKA_HEADERS.TRACE_ID, traceContext.traceId);
      if (traceContext?.spanId)
        carrier.set(KAFKA_HEADERS.SPAN_ID, traceContext.spanId);
    }

    if (meta?.service) carrier.set(KAFKA_HEADERS.SERVICE, meta.service);
    if (meta?.version) carrier.set(KAFKA_HEADERS.VERSION, meta.version);
    if (meta?.clazz) carrier.set(KAFKA_HEADERS.CLASS, meta.clazz);
    if (meta?.operation) carrier.set(KAFKA_HEADERS.OPERATION, meta.operation);
    if (meta?.actorId) carrier.set(KAFKA_HEADERS.ACTOR_ID, meta.actorId);
    if (meta?.tenantId) carrier.set(KAFKA_HEADERS.TENANT_ID, meta.tenantId);

    carrier.set(KAFKA_HEADERS.TYPE, meta.type);

    const headers = carrier.toKafkaHeaders();

    const envelope: KafkaEnvelope<KafkaEventRegistry[T]> = {
      eventId: crypto.randomUUID(),
      eventName: topic,
      eventType: meta.type,
      eventVersion: meta.version ?? DEFAULT_KAFKA.VERSION,
      service: meta.service ?? DEFAULT_KAFKA.UNKNOWN_SERVICE,
      //operation: meta?.operation ?? "UKNOWN OPERATION",
      timestamp: new Date().toISOString(),
      payload,
    };

    const message: Message = {
      value: JSON.stringify(envelope),
      headers,
    };

    await KafkaTrace.produce(topic, async () => {
      await this.sendMessage(topic, message);
    });

    // await KafkaTrace.produce(topic, async () => {
    //   await this.producer.send({
    //     topic,
    //     messages: [
    //       {
    //         value: JSON.stringify(envelope),
    //         headers: headers as any,
    //       },
    //     ],
    //     //acks: -1,
    //   });
    // });
  }

  /**
   * Sends raw message (used for retry/DLQ).
   *
   * IMPORTANT:
   * - Keeps original message intact
   * - No re-wrapping
   */
  async rawSend(
    topic: string,
    rawValue: string,
    headers?: Record<string, string>,
  ): Promise<void> {
    await this.sendMessage(topic, {
      value: rawValue,
      headers: this.normalizeHeaders(headers),
    });
  }

  /**
   * Sends raw message with explicit headers.
   *
   * Used by retry service.
   */
  async rawSendWithHeaders(
    topic: string,
    rawValue: string,
    headers: Record<string, string>,
  ): Promise<void> {
    await this.sendMessage(topic, {
      value: rawValue,
      headers: this.normalizeHeaders(headers),
    });
  }

  /**
   * Core send logic.
   *
   * Centralized to ensure:
   * - consistent configuration
   * - proper logging
   * - future extensibility
   */
  private async sendMessage(topic: string, message: Message): Promise<void> {
    try {
      await this.producer.send({
        topic,
        messages: [message],
        acks: -1,
      });

      this.logger.debug(`Message sent → topic=${topic}`);
    } catch (error) {
      this.logger.error(
        `Kafka send failed → topic=${topic}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  /**
   * Normalizes headers into Kafka-compatible format.
   *
   * Kafka requires:
   * - Buffer values
   */
  private normalizeHeaders(
    headers?: Record<string, string>,
  ): Record<string, Buffer> | undefined {
    if (!headers) return undefined;

    return Object.fromEntries(
      Object.entries(headers).map(([key, value]) => [key, Buffer.from(value)]),
    );
  }
}
