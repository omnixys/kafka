/**
 * @license GPL-3.0-or-later
 * Copyright (C) 2025 Caleb Gyamfi - Omnixys Technologies
 *
 * Kafka decorators used to register event handlers.
 *
 * These decorators allow services to define Kafka event handlers
 * using NestJS metadata and automatic discovery.
 */

import { SetMetadata } from "@nestjs/common";

/**
 * Metadata key used to store Kafka handler information on classes.
 */
export const KAFKA_HANDLER = "KAFKA_HANDLER";

/**
 * Metadata key used to store Kafka event topics on handler methods.
 */
export const KAFKA_EVENT_METADATA = Symbol("KAFKA_EVENT_METADATA");

/**
 * KafkaHandler
 *
 * Class decorator used to mark a class as a Kafka event handler.
 *
 * Example:
 *
 * @KafkaHandler("InvitationHandler")
 * export class InvitationHandler {}
 */
export function KafkaHandler(handlerName: string): ClassDecorator {
  return (target) => {
    SetMetadata(KAFKA_HANDLER, handlerName)(target);
  };
}

/**
 * KafkaEvent
 *
 * Method decorator used to register a handler method for one or more Kafka topics.
 *
 * Example:
 *
 * @KafkaEvent(KafkaTopics.invitation.deleteInvitation)
 * async handleDeleteInvitation(...) {}
 */
export function KafkaEvent(...topics: string[]): MethodDecorator {
  return (target, propertyKey, descriptor) => {
    SetMetadata(KAFKA_EVENT_METADATA, { topics })(
      target,
      propertyKey,
      descriptor,
    );
  };
}
