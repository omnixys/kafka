import { Injectable, type OnModuleInit } from "@nestjs/common";
import { DiscoveryService, MetadataScanner, Reflector } from "@nestjs/core";
import { KAFKA_EVENT_METADATA, KAFKA_HANDLER } from "../core";

interface HandlerEntry {
  instance: any;
  methodName: string;
}

@Injectable()
export class KafkaEventDispatcherService implements OnModuleInit {
  private readonly handlers = new Map<string, HandlerEntry>();

  constructor(
    private readonly discovery: DiscoveryService,
    private readonly scanner: MetadataScanner,
    private readonly reflector: Reflector,
  ) {}

  onModuleInit() {
    const providers = this.discovery.getProviders();

    for (const wrapper of providers) {
      const instance = wrapper.instance;
      if (!instance) continue;

      const isHandler = this.reflector.get(KAFKA_HANDLER, instance.constructor);

      if (!isHandler) continue;

      const prototype = Object.getPrototypeOf(instance);

      this.scanner.getAllMethodNames(prototype).forEach((methodName) => {
        const methodRef = prototype[methodName];

        const metadata = this.reflector.get<{ topics: string[] }>(KAFKA_EVENT_METADATA, methodRef);

        if (!metadata) return;

        for (const topic of metadata.topics) {
          this.handlers.set(topic, { instance, methodName });
        }
      });
    }
  }

  getRegisteredTopics(): string[] {
    return [...this.handlers.keys()];
  }

  async dispatch(topic: string, payload: unknown, context: any) {
    const entry = this.handlers.get(topic);
    if (!entry) return;

    const method = entry.instance[entry.methodName];

    await method.call(entry.instance, payload, context);
  }
}
