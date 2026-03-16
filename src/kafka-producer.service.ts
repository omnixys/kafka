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

import { KafkaHeaderBuilder } from "./kafka-header-builder.js";
import { KAFKA_PRODUCER } from "./kafka.constants.js";
import { KafkaPayload, KafkaTopic } from "./kafka-event.types.js";
import { TraceContext } from "@omnixys/contracts";

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
    service: string,
    trace?: TraceContext,
  ): Promise<void> {
    if (this.isShuttingDown) return;
    if (!this.isReady) return;

    const envelope = {
      event: topic,
      service,
      version: "v1",
      payload,
    };
      const headers = KafkaHeaderBuilder.buildStandardHeaders(
        topic,
        topic,
        trace,
        "v1",
        service,
      );
    
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
