import "reflect-metadata";
import { KAFKA_HANDLER } from "../core/kafka.constants";

export function KafkaHandler(topic: string): MethodDecorator {
  return (
    target: Object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) => {
    if (!descriptor || typeof descriptor.value !== "function") {
      throw new Error(
        `@KafkaHandler can only be applied to methods. Invalid usage on ${String(
          propertyKey,
        )}`,
      );
    }

    Reflect.defineMetadata(KAFKA_HANDLER, topic, descriptor.value);
  };
}
