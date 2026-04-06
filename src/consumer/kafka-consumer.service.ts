import {
  Inject,
  Injectable,
  Logger,
  OnApplicationBootstrap,
  type OnModuleDestroy,
  type OnModuleInit,
} from "@nestjs/common";
import { KafkaTrace} from "@omnixys/observability";
import type { Consumer, EachBatchPayload, KafkaMessage } from "kafkajs";
import { KAFKA_CONSUMER } from "../core/kafka.constants.js";
import { KafkaEventDispatcherService } from "../dispatcher/kafka-event-dispatcher.service.js";
import { KafkaCarrier } from "../headers/kafka-header-carrier.js";
import { KafkaIdempotencyService } from "./kafka-idempotency.service.js";
import { KafkaRetryService } from "./kafka-retry.service.js";
import { KafkaCircuitBreakerService } from "./kafka-circuit-breaker.service.js";

@Injectable()
export class KafkaConsumerService
  implements OnApplicationBootstrap, OnModuleDestroy
{
  private readonly logger = new Logger(KafkaConsumerService.name);
  private running = false;

  constructor(
    @Inject(KAFKA_CONSUMER)
    private readonly consumer: Consumer,
    private readonly dispatcher: KafkaEventDispatcherService,
    private readonly idempotency: KafkaIdempotencyService,
    private readonly retryService: KafkaRetryService,
    private readonly circuitBreaker: KafkaCircuitBreakerService,
  ) {}

  async onApplicationBootstrap() {
    await this.dispatcher.ready;

    const topics = this.dispatcher.getRegisteredTopics();

    if (!topics.length) {
      console.warn("No Kafka topics registered");
      return;
    }

    this.logger.log(`Subscribing to topics: ${topics.join(", ")}`);

    await this.consumer.subscribe({
      topics,
      fromBeginning: false,
    });

    this.running = true;

    await this.consumer.run({
      autoCommit: false,

      eachBatch: async (payload: EachBatchPayload) => {
        await this.processBatch(payload);
      },
    });

    // await this.consumer.run({
    //   eachMessage: async ({ topic, partition, message }) => {
    //     const carrier = new KafkaCarrier(message.headers as any);

    //     await KafkaTrace.extract(carrier, async () => {
    //       await KafkaTrace.consume(topic, async () => {
    //         const value = message.value?.toString();
    //         if (!value) return;

    //         const payload = JSON.parse(value);

    //         const headers = Object.fromEntries(
    //           Object.entries(message.headers ?? {}).map(([k, v]) => [
    //             k,
    //             v?.toString(),
    //           ]),
    //         );

    //         await this.dispatcher.dispatch(topic, payload, {
    //           topic,
    //           partition,
    //           offset: message.offset,
    //           headers,
    //           timestamp: message.timestamp,
    //           //traceContext: extracted,
    //         });
    //       });
    //     });
    //   },
    // });
  }

  /**
   * Processes a Kafka batch safely.
   */
  private async processBatch(payload: EachBatchPayload): Promise<void> {
    const {
      batch,
      resolveOffset,
      heartbeat,
      commitOffsetsIfNecessary,
      isRunning,
      isStale,
    } = payload;

    for (const message of batch.messages) {
      if (!isRunning() || isStale()) break;

      await this.processMessage(
        batch.topic,
        batch.partition,
        message,
        resolveOffset,
        heartbeat,
      );
    }

    await commitOffsetsIfNecessary();
  }

  /**
   * Processes a single Kafka message with full safety guarantees.
   */
  private async processMessage(
    topic: string,
    partition: number,
    message: KafkaMessage,
    resolveOffset: (offset: string) => void,
    heartbeat: () => Promise<void>,
  ): Promise<void> {
    const rawValue = message.value?.toString();

    if (!rawValue) {
      this.logger.warn(
        `Skipping empty Kafka message for topic=${topic} partition=${partition} offset=${message.offset}`,
      );
      resolveOffset(message.offset);
      return;
    }

    let envelope: any;

    try {
      envelope = JSON.parse(rawValue) as Record<string, unknown>;
    } catch (error) {
      this.logger.error(
        `Invalid JSON message for topic=${topic} partition=${partition} offset=${message.offset}`,
        error instanceof Error ? error.stack : undefined,
      );

      await this.retryService.handleRetry(topic, rawValue);
      resolveOffset(message.offset);
      return;
    }

    const eventId =
      typeof envelope.eventId === "string" ? envelope.eventId : undefined;


    /**
     * Idempotency check
     */
    if (eventId && (await this.idempotency.isProcessed(eventId))) {
      this.logger.debug(
        `Skipping duplicate event ${eventId} for topic=${topic} partition=${partition} offset=${message.offset}`,
      );
      resolveOffset(message.offset);
      return;
    }

    /**
     * Extract headers safely
     */
    const headers: Record<string, string | undefined> = Object.fromEntries(
      Object.entries(message.headers ?? {}).map(([key, value]) => [
        key,
        value?.toString(),
      ]),
    );

    try {
      /**
       * Protected execution via circuit breaker
       */
      await this.circuitBreaker.execute(async () => {
        await this.dispatcher.dispatch(topic, envelope.payload, {
          topic,
          partition,
          offset: message.offset,
          headers,
          timestamp: message.timestamp,
        });
      });

      /**
       * Mark event as processed AFTER successful execution
       */
      if (eventId) {
        await this.idempotency.markProcessed(eventId);
      }

      resolveOffset(message.offset);
      await heartbeat();
    } catch (error) {
      this.logger.error(
        `Message processing failed for topic=${topic} partition=${partition} offset=${message.offset}`,
        error instanceof Error ? error.stack : undefined,
      );

      /**
       * Retry logic
       */
      await this.retryService.handleRetry(topic, rawValue, headers);

      /**
       * Offset is still resolved to avoid blocking the partition.
       * Idempotency + retry topics guarantee no data loss.
       */
      resolveOffset(message.offset);
    }
  }

  /**
   * Graceful shutdown
   */
  async onModuleDestroy(): Promise<void> {
    if (!this.running) return;

    this.logger.log("Disconnecting Kafka consumer...");
    await this.consumer.disconnect();
  }
}
