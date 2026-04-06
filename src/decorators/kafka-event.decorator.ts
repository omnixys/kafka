import { SetMetadata } from "@nestjs/common";
import {
  KAFKA_EVENT_METADATA,
  KAFKA_HANDLER,
} from "../core/kafka.constants.js";
import { KafkaTopicType } from "../types/kafka-event.types.js";

export function KafkaEventHandler(name: string): ClassDecorator {
  return SetMetadata(KAFKA_HANDLER, name);
}

/**
 * KafkaEvent decorator
 *
 * Registers a method as a Kafka event handler for one or more topics.
 *
 * Example:
 * @KafkaEvent('ticket.create')
 */
// export function KafkaEvent(...topics: string[]): MethodDecorator {
//   return SetMetadata(KAFKA_EVENT_METADATA, { topics });
// }

export function KafkaEvent<T extends KafkaTopicType>(
  ...topics: T[]
): MethodDecorator {
  return SetMetadata(KAFKA_EVENT_METADATA, { topics });
}
