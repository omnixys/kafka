import "reflect-metadata";
import {
  KAFKA_EVENT_METADATA,
  KAFKA_HANDLER,
} from "../core/kafka.constants.js";

/**
 * Compatibility decorator supporting the historical class and method forms.
 * Prefer `@KafkaEventHandler()` on classes and `@KafkaEvent()` on methods.
 */
export function KafkaHandler(
  topicOrName: string,
): ClassDecorator & MethodDecorator {
  return (
    target: object | Function,
    propertyKey?: string | symbol,
    descriptor?: PropertyDescriptor,
  ) => {
    if (propertyKey === undefined) {
      Reflect.defineMetadata(KAFKA_HANDLER, topicOrName, target);
      return;
    }

    if (!descriptor || typeof descriptor.value !== "function") {
      throw new Error(
        `@KafkaHandler can only decorate a class or method: ${String(propertyKey)}`,
      );
    }
    Reflect.defineMetadata(KAFKA_HANDLER, true, (target as any).constructor);
    Reflect.defineMetadata(
      KAFKA_EVENT_METADATA,
      { topics: [topicOrName] },
      descriptor.value,
    );
  };
}
