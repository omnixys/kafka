import { Kafka, logLevel } from "kafkajs";
import type { KafkaModuleOptions } from "../core/kafka.options.js";

export function createKafkaClient(options: KafkaModuleOptions): Kafka {
  return new Kafka({
    ...options.client,
    clientId: options.clientId,
    brokers: options.brokers,
    logLevel: options.client?.logLevel ?? logLevel.INFO,

    retry: {
      retries: 20,
      initialRetryTime: 300,
      maxRetryTime: 30000,
      ...options.client?.retry,
    },

    connectionTimeout: options.client?.connectionTimeout ?? 10000,
    requestTimeout: options.client?.requestTimeout ?? 30000,
  });
}
