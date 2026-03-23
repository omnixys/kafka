import {
  Inject,
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
} from "@nestjs/common";
import type { Consumer } from "kafkajs";

import { KAFKA_CONSUMER } from "../core/kafka.constants";
import { KafkaEventDispatcherService } from "../dispatcher/kafka-event-dispatcher.service";

import { W3CPropagator } from "@omnixys/observability";
import { KafkaHeaderCarrier } from "../headers/kafka-header-carrier";

@Injectable()
export class KafkaConsumerService implements OnModuleInit, OnModuleDestroy {
  private running = false;

  constructor(
    @Inject(KAFKA_CONSUMER)
    private readonly consumer: Consumer,
    private readonly dispatcher: KafkaEventDispatcherService,
  ) {}

  async onModuleInit() {
    const topics = this.dispatcher.getRegisteredTopics();
    if (!topics.length) return;

    await this.consumer.subscribe({ topics });

    this.running = true;

    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const headers = new KafkaHeaderCarrier(message.headers as any);

        const context = new W3CPropagator().extract(headers);

        const value = message.value?.toString();
        if (!value) return;

        const payload = JSON.parse(value);

        await this.dispatcher.dispatch(topic, payload, {
          topic,
          partition,
          offset: message.offset,
          headers: Object.fromEntries(
            Object.entries(message.headers ?? {}).map(([k, v]) => [
              k,
              v?.toString(),
            ]),
          ),
          timestamp: message.timestamp,
          traceContext: context,
        });
      },
    });
  }

  async onModuleDestroy() {
    if (!this.running) return;
    await this.consumer.disconnect();
  }
}
