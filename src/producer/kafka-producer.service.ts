import { Inject, Injectable } from "@nestjs/common";
import type { Producer } from "kafkajs";

import { KAFKA_PRODUCER } from "../core/kafka.constants";
import { KafkaEnvelope } from "../envelope/kafka-envelope";

import { W3CPropagator, TraceContextExtractor } from "@omnixys/observability";

import { createKafkaHeaders } from "../headers/kafka-header-builder";

@Injectable()
export class KafkaProducerService {
  constructor(
    @Inject(KAFKA_PRODUCER)
    private readonly producer: Producer,
  ) {}

  async send<T>(topic: string, envelope: KafkaEnvelope<T>): Promise<void> {
    const headers = createKafkaHeaders();

    const traceContext = TraceContextExtractor.current();

    if (traceContext) {
      new W3CPropagator().inject(headers);
    }

    await this.producer.send({
      topic,
      messages: [
        {
          value: JSON.stringify(envelope),
          headers: headers as any,
        },
      ],
      acks: -1,
    });
  }
}
