import { KafkaHeaderCarrier } from "./kafka-header-carrier";

export function createKafkaHeaders() {
  return new KafkaHeaderCarrier({});
}
