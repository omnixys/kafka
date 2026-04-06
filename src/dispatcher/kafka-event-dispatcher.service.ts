import { Injectable, Logger, OnApplicationBootstrap} from "@nestjs/common";
import { DiscoveryService, MetadataScanner, Reflector } from "@nestjs/core";
import { KAFKA_EVENT_METADATA, KAFKA_HANDLER } from "../core/kafka.constants.js";

/**
 * Strongly typed handler function
 */
type KafkaHandlerFn = (
  topic: string,
  payload: unknown,
  context: unknown,
) => Promise<void> | void;

/**
 * Internal registry entry
 */
interface HandlerEntry {
  instance: Record<string, unknown>;
  methodName: string;
}
/**
 * KafkaEventDispatcherService
 *
 * Responsible for:
 * - Discovering Kafka handlers via decorators
 * - Registering topic → handler mappings
 * - Dispatching incoming Kafka events
 *
 * Uses NestJS DiscoveryService for safe and deterministic initialization.
 */
@Injectable()
export class KafkaEventDispatcherService implements OnApplicationBootstrap {
  private readonly logger = new Logger(KafkaEventDispatcherService.name);
  private readonly handlers = new Map<string, HandlerEntry>();

  constructor(
    private readonly discovery: DiscoveryService,
    private readonly scanner: MetadataScanner,
    private readonly reflector: Reflector,
  ) {}

  private readyResolver!: () => void;
  public readonly ready = new Promise<void>((resolve) => {
    this.readyResolver = resolve;
  });

  /**
   * Initializes handler registry on application bootstrap.
   */
  onApplicationBootstrap(): void {
    this.scanHandlers();
    this.readyResolver();
    this.logger.log(`Kafka handlers registered: ${this.handlers.size}`);
  }

  /**
   * Scans all providers for KafkaEvent decorators.
   */
  private scanHandlers() {
    const providers = this.discovery.getProviders();

    for (const wrapper of providers) {
      const instance = wrapper.instance;
      if (!instance) continue;

      const isHandler = this.reflector.get<boolean>(
        KAFKA_HANDLER,
        instance.constructor,
      );
      //console.log({isHandler, provider: wrapper.name}) // clazzName

      if (!isHandler) continue;

      const prototype = Object.getPrototypeOf(instance);
      let hasAtLeastOneHandler = false;

      this.scanner.getAllMethodNames(prototype).forEach((methodName) => {
        const methodRef = instance[methodName]; // ✅ FIX

        const metadata = this.reflector.get<{ topics: string[] }>(
          KAFKA_EVENT_METADATA,
          methodRef,
        );

        if (!metadata) return;

        hasAtLeastOneHandler = true;

        for (const topic of metadata.topics) {
          /**
           * Prevent duplicate topic registration
           */
          if (this.handlers.has(topic)) {
            const existing = this.handlers.get(topic)!;

            throw new Error(
              `Duplicate Kafka handler for topic "${topic}"\n` +
                `Existing: ${existing.instance.constructor.name}.${existing.methodName}\n` +
                `New: ${instance.constructor.name}.${methodName}`,
            );
          }

          this.handlers.set(topic, { instance, methodName });
          this.logger.debug(
            `Registered Kafka handler → topic=${topic} handler=${instance.constructor.name}.${methodName}`,
          );
        }
      });

      /**
       * Warn if handler class is marked but has no methods
       */
      if (!hasAtLeastOneHandler) {
        this.logger.warn(
          `KafkaEventHandler "${instance.constructor.name}" has no @KafkaEvent methods`,
        );
      }
    }
  }

  /**
   * Returns all registered Kafka topics.
   */
  getRegisteredTopics(): string[] {
    return [...this.handlers.keys()];
  }

  /**
   * Dispatches a Kafka event to the correct handler.
   */
  async dispatch(topic: string, payload: unknown, context: unknown) {
    const entry = this.handlers.get(topic);

    if (!entry) {
      this.logger.warn(`No handler found for topic=${topic}`);
      return;
    }


        const method = entry.instance[entry.methodName] as KafkaHandlerFn;

        if (typeof method !== "function") {
          throw new Error(`Invalid handler for topic=${topic}`);
        }
    
    await method.call(entry.instance, topic, payload, context);
  }
}
