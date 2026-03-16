import { DynamicModule, Global, Module } from "@nestjs/common";
import { DiscoveryModule } from "@nestjs/core";

import { KafkaModuleOptions } from "./kafka.config.js";
import { KAFKA_OPTIONS } from "./kafka.constants.js";
import { kafkaBootstrapProviders } from "./kafka-bootstrap.provider.js";

import { KafkaProducerService } from "./kafka-producer.service.js";
import { KafkaConsumerService } from "./kafka-consumer.service.js";
import { KafkaEventDispatcherService } from "./kafka-event-dispatcher.service.js";

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

      exports: [
        KafkaProducerService,
        KafkaConsumerService,
        KafkaEventDispatcherService,
      ],
    };
  }
}
