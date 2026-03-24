import { Inject, Injectable } from "@nestjs/common";
import { TraceContextExtractor, W3CPropagator } from "@omnixys/observability";
import type { Producer } from "kafkajs";
import { KAFKA_PRODUCER } from "../core/kafka.constants";
import type { KafkaEnvelope } from "../envelope/kafka-envelope";

import { createKafkaHeaders } from "../headers/kafka-header-builder";

@Injectable()
export class KafkaProducerService {
  constructor(
    @Inject(KAFKA_PRODUCER)
    private readonly producer: Producer,
  ) {}

  async send<T>(
    topic: string,
    envelope: KafkaEnvelope<T>,
    meta: {
      service?: string;
      version?: string;
      class?: string;
    },
  ): Promise<void> {
    const kafkaHeaders = createKafkaHeaders();

    const traceContext = TraceContextExtractor.current();

    if (traceContext) {
      new W3CPropagator().inject(kafkaHeaders);
    }

    const headers = JSON.stringify({
      ...kafkaHeaders,
      meta,
    });

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
