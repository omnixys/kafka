import { Global, Module, DynamicModule } from "@nestjs/common";
import { DiscoveryModule } from "@nestjs/core";

import { KafkaModuleOptions } from "./kafka.options";
import { KAFKA_OPTIONS } from "./kafka.constants";

import { KafkaProducerService } from "../producer/kafka-producer.service";
import { KafkaConsumerService } from "../consumer/kafka-consumer.service";
import { kafkaBootstrapProviders } from "../kafka-bootstrap.provider";
import { KafkaEventDispatcherService } from "../dispatcher/kafka-event-dispatcher.service";

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
