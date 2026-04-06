// src/kafka/consumer/kafka-retry.service.ts

import { Injectable, Logger } from "@nestjs/common";
import { KafkaProducerService } from "../producer/kafka-producer.service.js";

/**
 * KafkaRetryService
 *
 * Handles retry and dead-letter logic for failed Kafka messages.
 *
 * Strategy:
 * - On failure → send message to retry topic
 * - Track retry attempts via headers
 * - If max retries exceeded → send to DLQ
 *
 * Topic Convention:
 * - main topic:           ticket.create
 * - retry topic:          ticket.create.retry
 * - dead letter topic:    ticket.create.dlq
 *
 * This ensures:
 * - No message loss
 * - Controlled retry behavior
 * - Observability for failures
 */
@Injectable()
export class KafkaRetryService {
  private readonly logger = new Logger(KafkaRetryService.name);

  /**
   * Maximum retry attempts before sending to DLQ.
   */
  private readonly MAX_RETRIES = 5;

  constructor(private readonly producer: KafkaProducerService) {}

  /**
   * Handles retry logic for a failed message.
   *
   * @param topic Original topic
   * @param rawMessage Raw Kafka message value (stringified JSON)
   * @param headers Kafka headers (used for retry count)
   */
  async handleRetry(
    topic: string,
    rawMessage: string,
    headers?: Record<string, string | undefined>,
  ): Promise<void> {
    const retryCount = this.extractRetryCount(headers);

    if (retryCount >= this.MAX_RETRIES) {
      this.logger.error(`Max retries reached → sending to DLQ (${topic}.dlq)`);

      await this.sendToDLQ(topic, rawMessage, retryCount);
      return;
    }

    const nextRetry = retryCount + 1;

    this.logger.warn(
      `Retrying message (${topic}) attempt ${nextRetry}/${this.MAX_RETRIES}`,
    );

    await this.producer.rawSendWithHeaders(`${topic}.retry`, rawMessage, {
      "x-retry-count": String(nextRetry),
    });
  }

  /**
   * Sends message to Dead Letter Queue.
   *
   * @param topic Original topic
   * @param rawMessage Original message
   * @param retries Number of retries performed
   */
  private async sendToDLQ(
    topic: string,
    rawMessage: string,
    retries: number,
  ): Promise<void> {
    await this.producer.rawSendWithHeaders(`${topic}.dlq`, rawMessage, {
      "x-retry-count": String(retries),
      "x-error": "max-retries-exceeded",
    });
  }

  /**
   * Extracts retry count from Kafka headers.
   *
   * Defaults to 0 if not present.
   */
  private extractRetryCount(
    headers?: Record<string, string | undefined>,
  ): number {
    if (!headers) return 0;

    const value = headers["x-retry-count"];
    if (!value) return 0;

    const parsed = Number(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
}
