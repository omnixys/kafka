import { KafkaEventRegistry } from "./kafka-event-registry.js";

export type KafkaTopic = keyof KafkaEventRegistry;

export type KafkaPayload<T extends KafkaTopic> = KafkaEventRegistry[T];
