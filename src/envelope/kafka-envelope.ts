export interface KafkaEnvelope<T = any> {
  eventId: string;
  eventName: string;
  eventVersion: string;
  service: string;
  operation: string;
  timestamp: string;
  payload: T;
  metadata: Record<string, string>;
}
