import { KafkaPayloadType, KafkaTopicType } from "./kafka-event.types.js";

export interface KafkaEnvelope<T extends KafkaTopicType = KafkaTopicType> {
  eventId: string;
  eventName: T;
  eventType?: string;
  eventVersion: string;
  service: string;
  timestamp: string;
  payload: KafkaPayloadType<T>;
}


export type EventType = 'EVENT' | 'LOG' | 'METRIC' | 'ALERT' | 'COMMAND';