/**
 * KafkaProducerService (FIXED - OpenTelemetry compliant)
 */

import {
  Inject,
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
} from "@nestjs/common";
import type { Producer } from "kafkajs";
import { context, trace, SpanKind, propagation } from "@opentelemetry/api";

import { KAFKA_PRODUCER } from "./kafka.constants.js";
import { KafkaPayload, KafkaTopic } from "./kafka-event.types.js";

@Injectable()
export class KafkaProducerService implements OnModuleInit, OnModuleDestroy {
  private isReady = false;
  private isShuttingDown = false;

  constructor(
    @Inject(KAFKA_PRODUCER)
    private readonly producer: Producer,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.producer.connect();
    this.isReady = true;
  }

  async send<T extends KafkaTopic>(
    topic: T,
    payload: KafkaPayload<T>,
    meta: {
      service?: string;
      version?: string;
      operation?: string;
    },
  ): Promise<void> {
    if (this.isShuttingDown || !this.isReady) return;

    const {
      service = "unknown-service",
      version = "v1",
      operation = "unknown-operation",
    } = meta;

    const tracer = trace.getTracer("omnixys-kafka-producer");

    const span = tracer.startSpan(`kafka.produce.${topic}`, {
      kind: SpanKind.PRODUCER,
      attributes: {
        "messaging.system": "kafka",
        "messaging.destination.name": topic,
        "messaging.operation": "publish",
        "messaging.client_id": service,
      },
    });

    const ctx = trace.setSpan(context.active(), span);

    try {
      await context.with(ctx, async () => {
        const headers: Record<string, string> = {};

        // ✅ inject W3C trace context
        propagation.inject(ctx, headers);

        // debug
        console.log("TRACE PRODUCER", {
          spanContext: span.spanContext(),
          headers,
        });

        const envelope = {
          event: topic,
          service,
          version,
          payload,
        };

        await this.producer.send({
          topic,
          messages: [
            {
              value: JSON.stringify(envelope),
              headers,
            },
          ],
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

  async disconnect(): Promise<void> {
    if (!this.producer) return;
    await this.producer.disconnect();
  }

  async onModuleDestroy(): Promise<void> {
    this.isShuttingDown = true;
    await this.disconnect();
  }
}
