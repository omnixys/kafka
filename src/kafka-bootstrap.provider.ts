/**
 * @license GPL-3.0-or-later
 * Copyright (C) 2025 Caleb Gyamfi - Omnixys Technologies
 *
 * Kafka bootstrap providers responsible for creating
 * the Kafka client and producer instances used by NestJS.
 */

import type { Provider } from "@nestjs/common";
import type { Consumer, Kafka, Producer } from "kafkajs";

import { createKafkaClient, KafkaModuleOptions } from "./kafka.config.js";
import {
  KAFKA_CONSUMER,
  KAFKA_INSTANCE,
  KAFKA_OPTIONS,
  KAFKA_PRODUCER,
} from "./kafka.constants.js";

/**
 * Kafka client provider.
 * Provides a shared KafkaJS client instance across the application.
 */
export const kafkaInstanceProvider: Provider = {
  provide: KAFKA_INSTANCE,
  inject: [KAFKA_OPTIONS],
  useFactory: (options: KafkaModuleOptions): Kafka => {
    return createKafkaClient(options);
  },
};
/**
 * Kafka producer provider.
 * Ensures the Kafka producer is connected once during application startup.
 */
export const kafkaProducerProvider: Provider = {
  provide: KAFKA_PRODUCER,
  inject: [KAFKA_INSTANCE],
  useFactory: async (kafka: Kafka): Promise<Producer> => {
    const producer = kafka.producer();
    await producer.connect();
    return producer;
  },
};

export const kafkaConsumerProvider: Provider = {
  provide: KAFKA_CONSUMER,
  inject: [KAFKA_INSTANCE, KAFKA_OPTIONS],
  useFactory: async (
    kafka: Kafka,
    options: KafkaModuleOptions,
  ): Promise<Consumer> => {
    const consumer = kafka.consumer({
      groupId: options.groupId,
    });

    await consumer.connect();
    return consumer;
  },
};

/**
 * Aggregated bootstrap providers used by KafkaModule.
 */
export const kafkaBootstrapProviders = [
  kafkaInstanceProvider,
  kafkaProducerProvider,
  kafkaConsumerProvider,
];
