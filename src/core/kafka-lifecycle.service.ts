import { KafkaConsumerService } from "../consumer/kafka-consumer.service.js";
import { KafkaProducerService } from "../producer/kafka-producer.service.js";
import { Injectable } from "@nestjs/common";

@Injectable()
export class KafkaLifecycleService {
  constructor(
    private readonly producer: KafkaProducerService,
    private readonly consumer: KafkaConsumerService,
  ) {}

  ready(): boolean {
    return this.producer.status() === "ready" && this.consumer.ready();
  }

  health() {
    const producer = this.producer.health();
    const consumer = this.consumer.health();
    return {
      healthy: producer.healthy && consumer.healthy,
      producer,
      consumer,
    };
  }

  diagnostics() {
    return {
      producer: this.producer.diagnostics(),
      consumer: this.consumer.diagnostics(),
    };
  }

  async drain(timeoutMs?: number): Promise<void> {
    await Promise.all([
      this.consumer.drain(timeoutMs),
      this.producer.drain(timeoutMs),
    ]);
  }

  async close(): Promise<void> {
    const results = await Promise.allSettled([
      this.consumer.close(),
      this.producer.close(),
    ]);
    const failures = results.filter(
      (result): result is PromiseRejectedResult => result.status === "rejected",
    );
    if (failures.length > 0) {
      throw new AggregateError(
        failures.map((failure) => failure.reason),
        "Kafka shutdown failed",
      );
    }
  }

  shutdown(): Promise<void> {
    return this.close();
  }
}
