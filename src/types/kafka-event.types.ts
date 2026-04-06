import { EventType } from "./kafka-envelope.js";
import type { KafkaEventRegistry } from "./kafka-event-registry.js";

export type KafkaTopic = keyof KafkaEventRegistry;
export type KafkaPayload<T extends KafkaTopic> = KafkaEventRegistry[T];

export interface KafkaMetaInfo {
  service?: string;
  version?: string;
  clazz?: string;
  operation?: string;
  type: EventType;
  actorId: string;
  tenantId: string;
}

export type KafkaEventType<T extends KafkaTopic> = {
  topic: T;
  payload: KafkaPayload<T>;
  meta: KafkaMetaInfo;
};
