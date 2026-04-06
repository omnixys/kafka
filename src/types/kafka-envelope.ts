export interface KafkaEnvelope<T = any> {
  eventId: string;
  eventType: EventType;
  eventName: string;
  eventVersion: string;
  service: string;
  timestamp: string;
  payload: T;
}


export type EventType = 'EVENT' | 'LOG';