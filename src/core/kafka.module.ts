import { type DynamicModule, Global, Module } from "@nestjs/common";
import { DiscoveryModule } from "@nestjs/core";
import { KafkaConsumerService } from "../consumer/kafka-consumer.service";
import { KafkaEventDispatcherService } from "../dispatcher/kafka-event-dispatcher.service";
import { kafkaBootstrapProviders } from "../kafka-bootstrap.provider";
import { KafkaProducerService } from "../producer/kafka-producer.service";
import { KAFKA_OPTIONS } from "./kafka.constants";
import type { KafkaModuleOptions } from "./kafka.options";

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
      ],
      exports: [KafkaProducerService],
    };
  }
}
