/**
 * @license GPL-3.0-or-later
 * Copyright (C) 2025 Caleb Gyamfi - Omnixys Technologies
 *
 * Kafka Event Dispatcher.
 *
 * Responsible for:
 * - discovering Kafka handlers
 * - registering topic → handler mappings
 * - dispatching Kafka events to the correct handler
 */

import { Injectable, OnModuleInit } from "@nestjs/common";
import { DiscoveryService, MetadataScanner, Reflector } from "@nestjs/core";

import {
  KAFKA_EVENT_METADATA,
  KAFKA_HANDLER,
} from "./kafka-event.decorator.js";
import {
  KafkaEventContext,
  KafkaEventHandlerFn,
} from "./kafka-event.interface.js";

interface RegisteredHandler {
  handler: object;
  methodName: string;
}

@Injectable()
export class KafkaEventDispatcherService implements OnModuleInit {
  private readonly topicToHandler = new Map<string, RegisteredHandler>();

  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly metadataScanner: MetadataScanner,
    private readonly reflector: Reflector,
  ) {}

  /**
   * Called when NestJS module initialization completes.
   * Scans the application for Kafka handlers.
   */
  onModuleInit(): void {
    const providers = this.discoveryService.getProviders();

    for (const wrapper of providers) {
      const instance = wrapper.instance as object | undefined;

      if (!instance) continue;

      const handlerName = this.reflector.get<string>(
        KAFKA_HANDLER,
        instance.constructor,
      );

      if (!handlerName) continue;

      const prototype = Object.getPrototypeOf(instance);
      const methodNames = this.metadataScanner.getAllMethodNames(prototype);

      for (const methodName of methodNames) {
        const methodRef = prototype[methodName];

        const metadata = this.reflector.get<{ topics: string[] }>(
          KAFKA_EVENT_METADATA,
          methodRef,
        );

        if (!metadata) continue;

        for (const topic of metadata.topics) {
          this.topicToHandler.set(topic, {
            handler: instance,
            methodName,
          });
        }
      }
    }
  }

  getRegisteredTopics(): string[] {
    return [...this.topicToHandler.keys()];
  }

  /**
   * Dispatches an event to the correct Kafka handler.
   */
  async dispatch<TPayload>(
    topic: string,
    payload: TPayload,
    context: KafkaEventContext,
  ): Promise<void> {
    const match = this.topicToHandler.get(topic);

    if (!match) return;

    const { handler, methodName } = match;

    const method = (handler as Record<string, KafkaEventHandlerFn>)[methodName];

    if (typeof method !== "function") return;

    await method.call(handler, topic, payload, context);
  }
}
