import { Kafka, logLevel } from "kafkajs";
import { KafkaModuleOptions } from "../core/kafka.options";

export function createKafkaClient(options: KafkaModuleOptions) {
  return new Kafka({
    clientId: options.clientId,
    brokers: options.brokers,
    logLevel: logLevel.INFO,
    retry: {
      retries: 10,
      initialRetryTime: 300,
      maxRetryTime: 3000,
    },
    connectionTimeout: 10000,
    requestTimeout: 30000,
  });
}
