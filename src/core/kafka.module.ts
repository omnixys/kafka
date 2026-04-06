import { type DynamicModule, Global, Module } from "@nestjs/common";
import { DiscoveryModule } from "@nestjs/core";
import { KafkaConsumerService } from "../consumer/kafka-consumer.service.js";
import { KafkaEventDispatcherService } from "../dispatcher/kafka-event-dispatcher.service.js";
import { kafkaBootstrapProviders } from "../kafka-bootstrap.provider.js";
import { KafkaProducerService } from "../producer/kafka-producer.service.js";
import { KAFKA_OPTIONS } from "./kafka.constants.js";
import type { KafkaModuleOptions } from "./kafka.options.js";
import { KafkaRetryService } from "../consumer/kafka-retry.service.js";
import { KafkaIdempotencyService } from "../consumer/kafka-idempotency.service.js";
import { KafkaCircuitBreakerService } from "../consumer/kafka-circuit-breaker.service.js";

@Global()
@Module({})
export class KafkaModule {
  static forRoot(options: KafkaModuleOptions): DynamicModule {
    return {
      module: KafkaModule,
      imports: [DiscoveryModule],
      providers: [
        {
          provide: KAFKA_OPTIONS,
          useValue: options,
        },
        ...kafkaBootstrapProviders,
        KafkaProducerService,
        KafkaConsumerService,
        KafkaEventDispatcherService,

        KafkaCircuitBreakerService,
        KafkaIdempotencyService,
        KafkaRetryService,
      ],
      exports: [KafkaProducerService],
    };
  }
}
