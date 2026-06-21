import type { ModuleMetadata, Provider, Type } from "@nestjs/common";
import type { KafkaConfig } from "kafkajs";

export interface KafkaRetryOptions {
  maxRetries?: number;
  retryTopicSuffix?: string;
  deadLetterTopicSuffix?: string;
  initialDelayMs?: number;
  maxDelayMs?: number;
}

export interface KafkaIdempotencyOptions {
  enabled?: boolean;
  ttlSeconds?: number;
}

export interface KafkaModuleOptions {
  clientId: string;
  brokers: string[];
  groupId: string;
  serviceName?: string;
  fromBeginning?: boolean;
  retry?: KafkaRetryOptions;
  idempotency?: KafkaIdempotencyOptions;
  client?: Omit<KafkaConfig, "brokers" | "clientId">;
}

export interface KafkaModuleOptionsFactory {
  createKafkaOptions(): KafkaModuleOptions | Promise<KafkaModuleOptions>;
}

export interface KafkaModuleAsyncOptions extends Pick<
  ModuleMetadata,
  "imports"
> {
  inject?: Array<string | symbol | Type<unknown>>;
  useExisting?: Type<KafkaModuleOptionsFactory>;
  useClass?: Type<KafkaModuleOptionsFactory>;
  useFactory?: (
    ...args: any[]
  ) => KafkaModuleOptions | Promise<KafkaModuleOptions>;
  extraProviders?: Provider[];
}
