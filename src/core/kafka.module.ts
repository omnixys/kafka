import { KafkaCircuitBreakerService } from "../consumer/kafka-circuit-breaker.service.js";
import { KafkaConsumerService } from "../consumer/kafka-consumer.service.js";
import { KafkaIdempotencyService } from "../consumer/kafka-idempotency.service.js";
import { KafkaRetryService } from "../consumer/kafka-retry.service.js";
import { KafkaEventDispatcherService } from "../dispatcher/kafka-event-dispatcher.service.js";
import { kafkaBootstrapProviders } from "../kafka-bootstrap.provider.js";
import { KafkaProducerService } from "../producer/kafka-producer.service.js";
import {
  KAFKA_CONSUMER,
  KAFKA_INSTANCE,
  KAFKA_OPTIONS,
  KAFKA_PRODUCER,
} from "./kafka.constants.js";
import type {
  KafkaModuleAsyncOptions,
  KafkaModuleOptions,
  KafkaModuleOptionsFactory,
} from "./kafka.options.js";
import { KafkaLifecycleService } from "./kafka-lifecycle.service.js";
import {
  type DynamicModule,
  Global,
  Module,
  type Provider,
  type Type,
} from "@nestjs/common";
import { DiscoveryModule } from "@nestjs/core";

const services = [
  KafkaProducerService,
  KafkaConsumerService,
  KafkaEventDispatcherService,
  KafkaCircuitBreakerService,
  KafkaIdempotencyService,
  KafkaRetryService,
  KafkaLifecycleService,
];

@Global()
@Module({})
export class KafkaModule {
  static forRoot(options: KafkaModuleOptions): DynamicModule {
    return this.create([
      { provide: KAFKA_OPTIONS, useValue: options },
      ...kafkaBootstrapProviders,
    ]);
  }

  static forRootAsync(options: KafkaModuleAsyncOptions): DynamicModule {
    const providers: Provider[] = [
      createAsyncOptionsProvider(options),
      ...createAsyncFactoryProviders(options),
      ...kafkaBootstrapProviders,
      ...(options.extraProviders ?? []),
    ];
    return this.create(providers, options.imports ?? []);
  }

  private static create(
    providers: Provider[],
    imports: any[] = [],
  ): DynamicModule {
    return {
      module: KafkaModule,
      imports: [...imports, DiscoveryModule],
      providers: [...providers, ...services],
      exports: [
        KAFKA_OPTIONS,
        KAFKA_INSTANCE,
        KAFKA_PRODUCER,
        KAFKA_CONSUMER,
        ...services,
      ],
    };
  }
}

function createAsyncOptionsProvider(
  options: KafkaModuleAsyncOptions,
): Provider {
  if (options.useFactory) {
    return {
      provide: KAFKA_OPTIONS,
      useFactory: options.useFactory,
      inject: options.inject ?? [],
    };
  }

  const factory = (options.useExisting ??
    options.useClass) as Type<KafkaModuleOptionsFactory>;
  if (!factory) {
    throw new Error(
      "KafkaModule.forRootAsync requires useFactory, useClass, or useExisting",
    );
  }
  return {
    provide: KAFKA_OPTIONS,
    useFactory: (value: KafkaModuleOptionsFactory) =>
      value.createKafkaOptions(),
    inject: [factory],
  };
}

function createAsyncFactoryProviders(
  options: KafkaModuleAsyncOptions,
): Provider[] {
  return options.useClass
    ? [{ provide: options.useClass, useClass: options.useClass }]
    : [];
}
