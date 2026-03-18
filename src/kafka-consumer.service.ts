/**
 * @license GPL-3.0-or-later
 * Copyright (C) 2025 Caleb Gyamfi - Omnixys Technologies
 *
 * Kafka consumer service responsible for:
 * - connecting to Kafka
 * - subscribing to topics
 * - receiving messages
 * - forwarding events to the dispatcher
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
import { getAllKafkaTopics } from "./kafka-topics.js";

import { KAFKA_CONSUMER } from "./kafka.constants.js";
import { context, propagation, ROOT_CONTEXT, SpanKind, trace } from "@opentelemetry/api";

@Injectable()
export class KafkaConsumerService
  implements OnModuleInit, OnModuleDestroy, OnApplicationShutdown
{

  private isRunning = false;
  private shutdownRequested = false;

  constructor(  @Inject(KAFKA_CONSUMER)
  private readonly consumer: Consumer,private readonly dispatcher: KafkaEventDispatcherService) {}

  /**
   * Called when NestJS module initializes.
   * Connects the consumer and starts listening for events.
   */
  async onModuleInit(): Promise<void> {
    await this.consumer.connect();

    const topics = this.dispatcher.getRegisteredTopics();

    console.log("Kafka consumer subscribed topics:", topics);
    if (topics.length === 0) {
      console.warn("No Kafka topics registered. Consumer will not subscribe.");
      return;
    }

    await this.consumer.subscribe({
      topics,
      fromBeginning: false,
    });

    this.isRunning = true;

    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        if (this.shutdownRequested) return;

          const headers = Object.fromEntries(
            Object.entries(message.headers ?? {}).map(([k, v]) => [
              k,
              v?.toString(),
            ]),
          );
        
        
        const tracer = trace.getTracer("omnixys-kafka-consumer");
        
          const traceId = headers["x-trace-id"];
        const spanId = headers["x-span-id"];
        
        let span;
        
                    const carrier = headers;

                    // 🔥 DAS ist der Gamechanger
                    const ctx = propagation.extract(ROOT_CONTEXT, carrier);


          if (traceId && spanId) {
            const remoteContext = trace.setSpanContext(context.active(), {
              traceId,
              spanId,
              traceFlags: 1,
            });



            span = tracer.startSpan(
              `kafka.consume.${topic}`,
              {
                kind: SpanKind.CONSUMER,
                attributes: {
                  "messaging.system": "kafka",
                  "messaging.destination": topic,
                  "messaging.operation": "receive",
                },
              },
              // remoteContext,
              ctx,
            );
          } else {
            span = tracer.startSpan(`kafka.consume.${topic}`, {
              kind: SpanKind.CONSUMER,
            });
          }
        
        
          await context.with(
            trace.setSpan(ctx, span),
            async () => {
              try {
                const rawValue = message.value?.toString();

                if (!rawValue) return;

                try {
                  const payload = JSON.parse(rawValue);

                  const context: KafkaEventContext = {
                    topic,
                    partition,
                    offset: message.offset,
                    headers: Object.fromEntries(
                      Object.entries(message.headers ?? {}).map(([k, v]) => [
                        k,
                        v?.toString(),
                      ]),
                    ),
                    timestamp: message.timestamp,
                  };

                  await this.dispatcher.dispatch(topic, payload, context);
                } catch (error) {
                  console.error(
                    `Kafka message processing error on topic ${topic}`,
                    error,
                  );
                }
              } finally {
                span.end();
              }
            },
          );
      },
    });

    console.log("Kafka consumer started");
  }

  /**
   * Gracefully disconnect the consumer.
   */
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
