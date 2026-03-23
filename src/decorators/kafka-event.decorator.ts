import { SetMetadata } from "@nestjs/common";
import { KAFKA_EVENT_METADATA, KAFKA_HANDLER } from "../core";

export function KafkaEventHandler(name: string): ClassDecorator {
  return SetMetadata(KAFKA_HANDLER, name);
}

export function KafkaEvent(...topics: string[]): MethodDecorator {
  return SetMetadata(KAFKA_EVENT_METADATA, { topics });
}
