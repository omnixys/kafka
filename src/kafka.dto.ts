import { LogLevel, TraceContext } from "@omnixys/shared";
import { KafkaTopics } from "./kafka-topics.js";


type DeepValueOf<T> = T extends object ? DeepValueOf<T[keyof T]> : T;

export type KafkaTopic = DeepValueOf<typeof KafkaTopics>;
export type LogstreamTopic = DeepValueOf<typeof KafkaTopics.logstream>;


export interface LogDTO {
  level: LogLevel;
  message: string;
  service: string;
  operation: string;
  topic: LogstreamTopic;
  traceContext?: TraceContext;
  timestamp: string;
  metadata?: Record<string, unknown>;
}
