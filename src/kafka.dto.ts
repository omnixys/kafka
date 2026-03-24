import { LogLevel, TraceContextDTO } from "@omnixys/shared";
import { KafkaTopics } from "./types/kafka-topics.js";

type DeepValueOf<T> = T extends object ? DeepValueOf<T[keyof T]> : T;

export type KafkaTopic = DeepValueOf<typeof KafkaTopics>;
export type LogstreamTopic = DeepValueOf<typeof KafkaTopics.logstream>;

export interface LogDTO {
  level: LogLevel;
  message: string;
  service: string;
  operation: string;
  topic: LogstreamTopic;
  traceContext?: TraceContextDTO;
  timestamp: string;
  metadata?: Record<string, unknown>;
}
