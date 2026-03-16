import { Consumer, Kafka, logLevel, Producer } from "kafkajs";


export interface KafkaModuleOptions {
  clientId: string;
  brokers: string[];
  groupId: string;
}


/**
 * Creates a Kafka client instance.
 */
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

/**
 * Creates a Kafka producer.
 */
export function createKafkaProducer(options: KafkaModuleOptions): Producer {
  const kafka = createKafkaClient(options);
  return kafka.producer();
}

/**
 * Creates a Kafka consumer.
 */
export function createKafkaConsumer(options: KafkaModuleOptions): Consumer {
  const kafka = createKafkaClient(options);

  return kafka.consumer({
    groupId: options.groupId,
  });
}
