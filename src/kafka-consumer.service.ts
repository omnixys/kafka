/**
 * KafkaConsumerService (FIXED - OpenTelemetry compliant)
 */

import {
  Inject,
  Injectable,
  OnApplicationShutdown,
  OnModuleDestroy,
  OnModuleInit,
} from "@nestjs/common";
import type { Consumer } from "kafkajs";

import { KafkaEventDispatcherService } from "./kafka-event-dispatcher.service.js";
import { KafkaEventContext } from "./kafka-event.interface.js";

import { KAFKA_CONSUMER } from "./kafka.constants.js";

import {
  context,
  propagation,
  ROOT_CONTEXT,
  SpanKind,
  trace,
} from "@opentelemetry/api";

@Injectable()
export class KafkaConsumerService
  implements OnModuleInit, OnModuleDestroy, OnApplicationShutdown
{
  private isRunning = false;
  private shutdownRequested = false;

  constructor(
    @Inject(KAFKA_CONSUMER)
    private readonly consumer: Consumer,
    private readonly dispatcher: KafkaEventDispatcherService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.consumer.connect();

    const topics = this.dispatcher.getRegisteredTopics();

    if (topics.length === 0) return;

    await this.consumer.subscribe({
      topics,
      fromBeginning: false,
    });

    this.isRunning = true;

    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        if (this.shutdownRequested) return;

        const headers: Record<string, string> = Object.fromEntries(
          Object.entries(message.headers ?? {}).map(([k, v]) => [
            k,
            v?.toString() ?? "",
          ]),
        );

        // ✅ extract context from headers
        const extractedCtx = propagation.extract(ROOT_CONTEXT, headers);

        const tracer = trace.getTracer("omnixys-kafka-consumer");

        const span = tracer.startSpan(
          `kafka.consume.${topic}`,
          {
            kind: SpanKind.CONSUMER,
            attributes: {
              "messaging.system": "kafka",
              "messaging.destination.name": topic,
              "messaging.operation": "receive",
            },
          },
          extractedCtx, // ✅ parent context
        );

        const ctx = trace.setSpan(extractedCtx, span);

        try {
          await context.with(ctx, async () => {
            // debug
            console.log("TRACE CONSUMER", {
              headers,
              extractedSpanContext: trace.getSpan(ctx)?.spanContext(),
            });

            const rawValue = message.value?.toString();
            if (!rawValue) return;

            const payload = JSON.parse(rawValue);

            const kafkaContext: KafkaEventContext = {
              topic,
              partition,
              offset: message.offset,
              headers,
              timestamp: message.timestamp,
            };

            await this.dispatcher.dispatch(topic, payload, kafkaContext);
          });
        } catch (error) {
          span.recordException(error as Error);
          console.error("Kafka processing error", error);
        } finally {
          span.end();
        }
      },
    });
  }

  async disconnect(): Promise<void> {
    if (!this.isRunning) return;

    this.shutdownRequested = true;

    await this.consumer.stop();
    await this.consumer.disconnect();

    this.isRunning = false;
  }

  async onModuleDestroy(): Promise<void> {
    await this.disconnect();
  }

  async onApplicationShutdown(): Promise<void> {
    await this.disconnect();
  }
}
