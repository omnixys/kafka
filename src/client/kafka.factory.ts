import { Kafka, logLevel } from "kafkajs";
import type { KafkaModuleOptions } from "../core/kafka.options.js";


export function createKafkaClient(options: KafkaModuleOptions): Kafka {
  return new Kafka({
    clientId: options.clientId,
    brokers: options.brokers,
    logLevel: logLevel.INFO,

    retry: {
      retries: 20,
      initialRetryTime: 300,
      maxRetryTime: 30000,
    },

    connectionTimeout: 10000,
    requestTimeout: 30000,
  });
}