import type { Provider } from "@nestjs/common";
import type { Consumer, Kafka, Producer } from "kafkajs";

import {
  KAFKA_CLIENT,
  KAFKA_CONSUMER,
  KAFKA_OPTIONS,
  KAFKA_PRODUCER,
} from "../core/kafka.constants";
import type { KafkaModuleOptions } from "../core/kafka.options";
import { createKafkaClient } from "./kafka.factory";

export const kafkaBootstrapProviders: Provider[] = [
  {
    provide: KAFKA_CLIENT,
    inject: [KAFKA_OPTIONS],
    useFactory: (options: KafkaModuleOptions): Kafka => createKafkaClient(options),
  },
  {
    provide: KAFKA_PRODUCER,
    inject: [KAFKA_CLIENT],
    useFactory: async (kafka: Kafka): Promise<Producer> => {
      const producer = kafka.producer();
      await producer.connect();
      return producer;
    },
  },
  {
    provide: KAFKA_CONSUMER,
    inject: [KAFKA_CLIENT, KAFKA_OPTIONS],
    useFactory: async (kafka: Kafka, options: KafkaModuleOptions): Promise<Consumer> => {
      const consumer = kafka.consumer({ groupId: options.groupId });
      await consumer.connect();
      return consumer;
    },
  },
];
