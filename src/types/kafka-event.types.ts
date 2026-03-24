import type { KafkaEventRegistry } from "./kafka-event-registry";

export type KafkaTopic = keyof KafkaEventRegistry;
export type KafkaPayload<T extends KafkaTopic> = KafkaEventRegistry[T];
