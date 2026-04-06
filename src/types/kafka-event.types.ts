import { EventType } from "./kafka-envelope.js";
import type { KafkaEventRegistry } from "./kafka-event-registry.js";
import { IKafkaEventContext } from "./kafka-event.interface.js";

export type KafkaTopicType = keyof KafkaEventRegistry;
export type KafkaPayloadType<T extends KafkaTopicType> = KafkaEventRegistry[T];

export interface KafkaMetaInfo {
  service?: string;
  version?: string;
  clazz?: string;
  operation?: string;
  type: EventType;
  actorId: string;
  tenantId: string;
}

export type KafkaEventType<T extends KafkaTopicType> = {
  topic: T;
  payload: KafkaPayloadType<T>;
  meta: KafkaMetaInfo;
};

/**
 * Strongly typed handler signature
 */
export type TypedKafkaHandler<T extends KafkaTopicType> = (
  topic: T,
  payload: KafkaPayloadType<T>,
  context: IKafkaEventContext,
) => Promise<void> | void;
