import type { KafkaEventRegistry } from "./kafka-event-registry";

export type KafkaTopic = keyof KafkaEventRegistry;
export type KafkaPayload<T extends KafkaTopic> = KafkaEventRegistry[T];

export type KafkaEventType<T extends KafkaTopic> = {
  topic: T;
  payload: KafkaPayload<T>;
  meta: {
    service?: string;
    version?: string;
    class?: string;
    operation?: string;
    type?: string;
  };
};
